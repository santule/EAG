# MCP Calculator Service

A powerful calculator service built with FastMCP and Gemini AI integration. This service provides both basic arithmetic operations and advanced mathematical functions, along with some unique utilities.

## Features

### Basic Operations
- Addition (single numbers and lists)
- Subtraction
- Multiplication
- Division
- Power operations

### Advanced Mathematical Functions
- Square root
- Cube root
- Factorial
- Logarithm
- Trigonometric functions (sin, cos, tan)
- Fibonacci sequence generation

### Utility Functions
- Image thumbnail creation
- String to ASCII conversion
- Exponential sum calculations
- Rectangle drawing in Paint
- Apple Keynote integration

## Project Structure

- `mcp_server.py` - Main server implementation with all calculator tools and utilities
- `mcp_orch.py` - Orchestrator with Gemini AI integration for enhanced capabilities

## Requirements

- Python 3.x
- FastMCP library
- Google Gemini AI SDK
- PIL (Python Imaging Library)
- python-dotenv

## Environment Setup

1. Create a `.env` file in the project root
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Service

### Development Mode
```bash
python mcp_server.py dev
```

### Production Mode
```bash
python mcp_server.py
```

The orchestrator can be started with:
```bash
python mcp_orch.py
```

## Architecture

The service is built on a client-server architecture:
- `FastMCP` server handles all mathematical operations and utility functions
- Gemini AI integration provides enhanced capabilities through the orchestrator
- Async operation handling with timeout protection
- State management for maintaining conversation context