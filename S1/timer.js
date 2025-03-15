// Timer functionality
let isRunning = false;
let totalTime = 0;
let timerInterval;

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

    totalTime = seconds;
    let remainingTime = seconds;
    
    timerInterval = setInterval(() => {
        remainingTime--;
        timerDisplay.textContent = formatTime(remainingTime);
        setProgress((remainingTime / totalTime) * 100);
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            alert('Timer is up!');
            resetTimer();
        }
    }, 1000);
    
    isRunning = true;
    startBtn.textContent = 'Running...';
    pauseBtn.disabled = false;
    window.sandAnimation.start(seconds);
}

// Pause timer
function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Resume';
    window.sandAnimation.stop();
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Start';
    pauseBtn.disabled = true;
    hoursInput.value = "0";
    minutesInput.value = "0";
    secondsInput.value = "0";
    timerDisplay.textContent = "00:00:00";
    setProgress(100);
    window.sandAnimation.stop();
}

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
