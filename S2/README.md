# CodeLens AI - Code Analysis Chrome Extension

CodeLens AI is a powerful Chrome extension that uses Google's Gemini AI to analyze code snippets directly from your browser. Get instant insights about code functionality, potential improvements, security vulnerabilities, and performance characteristics.

<img width="1257" alt="Image" src="https://github.com/user-attachments/assets/3317bf92-664e-4f7f-88a5-38b82785adec" />

## Features

- 🔍 **Code Analysis**: Select any code on a webpage and get instant analysis
- 🎯 **Multiple Analysis Types**:
  - Code Explanation: Understand purpose, implementation, and components
  - Code Improvements: Get suggestions for better code quality and patterns
  - Security Analysis: Identify vulnerabilities and security best practices
  - Complexity Analysis: Understand time/space complexity and performance
- 💡 **Smart Formatting**: Results are formatted in clear sections with markdown support
- 🎨 **Syntax Highlighting**: Code snippets are beautifully highlighted
- ⚡ **Fast & Responsive**: Instant feedback with a clean loading indicator

## Installation

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Click the extension icon and set your Gemini API key in the options

## Usage

1. Visit any webpage with code snippets
2. Select the code you want to analyze
3. Click the CodeLens AI extension icon
4. Choose your analysis type:
   - Explain Code
   - Suggest Improvements
   - Security Analysis
   - Complexity Analysis
5. Click "Analyze" and get instant insights!

## Requirements

- Google Chrome browser
- Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Files

- `popup.html` - Extension popup interface
- `popup.js` - Main extension logic
- `background.js` - Background service worker
- `content.js` - Content script for webpage interaction
- `styles.css` - Extension styling
- `manifest.json` - Extension configuration
- `marked.min.js` - Markdown parsing
- `prism.js/css` - Syntax highlighting

## Development

To modify the extension:

1. Make your changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Click the refresh icon on the extension card

## Privacy & Security

- All code analysis is performed using Google's Gemini API
- Your API key is stored securely in Chrome's sync storage
- No code snippets are stored or logged
- The extension only accesses the current active tab when analyzing code

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

MIT License - feel free to use this code in your own projects!
