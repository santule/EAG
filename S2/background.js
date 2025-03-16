// Configuration for Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Load API key from storage
async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['geminiApiKey'], function(result) {
            resolve(result.geminiApiKey || '');
        });
    });
}

// Store the current selection
let selectedText = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setSelectedText') {
        selectedText = request.text;
    }
    else if (request.action === 'getSelectedText') {
        sendResponse(selectedText);
    }
    else if (request.action === 'analyzeCode') {
        chrome.storage.sync.get(['geminiApiKey'], async function(result) {
            try {
                if (!result.geminiApiKey) {
                    throw new Error('API key not found. Please set your Gemini API key in the options.');
                }

                const response = await fetch(`${GEMINI_API_URL}?key=${result.geminiApiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: request.prompt
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.error?.message || `HTTP error ${response.status}`;
                    throw new Error(`Gemini API error: ${errorMessage}`);
                }

                const data = await response.json();
                
                if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                    console.error('Invalid API response structure:', data); // Debug log
                    throw new Error('Invalid response from Gemini API');
                }

                sendResponse({
                    result: data.candidates[0].content.parts[0].text
                });
            } catch (error) {
                console.error('Analysis error:', error);
                sendResponse({
                    error: error.message
                });
            }
        });

        // Return true to indicate we will send response asynchronously
        return true;
    }
});

async function analyzeCode(prompt) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error('Please set your Gemini API key in the extension options');
    }

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
        }
    };

    console.log('Making API request to Gemini...'); // Debug log
    console.log('Request URL:', `${GEMINI_API_URL}?key=${apiKey.substring(0, 4)}...`); // Debug log (showing only first 4 chars of API key)
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error?.message || `HTTP error ${response.status}`;
            throw new Error(`Gemini API error: ${errorMessage}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid API response structure:', data); // Debug log
            throw new Error('Invalid response from Gemini API');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('API request failed:', error); // Debug log
        throw error;
    }
}
