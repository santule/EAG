// Tracker object to keep track of current position
const tracker = {
  book: 1,
  text: 1
};

// DOM Elements
let passageContent;
let referenceText;
let interpretationContent;
let exerciseContent;
let nextButton;
let restartButton;
let apiKeySection;
let contentSection;
let apiKeyInput;
let saveKeyButton;

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize DOM elements
  passageContent = document.getElementById('passage-content');
  referenceText = document.getElementById('reference');
  interpretationContent = document.getElementById('interpretation-content');
  exerciseContent = document.getElementById('exercise-content');
  nextButton = document.getElementById('next-button');
  restartButton = document.getElementById('restart-button');
  apiKeySection = document.getElementById('api-key-section');
  contentSection = document.getElementById('content-section');
  apiKeyInput = document.getElementById('api-key');
  saveKeyButton = document.getElementById('save-key');

  // Load saved position or use default
  await loadTrackerPosition();

  // Set up event listeners
  saveKeyButton.addEventListener('click', async function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      apiKeySection.style.display = 'none';
      contentSection.style.display = 'block';
      await loadTrackerPosition();
      await updateDisplay();
    }
  });

  nextButton.addEventListener('click', async function() {
    // Update display with current passage and get next passage info
    await updateDisplay();
  });

  restartButton.addEventListener('click', async function() {
    // Reset to Book I, Text I
    tracker.book = 1;
    tracker.text = 1;
    await saveTrackerPosition();
    await updateDisplay();
  });

  // Check if API key exists
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  if (result.geminiApiKey) {
    apiKeySection.style.display = 'none';
    contentSection.style.display = 'block';
    await loadTrackerPosition();
    await updateDisplay();
  }

  // Display current position
  updateDisplay();
});

// Load tracker position from storage
async function loadTrackerPosition() {
  const result = await chrome.storage.sync.get(['trackerPosition']);
  if (result.trackerPosition) {
    tracker.book = result.trackerPosition.book;
    tracker.text = result.trackerPosition.text;
  }
  // If no saved position, it will use the default (Book 1, Text 1)
}

// Save tracker position to storage
async function saveTrackerPosition() {
  await chrome.storage.sync.set({
    trackerPosition: {
      book: tracker.book,
      text: tracker.text
    }
  });
}

// Function map for different operations
const functionMap = {
  fetchPassageAndTracker,
  giveModernInterpretation,
  giveDailyStoicExercise
};

// Function caller that maps function names to actual functions
async function functionCaller(funcName, params) {
  if (funcName in functionMap) {
    return await functionMap[funcName](params);
  } else {
    console.error(`Function ${funcName} not found`);
    return `Function ${funcName} not found`;
  }
}

// Orchestrate the sequential reading of passages
async function readNextPassage(currentTracker) {
  const MAX_ITERATIONS = 3;
  let iteration = 0;
  let lastResponse = null;
  let iterationResponses = [];
  
  while (iteration < MAX_ITERATIONS) {
    console.log(`--- Iteration ${iteration + 1} ---`);
    
    let currentQuery;
    if (lastResponse === null) {
      currentQuery = `Fetch the passage text corresponding to ${currentTracker}`;
    } else {
      currentQuery = currentQuery + "\n\n" + iterationResponses.join(" ") + " What should I do next?";
    }

    try {
      let functionResult;
      
      // First iteration: Always fetch passage
      if (iteration === 0) {
        functionResult = await functionCaller('fetchPassageAndTracker', currentTracker);
        if (!functionResult) {
          throw new Error('Failed to fetch passage');
        }
        passageContent.textContent = functionResult.passageText;
        
        // Parse next tracker
        const nextTrackerMatch = functionResult.tracker.match(/THE ([A-Z]+) BOOK-([IVXLCDM]+)\./);
        if (nextTrackerMatch) {
          const numbers = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 
                          'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH'];
          const nextBook = numbers.indexOf(nextTrackerMatch[1]) + 1;
          const nextText = romanToNumber(nextTrackerMatch[2]);
          
          // Update tracker
          tracker.book = nextBook;
          tracker.text = nextText;
          await saveTrackerPosition();
        }
      }
      // Second iteration: Get interpretation
      else if (iteration === 1) {
        functionResult = await functionCaller('giveModernInterpretation', passageContent.textContent);
        interpretationContent.textContent = functionResult;
      }
      // Third iteration: Get exercise
      else if (iteration === 2) {
        functionResult = await functionCaller('giveDailyStoicExercise', passageContent.textContent);
        exerciseContent.textContent = functionResult;
      }

      console.log(`Result: ${functionResult}`);
      lastResponse = functionResult;
      iterationResponses.push(
        `In iteration ${iteration + 1} the function returned ${JSON.stringify(functionResult)}.`
      );

    } catch (error) {
      console.error(`Error in iteration ${iteration + 1}:`, error);
      break;
    }

    iteration++;
  }
}

// Update the display with current position
async function updateDisplay() {
  // Show current position in passage box with Roman numerals
  referenceText.textContent = `Book ${toRoman(tracker.book)}, Text ${toRoman(tracker.text)}`;
  passageContent.textContent = "Loading passage...";
  interpretationContent.textContent = "Loading interpretation...";
  exerciseContent.textContent = "Loading exercise...";
  
  // Get passage from Project Gutenberg
  const currentTracker = `${getChapterName(tracker.book)}-${toRoman(tracker.text)}.`;
  await readNextPassage(currentTracker);
}

