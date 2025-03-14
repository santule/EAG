// Keep track of original background
let originalBackground = null;
let timerOverlay = null;

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.action === 'startTimer') {
            // Store original background
            originalBackground = window.getComputedStyle(document.body).backgroundColor;
            
            // Change to pink with transition
            document.body.style.transition = 'background-color 0.3s ease';
            document.body.style.backgroundColor = '#ffb6c1'; // Light pink

            // Create or update timer overlay
            if (!timerOverlay) {
                timerOverlay = document.createElement('div');
                timerOverlay.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    font-size: 24px;
                    font-family: monospace;
                    background: rgba(0, 0, 0, 0.1);
                    padding: 10px 20px;
                    border-radius: 8px;
                    z-index: 9999999;
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(timerOverlay);
            }
            timerOverlay.style.opacity = '1';
            timerOverlay.textContent = request.time || '00:00:00';
        }
        else if (request.action === 'updateTimer' && timerOverlay) {
            timerOverlay.textContent = request.time;
        }
        else if (request.action === 'hideTimer') {
            // Restore original background
            document.body.style.backgroundColor = originalBackground || '';
            
            // Remove timer overlay
            if (timerOverlay) {
                timerOverlay.style.opacity = '0';
                setTimeout(() => {
                    timerOverlay.remove();
                    timerOverlay = null;
                }, 300);
            }
        }
        
        sendResponse({success: true});
    } catch (error) {
        console.error('Timer extension error:', error);
        sendResponse({success: false, error: error.message});
    }
    
    return true; // Keep the message channel open
});
