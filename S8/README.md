# YodaMCQ Telegram Bot


YodaMCQ is a Telegram bot that allows users to request multiple-choice questions (MCQs) on machine learning topics directly through chat. The bot leverages Retrieval-Augmented Generation (RAG) and Google's Gemini LLM to generate high-quality, contextually relevant MCQs in real time.

## Overview
This application enables seamless MCQ (Multiple Choice Question) generation and delivery using a combination of a Telegram bot, an SSE (Server-Sent Events) server, and an agent with Retrieval-Augmented Generation (RAG) capabilities. The agent can output MCQs either to a local Apple Keynote presentation or to a Google Sheet.

## Architecture
- **Telegram Bot**: Users interact with the system by sending requests (e.g., for MCQs) via Telegram. The bot forwards these requests to the SSE server.
- **SSE Server**: Receives requests from the Telegram bot and broadcasts them to all connected SSE clients.
- **Agent (SSE Client)**: Listens for incoming requests from the SSE server. Upon receiving a request, the agent:
  - Uses RAG and Google's Gemini LLM to generate high-quality, contextually relevant MCQs.
  - Dumps the generated MCQs either into a local Keynote presentation or a Google Sheet, based on user/application intent.

## Features
- **End-to-End MCQ Generation**: From user request (Telegram) to delivery (Keynote/Google Sheets).
- **Retrieval-Augmented Generation (RAG)**: Ensures questions are grounded in your knowledge base.
- **Flexible Output**: MCQs can be written to Apple Keynote (for presentations) or to Google Sheets (for record-keeping/sharing).
- **SSE Integration**: Real-time, decoupled communication between bot, server, and agent.
- **Google Gemini LLM**: Generates diverse, high-quality questions and explanations.

## Usage
1. Start the SSE server (`sse_server.py`).
2. Run the agent (`agent.py`) to listen for SSE requests.
3. Use the Telegram bot to send MCQ requests.
4. The agent will generate MCQs and write them to the target application (Keynote or Google Sheets).

## Requirements
- Python 3.10+
- Flask, gspread, oauth2client, sseclient, Gemini LLM access, and other dependencies (see `pyproject.toml`)
- Google Sheets API credentials (for Sheets integration)
- Apple Keynote (for Keynote integration)

## Project Structure
- `agent.py` — Agent logic, SSE client, MCQ generation, output handling
- `mcp_server.py` — Tool definitions, Google Sheets/Keynote integration
- `sse_server.py` — SSE server
- `telegrambot.py` — Telegram bot logic
- `models.py` — Pydantic models for MCQs and tool inputs/outputs
- `decision.py`, `perception.py`, `memory.py` — Core agent logic

## How it Works
1. **User** sends a request (e.g., "Generate 3 easy MCQs on SVM") via Telegram.
2. **Telegram Bot** sends the request to the SSE server.
3. **Agent** (SSE client) receives the request, generates MCQs using RAG and Gemini LLM, and writes the result to Keynote or Google Sheets.

## Troubleshooting
- If you see errors, check that your API keys are configured correctly.
- For large MCQ content, reduce font size or split across slides for readability.

## License
MIT License (or specify your own)

---
For further customization or automation, edit the bot logic in `telegrambot.py` or ask the agent for advanced workflows.
