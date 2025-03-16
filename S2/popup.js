document.addEventListener('DOMContentLoaded', async function() {
    const codeDisplay = document.getElementById('codeDisplay');
    const analysisType = document.getElementById('analysisType');
    const analyzeButton = document.getElementById('analyzeButton');
    const responseArea = document.getElementById('response');
    const loadingIndicator = document.getElementById('loading');
    let selectedCode = '';
    let markedLoaded = false;

    console.log('Popup opened, initializing...');

    // Load marked.js
    await new Promise((resolve) => {
        if (typeof marked !== 'undefined') {
            markedLoaded = true;
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'marked.min.js';
        script.onload = () => {
            markedLoaded = true;
            marked.setOptions({
                breaks: true,
                gfm: true,
                highlight: function(code, lang) {
                    if (Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    return code;
                }
            });
            resolve();
        };
        document.head.appendChild(script);
    });

    // Function to get selected text with better error handling
    async function getSelectedText() {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (!tab || !tab.id) {
                throw new Error('No active tab found');
            }

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    const selection = window.getSelection();
                    if (!selection) return '';
                    
                    // Handle selections within text editors or code blocks
                    const selectedElement = selection.anchorNode?.parentElement;
                    if (selectedElement?.tagName === 'PRE' || selectedElement?.tagName === 'CODE') {
                        return selectedElement.textContent;
                    }
                    
                    return selection.toString();
                }
            });
            
            return results[0]?.result || '';
        } catch (err) {
            console.error('Failed to get selected text:', err);
            throw err;
        }
    }

    // Get the selected code from the active tab
    try {
        const text = (await getSelectedText()).trim();
        if (text) {
            selectedCode = text;
            codeDisplay.textContent = text;
            codeDisplay.className = 'language-plaintext';
            Prism.highlightElement(codeDisplay);
            console.log('Initial selection captured:', text.length, 'characters');
        } else {
            codeDisplay.textContent = 'Select code on the page to analyze it';
            codeDisplay.className = 'language-plaintext';
            console.log('No initial selection found');
        }
    } catch (err) {
        console.error('Failed to get selected text:', err);
        codeDisplay.textContent = `Error: ${err.message}. Try selecting the code again.`;
        codeDisplay.className = 'language-plaintext';
    }

    // Load API key
    chrome.storage.sync.get(['geminiApiKey'], function(result) {
        if (!result.geminiApiKey) {
            responseArea.innerHTML = '<span style="color: #c62828;">Please set your Gemini API key in the <a href="#" id="openOptions">extension options</a>.</span>';
            document.getElementById('openOptions')?.addEventListener('click', function(e) {
                e.preventDefault();
                chrome.runtime.openOptionsPage();
            });
            analyzeButton.disabled = true;
        }
    });

    analyzeButton.addEventListener('click', async () => {
        // Get latest selection
        try {
            const text = (await getSelectedText()).trim();
            if (text) {
                if (text !== selectedCode) {
                    console.log('Selection updated:', text.length, 'characters');
                    selectedCode = text;
                    codeDisplay.textContent = text;
                    codeDisplay.className = 'language-plaintext';
                    Prism.highlightElement(codeDisplay);
                }
            } else if (!selectedCode) {
                responseArea.innerHTML = '<span style="color: #c62828;">Please select some code first!</span>';
                return;
            }
            // Keep existing selection if no new selection found
        } catch (err) {
            console.error('Failed to get selected text:', err);
            if (!selectedCode) {
                responseArea.innerHTML = `<span style="color: #c62828;">Error getting selection: ${err.message}</span>`;
                return;
            }
            // Continue with existing selection if we have one
            console.log('Continuing with existing selection');
        }

        if (!selectedCode) {
            responseArea.innerHTML = '<span style="color: #c62828;">Please select some code first!</span>';
            return;
        }

        try {
            analyzeButton.disabled = true;
            loadingIndicator.classList.remove('hidden');
            responseArea.textContent = '';

            const prompt = generatePrompt(selectedCode, analysisType.value);
            console.log('Sending prompt:', prompt);
            
            const response = await chrome.runtime.sendMessage({
                action: 'analyzeCode',
                prompt: prompt
            });

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.result) {
                throw new Error('No response received from Gemini API');
            }

            // Format the response with sections
            const formattedResponse = formatResponse(response.result, analysisType.value);
            
            // Use marked only after it's loaded
            if (markedLoaded) {
                responseArea.innerHTML = marked.parse(formattedResponse);
                // Add syntax highlighting to code blocks
                responseArea.querySelectorAll('pre code').forEach((block) => {
                    Prism.highlightElement(block);
                });
            } else {
                // Fallback to plain text if marked isn't loaded
                responseArea.textContent = formattedResponse;
            }

        } catch (error) {
            console.error('Analysis error:', error);
            responseArea.innerHTML = `<span style="color: #c62828;">Error: ${error.message}</span>`;
        } finally {
            analyzeButton.disabled = false;
            loadingIndicator.classList.add('hidden');
        }
    });
});

