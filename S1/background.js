let timer = {
    endTime: 0,
    remainingSeconds: 0,
    isRunning: false,
    intervalId: null,
    windowId: null
};

// Open timer window
async function openTimerWindow() {
    // Check if window already exists
    if (timer.windowId) {
        try {
            const window = await chrome.windows.get(timer.windowId);
            chrome.windows.update(timer.windowId, { focused: true });
            return;
        } catch (e) {
            // Window was closed
            timer.windowId = null;
        }
    }

    // Create new window
    const window = await chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 500,
        height: 600,
        focused: true
    });
    timer.windowId = window.id;
}

// Start the timer
function startTimer(totalSeconds) {
    timer.remainingSeconds = totalSeconds;
    timer.endTime = Date.now() + (totalSeconds * 1000);
    timer.isRunning = true;

    if (timer.intervalId) {
        clearInterval(timer.intervalId);
    }

    timer.intervalId = setInterval(updateTimer, 1000);
    updateTimer(); // Update immediately
}

// Update timer and broadcast to all tabs
function updateTimer() {
    if (!timer.isRunning) return;

    const now = Date.now();
    timer.remainingSeconds = Math.max(0, Math.ceil((timer.endTime - now) / 1000));

    if (timer.remainingSeconds > 0) {
        // Format time
        const hours = Math.floor(timer.remainingSeconds / 3600);
        const minutes = Math.floor((timer.remainingSeconds % 3600) / 60);
        const seconds = timer.remainingSeconds % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Broadcast to all tabs
        chrome.runtime.sendMessage({ action: 'updateTimer', time: timeStr });
    } else {
        stopTimer();
        chrome.runtime.sendMessage({ action: 'timerComplete' });
    }
}

// Stop the timer
function stopTimer() {
    timer.isRunning = false;
    if (timer.intervalId) {
        clearInterval(timer.intervalId);
        timer.intervalId = null;
    }
}

// Reset the timer
function resetTimer() {
    stopTimer();
    timer.remainingSeconds = 0;
    timer.endTime = 0;
}

// Open timer window when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: 'window.html',
        type: 'popup',
        width: 400,
        height: 600,
        focused: true
    });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'startTimer':
            startTimer(request.totalSeconds);
            break;
        case 'pauseTimer':
            stopTimer();
            break;
        case 'resetTimer':
            resetTimer();
            break;
        case 'getTimerState':
            sendResponse({
                isRunning: timer.isRunning,
                remainingSeconds: timer.remainingSeconds
            });
            break;
    }
    return true;
});

// Listen for window close
chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === timer.windowId) {
        timer.windowId = null;
    }
});