// Convert Roman numeral to number
function romanToNumber(roman) {
  const romanValues = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50,
    'C': 100, 'D': 500, 'M': 1000
  };
  
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = romanValues[roman[i]];
    const next = romanValues[roman[i + 1]];
    
    if (next > current) {
      result += next - current;
      i++;
    } else {
      result += current;
    }
  }
  return result;
}

// Convert number to Roman numeral
function toRoman(num) {
  const romanNumerals = [
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];
  
  let result = '';
  let remaining = num;
  
  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  
  return result;
}

// Get AI interpretation using Gemini
async function getAIInterpretation(passageText) {
  try {
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      interpretationContent.textContent = "Please set your Gemini API key";
      exerciseContent.textContent = "";
      return;
    }

    const apiKey = result.geminiApiKey;
    const prompt = `
      You are an expert in Stoic philosophy. For this passage from Marcus Aurelius's Meditations:

      "${passageText}"

      Provide:
      1. A brief modern interpretation (2-3 sentences)
      2. A practical daily exercise based on this teaching (1 sentence)

      Respond with ONLY a JSON object in this exact format (no markdown, no other text):
      {
        "interpretation": "your interpretation here",
        "exercise": "your exercise here"
      }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemini-pro",
        contents: [{
          role: "user",
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    // Extract JSON from markdown response
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);
    return aiResponse;

  } catch (error) {
    console.error('Error getting AI interpretation:', error);
    interpretationContent.textContent = "Error getting interpretation";
    exerciseContent.textContent = "";
    return null;
  }
}

// Get modern interpretation using Gemini
async function giveModernInterpretation(passageText) {
  try {
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      return "Please set your Gemini API key";
    }

    const apiKey = result.geminiApiKey;
    const systemPrompt = `You are a stoic philosopher and you will provide modern interpretation of the 
    following text (2-3 sentences).`;
    
    const prompt = `${systemPrompt}\n\nQuery: ${passageText}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemini-pro",
        contents: [{
          role: "user",
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('Error getting modern interpretation:', error);
    return "Error getting interpretation";
  }
}

// Get daily stoic exercise using Gemini
async function giveDailyStoicExercise(passageText) {
  try {
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      return "Please set your Gemini API key";
    }

    const apiKey = result.geminiApiKey;
    const systemPrompt = `You are a stoic philosopher and you will suggest a practical daily exercise 
    based on this text (1 sentence).`;
    
    const prompt = `${systemPrompt}\n\nQuery: ${passageText}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemini-pro",
        contents: [{
          role: "user",
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    return data.candidates[0].content.parts[0].text.trim();

  } catch (error) {
    console.error('Error getting daily exercise:', error);
    return "Error getting exercise";
  }
}

// Convert book number to chapter name
function getChapterName(book) {
  const numbers = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 
                  'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH'];
  return `THE ${numbers[book - 1]} BOOK`;
}

// Fetch passage and next tracker
async function fetchPassageAndTracker(inputTracker) {
  try {
    const url = 'https://www.gutenberg.org/cache/epub/2680/pg2680.txt';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch text');
    const text = await response.text();

    const [chapterName, paraName] = inputTracker.split('-');
    
    // Find chapter start
    const chapterStart = text.indexOf(chapterName);
    if (chapterStart === -1) return null;

    // Find paragraph start
    let paraStart = text.indexOf(paraName + " ", chapterStart);
    if (paraStart === -1) {
      paraStart = text.indexOf(paraName + "\n", chapterStart);
      if (paraStart === -1) return null;
    }

    // Find paragraph end (next blank line)
    const textAfterPara = text.slice(paraStart);
    const blankLineMatch = textAfterPara.match(/\n\s*\n/);
    const paraEnd = blankLineMatch 
      ? paraStart + blankLineMatch.index 
      : text.length;

    const passageText = text.slice(paraStart, paraEnd).trim();

    // Find next paragraph (Roman numeral)
    const textAfterCurrent = text.slice(paraEnd);
    const nextParaMatch = textAfterCurrent.match(/\n([IVXLCDM]+)\./);
    
    // Find next chapter title
    const nextChapterMatch = textAfterCurrent.match(/\n(THE [A-Z]+ BOOK)/);

    let nextParaName = null;
    let nextChapterName = chapterName; // Default: same chapter

    if (nextParaMatch) {
      const nextParaStart = nextParaMatch.index;
      nextParaName = nextParaMatch[1] + '.';

      if (nextChapterMatch) {
        const nextChapterStart = nextChapterMatch.index;
        if (nextChapterStart < nextParaStart) {
          nextChapterName = nextChapterMatch[1].trim();
        }
      }
    }

    const tracker = nextParaName 
      ? `${nextChapterName}-${nextParaName}` 
      : 'THE FIRST BOOK-I.';

    return {
      passageText,
      tracker
    };

  } catch (error) {
    console.error('Error fetching passage:', error);
    return null;
  }
}

// Added function to await instructions
async function instructions() {
  console.log('Awaiting instructions');
}
