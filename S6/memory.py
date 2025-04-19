from pydantic import BaseModel
from typing import Any, Dict

class MemoryInput(BaseModel):
    iteration: int
    function_name: str
    arguments: Dict[str, Any]
    result: Any

class MemoryOutput(BaseModel):
    summary: str
    
async def memory(input: MemoryInput) -> MemoryOutput:
    """Summarizes the memory for an iteration and returns a MemoryOutput object."""
    summary = (f"In the {input.iteration + 1} iteration you called {input.function_name} "
               f"with {input.arguments} parameters, and the function returned {input.result}.")
    return MemoryOutput(summary=summary)