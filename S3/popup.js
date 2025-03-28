// DOM Elements
let passageContent;
let referenceText;
let interpretationContent;
let exerciseContent;
let nextButton;
let apiKeySection;
let contentSection;
let apiKeyInput;
let saveKeyButton;

// Tracker object to keep track of current position
const tracker = {
  book: 1,
  text: 1
};

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize DOM elements
  passageContent = document.getElementById('passage-content');
  referenceText = document.getElementById('reference');
  interpretationContent = document.getElementById('interpretation-content');
  exerciseContent = document.getElementById('exercise-content');
  nextButton = document.getElementById('next-button');
  apiKeySection = document.getElementById('api-key-section');
  contentSection = document.getElementById('content-section');
  apiKeyInput = document.getElementById('api-key');
  saveKeyButton = document.getElementById('save-key');

  // Set up event listeners
  saveKeyButton.addEventListener('click', async function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      apiKeySection.style.display = 'none';
      contentSection.style.display = 'block';
      await initializeContent();
    }
  });

  nextButton.addEventListener('click', async function() {
    // TODO: Implement next passage functionality
    console.log('Next passage clicked');
  });

  // Check if API key exists
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  if (result.geminiApiKey) {
    apiKeySection.style.display = 'none';
    contentSection.style.display = 'block';
    await initializeContent();
  }
});

// Initialize content after API key is set
async function initializeContent() {
  // Load saved position or use default
  await loadTrackerPosition();
  // Display current position
  await updateDisplay();
}

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
  // Show current position in passage box
  referenceText.textContent = `Book ${tracker.book}, Text ${tracker.text}`;
  passageContent.textContent = "Loading passage...";
  
  // Get AI interpretation
  await getAIInterpretation();
}

// Get AI interpretation using Gemini
async function getAIInterpretation() {
  try {
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      interpretationContent.textContent = "Please set your Gemini API key";
      exerciseContent.textContent = "";
      apiKeySection.style.display = 'block';
      contentSection.style.display = 'none';
      return;
    }

    const apiKey = result.geminiApiKey;
    const prompt = `
      You are an expert in Stoic philosophy. For Book ${tracker.book}, Text ${tracker.text} of Marcus Aurelius's Meditations:

      1. Original Text from the book
      2. Provide a brief modern interpretation (2-3 sentences)
      3. Suggest a practical daily exercise based on this teaching (1 sentence)

      Respond with ONLY a JSON object in this exact format (no markdown, no other text):
      {
        "originalText": "your original text here",
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
    passageContent.textContent = aiResponse.originalText;
    interpretationContent.textContent = aiResponse.interpretation;
    exerciseContent.textContent = aiResponse.exercise;

    // Save tracker position
    await saveTrackerPosition();
  } catch (error) {
    console.error('Error getting AI interpretation:', error);
    interpretationContent.textContent = "Error getting AI interpretation";
    exerciseContent.textContent = "Please try again";
  }
}
