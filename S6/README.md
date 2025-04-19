# S6 Orchestration & Keynote Integration

## Overview

The `S6` module is an AI-powered orchestration framework that automates complex, multi-step tasks using a decision-action loop. It integrates with Apple Keynote via AppleScript, allowing automated writing of results (with color customization) directly into Keynote slides. The system is extensible, supporting a variety of tools (math, string, and OS actions) and a structured memory module for iterative reasoning.

## Key Features
- **Decision-Action Loop**: Uses an LLM to decide which tool to call next based on task facts and memory.
- **Apple Keynote Automation**: Write text with custom colors into Keynote slides using AppleScript.
- **Extensible Toolchain**: Includes math, string, and file/image tools; easy to add more.
- **Structured Memory**: Summarizes each iteration and feeds it back to the LLM for context-aware reasoning.
- **Robust Error Handling**: Clear logging and graceful handling of invalid LLM outputs.

## Directory Structure
```
S6/
├── act.py            # Executes tool actions
├── decision.py       # LLM-based decision logic
├── mcp_orch.py       # Main orchestration loop
├── mcp_server.py     # Server for tool execution (incl. Keynote integration)
├── memory.py         # Memory module for summarizing iterations
├── percieve.py       # Perception/extraction logic
├── README.md         # This documentation
```

## Setup Instructions
1. **Clone the repository** and navigate to `S6`:
   ```bash
   git clone https://github.com/santule/EAG.git
   cd EAG/S6
   ```
2. **Install dependencies** (preferably in a virtual environment):
   ```bash
   pip install -r ../requirements.txt
   ```
   (Adjust path if requirements are elsewhere.)
3. **Environment Variables**: Create a `.env` file if needed for API keys or config.
4. **Apple Keynote**: Ensure Keynote is installed and accessible on your Mac for automation features.

## Usage Example
Run the main orchestrator:
```bash
python mcp_orch.py
```
- The system will perceive a task, reason through the required steps, call the appropriate tools, and write results into Keynote (if required).
- Iterative memory is built up and used for context-aware decisions.

## Extending S6
- **Add a New Tool**: Implement its logic in `act.py` and update the tool list.
- **Modify Memory**: Update `memory.py` to change how iteration summaries are generated or stored.
- **Add Integrations**: Extend `mcp_server.py` for new automation targets (e.g., other apps).

## Notes
- Requires macOS for Keynote automation.
- Designed for transparency and extensibility; logs each decision and action.

## License
See the root project for licensing details.

---
For questions or contributions, please open an issue or PR on [GitHub](https://github.com/santule/EAG).
