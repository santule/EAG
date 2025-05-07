# modules/tools.py

from typing import List, Dict, Optional, Any
import re

def clean_text(raw_text):
    # Step 1: Remove irrelevant sections (e.g., company history, long unrelated paragraphs)
    raw_text = re.split(r"\*\*Interim Order.*?Page \d+ of \d+\*\*", raw_text)[0]

    # Step 2: Replace markup-like artifacts
    cleaned = raw_text.replace("meta=None content=[TextContent(type='text', text='", "") \
                      .replace("Result: ", "") \
                      .replace("  Result:", "") \
                      .replace("Result:", "") \
                      .replace("FURTHER_PROCESSING_REQUIRED:", "") \
                      .replace("meta=None", "") \
                      .replace("TextContent(type='text', text=", "") \
                      .replace("TextContent(type='text', text=\'{\"result\": ", "") \
                      .replace("annotations=None)", "") \
                      .replace("[Source:", "\n[Source:") \
                      .replace("\\n", "\n")

    # Step 3: Remove nested metadata and format characters
    cleaned = re.sub(r"\[TextContent\(.*?text='", "", cleaned)
    cleaned = re.sub(r"'\],?", "", cleaned)
    cleaned = re.sub(r"\*\*\*.*?\*\*\*", "", cleaned)
    cleaned = re.sub(r"###\s*\d+\.\s*", "", cleaned)  # Remove '### 31.' style headings
    cleaned = re.sub(r"\|\|", "|", cleaned)
    cleaned = re.sub(r"\|+", "|", cleaned)

    # Step 4: Extract key entity rows (e.g. Gensol, Capbridge, DLF, loans)
    entity_lines = []
    for line in cleaned.splitlines():
        if re.search(r'(Gensol|Capbridge|DLF|loan|Crore|IREDA|Rs\.)', line, re.IGNORECASE):
            entity_lines.append(line.strip())

    # Step 5: Format output
    final_text = "\n".join(entity_lines)
    return final_text.strip()

def extract_json_block(text: str) -> str:
    match = re.search(r"```json\n(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


def summarize_tools(tools: List[Any]) -> str:
    """
    Generate a string summary of tools for LLM prompt injection.
    Format: "- tool_name: description"
    """
    return "\n".join(
        f"- {tool.name}: {getattr(tool, 'description', 'No description provided.')}"
        for tool in tools
    )


def filter_tools_by_hint(tools: List[Any], hint: Optional[str] = None) -> List[Any]:
    """
    If tool_hint is provided (e.g., 'search_documents'),
    try to match it exactly or fuzzily with available tool names.
    """
    if not hint:
        return tools

    hint_lower = hint.lower()
    filtered = [tool for tool in tools if hint_lower in tool.name.lower()]
    return filtered if filtered else tools


def get_tool_map(tools: List[Any]) -> Dict[str, Any]:
    """
    Return a dict of tool_name → tool object for fast lookup
    """
    return {tool.name: tool for tool in tools}

def tool_expects_input(self, tool_name: str) -> bool:
    tool = next((t for t in self.tools if t.name == tool_name), None)
    if not tool or not hasattr(tool, 'parameters') or not isinstance(tool.parameters, dict):
        return False
    # If the top-level parameter is just 'input', we assume wrapping is required
    return list(tool.parameters.keys()) == ['input']


def load_prompt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
