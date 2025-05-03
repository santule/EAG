import warnings
warnings.filterwarnings("ignore")

from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
#from google import genai
import google.generativeai as genai
import re

# Optional: import log from agent if shared, else define locally
try:
    from agent import log
except ImportError:
    import datetime
    def log(stage: str, msg: str):
        now = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"[{now}] [{stage}] {msg}")

load_dotenv()

#client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

api_key = os.getenv("GEMINI_API_KEY")
client = genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')


class PerceptionResult(BaseModel):
    user_input: str
    intent: Optional[str]
    questions: int
    difficulty: str
    write_to_application: Optional[str] = None
    tool_hint: Optional[str] = None


def extract_perception(user_input: str) -> PerceptionResult:
    """Extracts intent, values, and tool hints using LLM"""

    prompt = f"""
You are an AI that generates Multiple Choice Questions based on the documents available.
The user will input the number of questions they want to generate. 
Input: "{user_input}"

Return the response as a Python dictionary with keys:
- intent: (brief phrase about what the user wants)
- questions: number of questions user wants to generate
- difficulty: difficulty level of the questions (easy, medium, hard)
- write_to_application: (name of the application to write to, if any). If no application to write to then return "None" and just return the mcqs.
- tool_hint: (name of the MCP tool that might be useful, if any). If no tool hint then return "None".

Output only the dictionary on a single line. Do NOT wrap it in ```json or other formatting.
    """

    try:
        response = model.generate_content(
            contents=prompt
        )
        raw = response.text.strip()
        #log("perception", f"LLM output: {raw}")

        # Strip Markdown backticks if present
        clean = re.sub(r"^```json|```$", "", raw.strip(), flags=re.MULTILINE).strip()

        try:
            parsed = eval(clean)
        except Exception as e:
            log("perception", f"⚠️ Failed to parse cleaned output: {e}")
            raise

        # Fix common issues
        if isinstance(parsed.get("entities"), dict):
            parsed["entities"] = list(parsed["entities"].values())


        return PerceptionResult(user_input=user_input, **parsed)

    except Exception as e:
        log("perception", f"⚠️ Extraction failed: {e}")
        return PerceptionResult(user_input=user_input)
