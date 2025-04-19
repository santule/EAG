import json
from pydantic import BaseModel
from helpers import call_llm
import re
from typing import Optional

class DecisionOutput(BaseModel):
    function_name: str
    arguments: dict

class DecisionInput(BaseModel):
    tools_description: str
    facts: str
    memory: Optional[str] = None

async def decide(input: DecisionInput) -> DecisionOutput:
    """Decide what to do next based on facts."""
    
    prompt = f""" You an agent solving tasks and you have multiple tools available at your disposal. The tools available are {input.tools_description}.
    Decide what to do next based on the following facts:
    {input.facts} and return a JSON object with fields: function_name, arguments. {input.memory}"""
    
    print(prompt)
    response_text = await call_llm(prompt)
    print(response_text)

    # Extract JSON from code block if present
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text, re.IGNORECASE)
    if code_block_match:
        json_str = code_block_match.group(1)
    else:
        # fallback: try to find the first curly-brace block
        match = re.search(r"\{[\s\S]*\}", response_text)
        if not match:
            raise ValueError(f"No JSON object found in LLM response: {response_text}")
        json_str = match.group(0)
    # Clean up JSON string
    json_str = json_str.strip()
    # Replace single quotes with double quotes if needed
    if "'" in json_str and '"' not in json_str:
        json_str = json_str.replace("'", '"')
    # Remove trailing commas (which are invalid in JSON)
    json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
    try:
        data = json.loads(json_str)
    except Exception as e:
        print(f"Failed to parse JSON: {json_str}")
        raise
    return DecisionOutput(**data)
