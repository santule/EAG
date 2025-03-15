// Timer functionality
class Timer {
    constructor() {
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.display = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressRing = document.querySelector('.progress-ring-circle');
        
        this.timeLeft = 0;
        this.timerId = null;
        this.totalTime = 0;
        
        // Initialize button states
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        
        // Add event listeners
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Input validation
        this.hoursInput.addEventListener('change', () => this.validateInput(this.hoursInput, 23));
        this.minutesInput.addEventListener('change', () => this.validateInput(this.minutesInput, 59));
        this.secondsInput.addEventListener('change', () => this.validateInput(this.secondsInput, 59));
        
        // Set up progress ring
        const radius = this.progressRing.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
        this.progressRing.style.strokeDashoffset = circumference;
    }
    
    validateInput(input, max) {
        let value = parseInt(input.value) || 0;
        value = Math.max(0, Math.min(value, max));
        input.value = value;
    }
    
    updateDisplay(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        this.display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    setProgress(percent) {
        const radius = this.progressRing.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100 * circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    start() {
        // Calculate total seconds
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
            return;
        }
        
        // If timer is not already running
        if (!this.timerId) {
            this.timeLeft = hours * 3600 + minutes * 60 + seconds;
            this.totalTime = this.timeLeft;
            
            // Start sand animation
            if (window.sandAnimation) {
                window.sandAnimation.start();
            }
        }
        
        // Update UI
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.hoursInput.disabled = true;
        this.minutesInput.disabled = true;
        this.secondsInput.disabled = true;
        
        // Start countdown
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay(this.timeLeft);
            this.setProgress((this.timeLeft / this.totalTime) * 100);
            
            if (this.timeLeft <= 0) {
                this.reset();
            }
        }, 1000);
    }
    
    pause() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
            
            // Pause sand animation
            if (window.sandAnimation) {
                window.sandAnimation.pause();
            }
            
            // Update UI
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
        }
    }
    
    reset() {
        // Clear timer
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        
        // Reset sand animation
        if (window.sandAnimation) {
            window.sandAnimation.reset();
        }
        
        // Reset UI
        this.timeLeft = 0;
        this.totalTime = 0;
        this.updateDisplay(0);
        this.setProgress(100);
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.hoursInput.disabled = false;
        this.minutesInput.disabled = false;
        this.secondsInput.disabled = false;
        this.hoursInput.value = 0;
        this.minutesInput.value = 0;
        this.secondsInput.value = 0;
    }
}

// Initialize timer when the document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.timer = new Timer();
    });
} else {
    window.timer = new Timer();
}
