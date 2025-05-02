# YodaMCQ Telegram Bot

YodaMCQ is a Telegram bot that allows users to request multiple-choice questions (MCQs) on machine learning topics directly through chat. The bot leverages Retrieval-Augmented Generation (RAG) and Google's Gemini LLM to generate high-quality, contextually relevant MCQs in real time.

## Features
- **Telegram Bot Interface**: Interact with YodaMCQ on Telegram to request MCQs on demand.
- **Generate MCQs**: Automatically create MCQs from a pool of machine learning topics, tailored to difficulty and user intent.
- **Retrieval-Augmented Generation (RAG)**: Uses document retrieval to ground questions in your own knowledge base.
- **Google Gemini LLM**: Generates diverse, high-quality questions and explanations.
- **Presentation Formatting**: Converts MCQ data structures into readable, presentation-ready text.
- **Agent Integration**: Supports agent-driven workflows for generating and inserting questions in response to user intent.

## Key Scripts & Tools
- `telegrambot.py`: Main entry point for the YodaMCQ Telegram bot.
- `mcq_agent.py`: Agent logic for MCQ generation and RAG workflow.
- `mcp_server.py`: Toolbox for MCQ generation, formatting, and document processing.
- `topics.json`: List of supported machine learning topics for MCQ generation.

## Usage
### 1. Start the Telegram Bot
Run the following command in your terminal:

```bash
python telegrambot.py
```

### 2. Interact with YodaMCQ
- Open Telegram and start a chat with your bot.
- Request MCQs by sending messages like:
  - `generate 3 easy questions`
  - `give me 5 hard MCQs on neural networks`
- The bot will reply with MCQs and explanations generated using RAG and Gemini LLM.

## Requirements
- Python 3.8+
- [python-telegram-bot](https://python-telegram-bot.org/)
- Google Gemini API access
- Other dependencies as listed in `requirements.txt`

## Notes
- Ensure your Gemini API key is configured properly for LLM access.
- The bot can be extended to support more topics, answer formats, or integrations.

## File Structure
- `telegrambot.py` — Main Telegram bot logic
- `mcq_agent.py` — Agent interface for MCQ generation and RAG
- `mcp_server.py` — Toolbox for MCQ generation, formatting, and document processing
- `topics.json` — List of topics for MCQs
- `README.md` — This documentation

## Troubleshooting
- If you see errors, check that your API keys are configured correctly.
- For large MCQ content, reduce font size or split across slides for readability.

## License
MIT License (or specify your own)

---
For further customization or automation, edit the bot logic in `telegrambot.py` or ask the agent for advanced workflows.
