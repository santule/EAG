// Meditations quotes
const quotes = [
  {
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.",
    book: "Book IV"
  },
  {
    text: "The best revenge is to be unlike him who performed the injury.",
    book: "Book VI"
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    book: "Book X"
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    book: "Book VII"
  },
  {
    text: "When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love.",
    book: "Book II"
  }
];

// Get DOM elements
const quoteElement = document.getElementById('quote');
const referenceElement = document.getElementById('book-reference');
const newQuoteButton = document.getElementById('new-quote');
const interpretationElement = document.getElementById('interpretation');
const dailyActionElement = document.getElementById('daily-action');
const apiKeyInput = document.getElementById('api-key');
const saveKeyButton = document.getElementById('save-key');
const apiKeySection = document.getElementById('api-key-section');

// Check for stored API key
chrome.storage.sync.get(['geminiApiKey'], function(result) {
  console.log('Checking for stored API key:', result.geminiApiKey ? 'Found' : 'Not found');
  if (result.geminiApiKey) {
    apiKeySection.style.display = 'none';
  }
});

// Save API key
saveKeyButton.addEventListener('click', function() {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    chrome.storage.sync.set({ geminiApiKey: apiKey }, function() {
      console.log('API key saved successfully');
      apiKeySection.style.display = 'none';
      displayRandomQuote(); // Refresh quote with interpretation
    });
  }
});

// Function to get AI interpretation
async function getAIInterpretation(quote) {
  try {
    const storageResult = await chrome.storage.sync.get(['geminiApiKey']);
    console.log('Retrieved API key for interpretation:', storageResult.geminiApiKey ? 'Present' : 'Missing');
    
    if (!storageResult.geminiApiKey) {
      interpretationElement.textContent = 'Please enter your Gemini API key to get AI interpretations.';
      dailyActionElement.textContent = '';
      apiKeySection.style.display = 'flex';
      return;
    }

    const apiKey = storageResult.geminiApiKey;
    const prompt = `
      Analyze this quote from Marcus Aurelius's Meditations:
      "${quote.text}"
      
      Provide two things:
      1. A brief modern interpretation (2-3 sentences)
      2. A simple, concrete action for today based on this teaching (1 sentence)
      
      Respond with ONLY a JSON object in this exact format (no markdown, no backticks):
      {
        "interpretation": "your interpretation here",
        "action": "your suggested action here"
      }
    `;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${errorText || 'Unknown error'}`);
    }

    const data = await apiResponse.json();
    console.log('API Response:', data);
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from API');
    }
    
    try {
      // Clean up the response text by removing markdown formatting
      let responseText = data.candidates[0].content.parts[0].text;
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('Cleaned response:', responseText);
      
      const aiResponse = JSON.parse(responseText);
      interpretationElement.textContent = aiResponse.interpretation;
      dailyActionElement.textContent = aiResponse.action;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', data.candidates[0].content.parts[0].text);
      throw new Error('Invalid JSON response from AI');
    }
  } catch (error) {
    interpretationElement.textContent = 'Error getting AI interpretation. Please check your API key.';
    dailyActionElement.textContent = '';
    apiKeySection.style.display = 'flex';
  }
}

// Function to display a random quote
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteElement.textContent = quote.text;
  referenceElement.textContent = quote.book;
  
  // Get AI interpretation for the quote
  getAIInterpretation(quote);
}

// Event listeners
document.addEventListener('DOMContentLoaded', displayRandomQuote);
newQuoteButton.addEventListener('click', displayRandomQuote);
