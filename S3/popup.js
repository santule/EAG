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

// Update the display with current position
async function updateDisplay() {
  // Show current position in passage box with Roman numerals
  referenceText.textContent = `Book ${toRoman(tracker.book)}, Text ${toRoman(tracker.text)}`;
  passageContent.textContent = "Loading passage...";
  
  // Get AI interpretation
  await getAIInterpretation();
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
async function getAIInterpretation() {
  try {
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      interpretationContent.textContent = "Please set your Gemini API key";
      exerciseContent.textContent = "";
      return;
    }

    const apiKey = result.geminiApiKey;
    const prompt = `
      You are an expert in Stoic philosophy. For Book ${toRoman(tracker.book)}, Text ${toRoman(tracker.text)} of Marcus Aurelius's Meditations:

      1. Original Text from the book
      2. Provide a brief modern interpretation (2-3 sentences)
      3. Suggest a practical daily exercise based on this teaching (1 sentence)
      4. Determine the next passage's book and text number. If current text is the last in its book, move to text 1 of next book. If it's the last text of Book XII, return to Book I, Text I.

      Respond with ONLY a JSON object in this exact format (no markdown, no other text):
      {
        "originalText": "your original text here",
        "interpretation": "your interpretation here",
        "exercise": "your exercise here",
        "nextPassage": {
          "book": number,
          "text": number
        }
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
    passageContent.textContent = aiResponse.originalText;
    interpretationContent.textContent = aiResponse.interpretation;
    exerciseContent.textContent = aiResponse.exercise;

    // Store next passage info
    if (aiResponse.nextPassage) {
      tracker.book = aiResponse.nextPassage.book;
      tracker.text = aiResponse.nextPassage.text;
    }

    // Save tracker position
    await saveTrackerPosition();
  } catch (error) {
    console.error('Error getting AI interpretation:', error);
    interpretationContent.textContent = "Error getting AI interpretation";
    exerciseContent.textContent = "Please try again";
  }
}

// Added function to await instructions
async function instructions() {
  console.log('Awaiting instructions');
}
