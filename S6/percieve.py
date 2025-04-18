from pydantic import BaseModel
import json
import re
from helpers import call_llm


class PerceptionOutput(BaseModel):
    task: str
    color: str
    application: str


class PerceptionInput(BaseModel):
    user_input: str

async def extract_facts(input: PerceptionInput) -> PerceptionOutput:
    """Extracts facts from user input and parses them into a Pydantic model."""
    
    prompt = f"""Extract key facts from the following sentence and return a JSON object with fields:
    task, color, application. Only return a valid JSON object.
    {input.user_input} """
    
    response_text = await call_llm(prompt)

    # Remove code block markers if present
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text, re.IGNORECASE)
    if code_block_match:
        json_str = code_block_match.group(1)
    else:
        # fallback to previous regex
        match = re.search(r"\{[\s\S]*?\}", response_text)
        if not match:
            raise ValueError("No JSON object found in LLM response")
        json_str = match.group(0)
    data = json.loads(
        json_str,
        object_hook=lambda d: d,
    )
    return PerceptionOutput(**data)