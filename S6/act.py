from pydantic import BaseModel
from mcp import ClientSession

class ActOutput(BaseModel):
    result: str

class ActInput(BaseModel):
    session: ClientSession
    function_name: str
    arguments: dict

    model_config = {
        "arbitrary_types_allowed": True
    }

async def act(input: ActInput) -> ActOutput:
    """Run Python functions based on the function name and arguments."""
    
    result = await input.session.call_tool(input.function_name, arguments=input.arguments)
    
    if hasattr(result, 'content'):
        # Handle multiple content items
        if isinstance(result.content, list):
            iteration_result = [
                item.text if hasattr(item, 'text') else str(item)
                for item in result.content
            ]
            iteration_result = ", ".join(iteration_result)
        else:
            iteration_result = str(result.content)
    else:
        iteration_result = str(result)
    print(iteration_result)
    return ActOutput(result=iteration_result)
