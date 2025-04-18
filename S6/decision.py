import json
from pydantic import BaseModel
from helpers import call_llm
import re

class DecisionOutput(BaseModel):
    function_name: str
    arguments: dict

class DecisionInput(BaseModel):
    tools_description: str
    facts: str

async def decide(input: DecisionInput) -> DecisionOutput:
    """Decide what to do next based on facts."""
    
    prompt = f""" You an agent solving tasks and you have multiple tools available at your disposal. The tools available are {input.tools_description}.
    Decide what to do next based on the following facts:
    {input.facts} and return a JSON object with fields: function_name, arguments. Only return a valid JSON object."""
    
    response_text = await call_llm(prompt)
    print(response_text)

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
    return DecisionOutput(**data)
