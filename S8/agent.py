import warnings
warnings.filterwarnings("ignore")

import asyncio
import time
import os
import datetime
from perception import extract_perception
from memory import MemoryManager, MemoryItem
from decision import generate_plan
from action import execute_tool
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
# use this to connect to running server

import shutil
import sys

# --- SSE CLIENT IMPORTS ---
import threading
import requests
try:
    import sseclient
except ImportError:
    print("[agent] sseclient-py not installed. Please run: pip install sseclient-py")
    sys.exit(1)

def log(stage: str, msg: str):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] [{stage}] {msg}")

max_steps = 3

def agent_main(user_input: str):
    asyncio.run(main(user_input))

async def main(user_input: str):
    try:
        print("[agent] Starting agent...")
        server_params = StdioServerParameters(
            command="python",
            args=["mcp_server.py"],
            cwd="/Users/Shared/projects/EAG/S8"
        )

        try:
            async with stdio_client(server_params) as (read, write):
                print("Connection established, creating session...")
                try:
                    async with ClientSession(read, write) as session:
                        print("[agent] Session created, initializing...")
                        try:
                            await session.initialize()
                            print("[agent] MCP session initialized")
                            tools = await session.list_tools()
                            tools_result = await session.list_tools()
                            tools = tools_result.tools
                            tool_descriptions = "\n".join(
                                f"- {tool.name}: {getattr(tool, 'description', 'No description')}" 
                                for tool in tools
                            )
                            memory = MemoryManager()
                            session_id = f"session-{int(time.time())}"
                            query = user_input  # Store original intent
                            step = 0
                            while step < max_steps:
                                print("STEP:", step)
                                perception = extract_perception(user_input)
                                print("PERCEPTION:", perception)

                                retrieved = memory.retrieve(query=user_input, top_k=3, session_filter=session_id)
                                #print("memory", f"Retrieved {len(retrieved)} relevant memories")

                                plan = generate_plan(perception, retrieved, tool_descriptions=tool_descriptions)
                                print("PLAN:", plan)

                                if plan.startswith("FINAL_ANSWER:"):
                                    log("agent", f"✅ FINAL RESULT: {plan}")
                                    break
                                try:
                                    result = await execute_tool(session, tools, plan)
                                    log("tool", f"{result.tool_name} returned: {result.result}")
                                    memory.add(MemoryItem(
                                        text=f"Tool call: {result.tool_name} with {result.arguments}, got: {result.result}",
                                        type="tool_output",
                                        tool_name=result.tool_name,
                                        user_query=user_input,
                                        tags=[result.tool_name],
                                        session_id=session_id
                                    ))
                                    user_input = f"Original task: {query}\nPrevious output: {result.result}\nWhat should I do next?"
                                except Exception as e:
                                    log("error", f"Tool execution failed: {e}")
                                    break
                                step += 1
                        except Exception as e:
                            print(f"[agent] Session initialization error: {str(e)}")
                except Exception as e:
                    print(f"[agent] Session creation error: {str(e)}")
        except Exception as e:
            print(f"[agent] Connection error: {str(e)}")
    except Exception as e:
        print(f"[agent] Overall error: {str(e)}")

# --- SSE LISTENER THREAD ---
def listen_to_sse(url):
    print(f"[agent] Connecting to SSE server at {url}")
    try:
        with requests.get(url, stream=True) as response:
            client = sseclient.SSEClient(response)
            for event in client.events():
                print(f"[agent] Received SSE message: {event.data}")
                # Call the agent on each new message (in a new thread to avoid blocking)
                threading.Thread(target=agent_main, args=(event.data,)).start()
    except Exception as e:
        print(f"[agent] SSE connection error: {e}")

if __name__ == "__main__":
    sse_url = "http://127.0.0.1:5000/events"
    print("[agent] Starting SSE listener and agent...")
    # Start SSE listener (runs forever, spawns agent_main for each message)
    listen_to_sse(sse_url)