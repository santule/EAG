# Stoic Mentor Chrome Extension

A Chrome extension that provides daily wisdom from Marcus Aurelius's *Meditations*, offering modern interpretations and practical exercises for contemporary life.

## Features

- 📚 **Daily Passages**: Read through Marcus Aurelius's *Meditations* one passage at a time
- 🔄 **Modern Interpretations**: Get contemporary explanations of ancient wisdom using Gemini AI
- 💪 **Daily Exercises**: Receive practical exercises to apply Stoic principles in your daily life
- 📖 **Progress Tracking**: Automatically saves your reading position
- 🎯 **Simple Navigation**: Easy-to-use interface with next passage and restart book options

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Usage

1. Click the Stoic Mentor icon in your Chrome toolbar
2. On first use, enter your Gemini API key
3. Read the current passage from *Meditations*
4. Review the modern interpretation and suggested daily exercise
5. Click "Next Passage" to continue reading
6. Use "Restart Book" to return to the beginning

## Technical Details

### Architecture
- **Frontend**: HTML, CSS, JavaScript
- **APIs**: 
  - Gemini AI for interpretations
  - Project Gutenberg for source text
  - Chrome Storage for persistence
- **Data Flow**:
  1. Fetches original text from Project Gutenberg
  2. Uses Gemini AI for modern interpretations
  3. Generates practical exercises based on passages
  4. Tracks reading progress in Chrome storage

### Features Implementation
- Sequential passage fetching with Roman numeral tracking
- Parallel AI interpretation and exercise generation
- Persistent storage of reading position and API key
- Clean, modern UI with responsive design

## Development

### Project Structure
```
S3/
├── manifest.json     # Extension configuration
├── popup.html       # Main UI
├── popup.js         # Core functionality
└── styles.css       # UI styling
```

### Key Components
- **Passage Tracker**: Maintains reading position using book and text numbers
- **Function Orchestrator**: Manages sequential operations for content fetching
- **AI Integration**: Handles Gemini API calls for interpretations
- **Storage Manager**: Handles Chrome storage operations

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Text source: Project Gutenberg's *Meditations* by Marcus Aurelius
- AI powered by Google's Gemini
- Inspired by the timeless wisdom of Stoic philosophy