function formatResponse(response, type) {
    // Add emojis and sections based on analysis type
    const sections = {
        explain: {
            title: '📝 Code Explanation',
            sections: ['Purpose', 'Functionality', 'Key Components']
        },
        improve: {
            title: '🚀 Code Analysis',
            sections: ['Current Implementation', 'Suggested Improvements', 'Best Practices']
        },
        security: {
            title: '🔒 Security Analysis',
            sections: ['Vulnerabilities', 'Security Fixes', 'Best Practices']
        },
        complexity: {
            title: '⚡ Performance Analysis',
            sections: ['Time Complexity', 'Space Complexity', 'Optimization Tips']
        }
    };

    // Format the response with sections
    const { title, sections: sectionList } = sections[type] || sections.explain;
    let formattedText = `## ${title}\n\n`;

    // Try to split the response into sections intelligently
    const paragraphs = response.split('\n\n');
    let currentSection = 0;

    for (const paragraph of paragraphs) {
        if (currentSection < sectionList.length) {
            formattedText += `### ${sectionList[currentSection]}\n\n`;
            currentSection++;
        }
        formattedText += paragraph + '\n\n';
    }

    return formattedText;
}

function generatePrompt(code, analysisType) {
    const systemPrompt = "You are an expert software engineer with deep knowledge of programming languages, design patterns, and best practices. Analyze the following code with precise technical details. Format your response in clear sections using markdown. Be concise but thorough.";
    
    const prompts = {
        explain: `${systemPrompt}

Analyze this code and provide:
1. Purpose: Core functionality and use case
2. Implementation: Key algorithms, patterns, and data structures used
3. Components: Breakdown of major functions, classes, or modules
4. Dependencies: Required libraries, frameworks, or external services

CODE:
${code}`,

        improve: `${systemPrompt}

Review this code for improvements:
1. Code Quality: Identify issues with readability, maintainability, or modularity
2. Performance: Point out potential bottlenecks or inefficient implementations
3. Best Practices: Suggest modern practices, patterns, or language features that could be used
4. Specific Changes: Provide concrete code suggestions for the most important improvements

CODE:
${code}`,

        security: `${systemPrompt}

Perform a security analysis:
1. Vulnerabilities: Identify potential security risks (e.g., injection, XSS, CSRF)
2. Data Safety: Review handling of sensitive data, input validation, and sanitization
3. Access Control: Check authorization, authentication, and permission issues
4. Security Fixes: Provide specific code-level fixes for each vulnerability

CODE:
${code}`,

        complexity: `${systemPrompt}

Analyze performance characteristics:
1. Time Complexity: Big O analysis of key operations
2. Space Complexity: Memory usage and allocation patterns
3. Scalability: Potential issues with larger inputs or concurrent usage
4. Optimization: Specific recommendations for improving performance

CODE:
${code}`
    };
    
    return prompts[analysisType] || prompts.explain;
}
