# S7: MCQ Generation & Keynote Automation

This module provides tools and scripts for generating multiple-choice questions (MCQs) on machine learning topics and automating their insertion into Apple Keynote presentations using AppleScript and Python.

## Features
- **Generate MCQs**: Automatically create MCQs from a pool of machine learning topics.
- **Format for Keynote**: Convert MCQ data structures into readable, presentation-ready text.
- **Apple Keynote Automation**: Use AppleScript (invoked via Python) to paste questions and answers into Keynote slides, including custom title and body formatting.
- **Agent Integration**: Supports agent-driven workflows for generating and inserting questions in response to user intent.

## Key Scripts & Tools
- `mcp_server.py`: Main server/toolbox for MCQ generation, formatting, and AppleScript automation.
- `agent.py`: Agent interface for interactive MCQ generation and Keynote writing.
- `topics.json`: List of supported machine learning topics for MCQ generation.

## Usage
### 1. Generate and Insert MCQs into Keynote
- Run the agent or call the relevant tool to generate MCQs.
- The script will open Keynote (if not already open), create a new slide, set the title (e.g., "PRACTICE QUESTIONS"), and paste the formatted MCQs into the slide body.

### 2. Manual Testing
- You can manually test the AppleScript automation by running a Python script that:
  - Formats your MCQs as text
  - Escapes for AppleScript
  - Pastes the content into Keynote using `osascript`

### 3. Customization
- Font size, slide title, and body formatting can be adjusted in the AppleScript section of the code.
- To split questions across multiple slides or change layouts, modify the AppleScript logic in `mcp_server.py` or your test script.

## Requirements
- **Python 3.x**
- **Apple Keynote** (macOS only)

## Example: Writing to Keynote
```python
# Example AppleScript call from Python
applescript = '''
tell application "Keynote"
    activate
    if (count of documents) = 0 then
        set newDoc to make new document
    else
        set newDoc to front document
    end if
    tell newDoc
        set newSlide to make new slide at end of slides
        tell newSlide
            set theTitleItem to first text item
            set the object text of theTitleItem to "PRACTICE QUESTIONS"
            set the size of the object text of theTitleItem to 32
            set theBodyItem to second text item
            set the object text of theBodyItem to "...MCQ content..."
            set the size of the object text of theBodyItem to 16
        end tell
    end tell
end tell
'''
```

## File Structure
- `mcp_server.py` — Main MCQ/Keynote automation logic
- `agent.py` — Agent interface
- `topics.json` — List of topics for MCQs
- `README.md` — This documentation

## Troubleshooting
- If you see AppleScript errors, check that the slide layout has both title and body text items.
- For large MCQ content, reduce font size or split across slides for readability.

## License
MIT License (or specify your own)

---

For further customization or automation, edit the AppleScript logic in `mcp_server.py` or ask the agent for advanced workflows.
