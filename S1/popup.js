let isRunning = false;
let totalTime = 0;

// Get DOM elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const timerDisplay = document.getElementById('timerDisplay');
const themeToggle = document.getElementById('themeToggle');
const progressRing = document.querySelector('.progress-ring-circle');

// Set up progress ring
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

// Update progress ring
function setProgress(percent) {
    const offset = circumference - (percent / 100 * circumference);
    progressRing.style.strokeDashoffset = offset;
}

// Load and apply theme
function loadTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDark);
    themeToggle.textContent = isDark ? '🌞' : '🌓';
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    themeToggle.textContent = isDark ? '🌞' : '🌓';
});

// Initialize theme
loadTheme();

// Format time as HH:MM:SS
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Get total seconds from input fields
function getInputTime() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    return (hours * 3600) + (minutes * 60) + seconds;
}

// Start timer
function startTimer() {
    const seconds = getInputTime();
    if (seconds === 0) return;

    totalTime = seconds; // Store total time for progress calculation
    chrome.runtime.sendMessage({ 
        action: 'startTimer',
        totalSeconds: seconds
    });
    
    isRunning = true;
    startBtn.textContent = 'Running...';
    pauseBtn.disabled = false;
}

// Pause timer
function pauseTimer() {
    chrome.runtime.sendMessage({ action: 'pauseTimer' });
    isRunning = false;
    startBtn.textContent = 'Resume';
}

// Reset timer
function resetTimer() {
    chrome.runtime.sendMessage({ action: 'resetTimer' });
    isRunning = false;
    startBtn.textContent = 'Start';
    pauseBtn.disabled = true;
    hoursInput.value = "0";
    minutesInput.value = "0";
    secondsInput.value = "0";
    timerDisplay.textContent = "00:00:00";
    setProgress(100); // Reset progress ring
}

// Listen for timer updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateTimer') {
        timerDisplay.textContent = request.time;
        // Update progress ring
        if (totalTime > 0) {
            const timeLeft = request.time.split(':')
                .reduce((acc, val, i) => acc + parseInt(val) * [3600, 60, 1][i], 0);
            const progress = (timeLeft / totalTime) * 100;
            setProgress(progress);
        }
    } else if (request.action === 'timerComplete') {
        alert('Timer is up!');
        resetTimer();
    }
});

// Get initial timer state
chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    if (response.isRunning) {
        isRunning = true;
        startBtn.textContent = 'Running...';
        pauseBtn.disabled = false;
        timerDisplay.textContent = formatTime(response.remainingSeconds);
    }
});

// Event listeners
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        startTimer();
    }
});
pauseBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    }
});
resetBtn.addEventListener('click', resetTimer);

// Initialize button states
pauseBtn.disabled = true;
