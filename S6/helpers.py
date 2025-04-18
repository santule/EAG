import os
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters, types
from mcp.client.stdio import stdio_client
import asyncio
import google.generativeai as genai
from concurrent.futures import TimeoutError


# Load environment variables from .env file
load_dotenv()

# Access your API key
api_key = os.getenv("GEMINI_API_KEY")
client = genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')


async def generate_with_timeout(prompt, timeout=10):
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


async def call_llm(prompt: str):
    """Get response from LLM with timeout"""
    response = await generate_with_timeout(prompt)
    if response and response.text:
        return response.text.strip()
    return None