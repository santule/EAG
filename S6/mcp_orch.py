import os
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio
import google.generativeai as genai
from concurrent.futures import TimeoutError
from percieve import extract_facts, PerceptionInput
from decision import decide,DecisionInput
from act import act,ActInput
    
# Load environment variables from .env file
load_dotenv()

# Access your API key and initialize Gemini client correctly
api_key = os.getenv("GEMINI_API_KEY")
client = genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

max_iterations = 4
last_response = None
iteration = 0
iteration_response = []

async def generate_with_timeout(client, prompt, timeout=10):
    """Generate content with a timeout"""
    print("Starting LLM generation...")
    try:
        # Convert the synchronous generate_content call to run in a thread
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(
                None, 
                lambda: model.generate_content(
                    contents=prompt
                )
            ),
            timeout=timeout
        )
        print("LLM generation completed")
        return response
    except TimeoutError:
        print("LLM generation timed out!")
        raise
    except Exception as e:
        print(f"Error in LLM generation: {e}")
        raise

def reset_state():
    """Reset all global variables to their initial state"""
    global last_response, iteration, iteration_response
    last_response = None
    iteration = 0
    iteration_response = []

async def main():
    reset_state()  # Reset at the start of main
    print("Starting main execution...")

    # user query
    query = """Find the ASCII values of characters in INDIA and then return sum of exponentials of those values and write it in Keynote application in red color."""
    
    # percieve
    print("*********PERCIEVE*********")
    facts = await extract_facts(PerceptionInput(user_input=query))
    print(facts)
    
    # decide
    # get mcp tool lists available to the agent
    try:
        # Create a single MCP server connection
        #print("Establishing connection to MCP server...")
        server_params = StdioServerParameters(
            command="python",
            args=["mcp_server.py"]
        )

        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                # Get available tools
                tools_result = await session.list_tools()
                tools = tools_result.tools
                
                try:            
                    tools_description = []
                    for i, tool in enumerate(tools):
                        try:
                            params = tool.inputSchema
                            desc = getattr(tool, 'description', 'No description available')
                            name = getattr(tool, 'name', f'tool_{i}')
                            
                            # Format the input schema in a more readable way
                            if 'properties' in params:
                                param_details = []
                                for param_name, param_info in params['properties'].items():
                                    param_type = param_info.get('type', 'unknown')
                                    param_details.append(f"{param_name}: {param_type}")
                                params_str = ', '.join(param_details)
                            else:
                                params_str = 'no parameters'

                            tool_desc = f"{i+1}. {name}({params_str}) - {desc}"
                            tools_description.append(tool_desc)
                        except Exception as e:
                            tools_description.append(f"{i+1}. Error processing tool")
                    
                    tools_description = "\n".join(tools_description)
                except Exception as e:
                    #print(f"Error creating tools description: {e}")
                    tools_description = "Error loading tools"
                
                print("Starting iteration loop...")
                
                # Use global iteration variables
                global iteration, last_response
                while iteration < max_iterations:
                    print(f"\n--- Iteration {iteration + 1} ---")

                    print("*********DECIDE*********")
                    decision = await decide(DecisionInput(tools_description=tools_description, facts=facts.model_dump_json()))
                    print(decision)
                    
                    print("*********ACT*********")
                    actionresult = await act(ActInput(session=session, function_name=decision.function_name, arguments=decision.arguments))
                    print(actionresult)    
                        
                    break
                    
    except Exception as e:
        print(f"Error in main execution: {e}")
        import traceback
        traceback.print_exc()
    finally:
        reset_state()  # Reset at the end of main

if __name__ == "__main__":
    asyncio.run(main())
    
    
