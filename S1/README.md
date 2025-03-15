# TimeDrops

A peaceful Chrome extension that helps you track time with beautiful rain animation. Watch as raindrops fall and collect into a serene pool of water, visualizing your time in a calming way.


![Image](https://github.com/user-attachments/assets/1346f5ef-4380-4da1-92cb-b547381af9dd)

## Features

- Customizable timer from 1-60 minutes
- Beautiful rain animation with realistic physics
- Water collection visualization
- Start and reset functionality
- Clean, minimalist interface

## Visual Effects

- Natural-looking rain drops with varying:
  - Size and length
  - Speed and opacity
  - Slanted falling pattern
- Peaceful water collection with:
  - Gentle ripple effects
  - Gradient blue coloring
  - Smooth filling animation

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files
5. The TimeDrops extension should now appear in your Chrome toolbar

## Usage

1. Click the extension icon to open TimeDrops
2. Set your desired time (1-60 minutes)
3. Click "Start" to begin the timer and rain animation
4. Watch as rain drops fall and collect at the bottom
5. Use "Reset" to clear the timer and water

## Files

- `manifest.json`: Extension configuration
- `window.html`: Main timer interface
- `timer.js`: Timer logic
- `sand.js`: Rain animation implementation
- `style.css`: Visual styling
- `background.js`: Extension background worker

## Technical Details

- Built with vanilla JavaScript and HTML Canvas
- Uses requestAnimationFrame for smooth animations
- Implements realistic rain physics with:
  - Variable drop speeds
  - Slant angle calculations
  - Water collection mechanics
