// Timer functionality
class Timer {
    constructor() {
        // Get DOM elements
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.display = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Initialize state
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.isRunning = false;
        this.interval = null;
        
        // Initialize rain animation
        const canvas = document.getElementById('sandCanvas');
        this.rainAnimation = new RainAnimation(canvas);
        
        // Add event listeners
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Input validation
        this.hoursInput.addEventListener('change', () => this.validateInput(this.hoursInput, 23));
        this.minutesInput.addEventListener('change', () => this.validateInput(this.minutesInput, 59));
        this.secondsInput.addEventListener('change', () => this.validateInput(this.secondsInput, 59));
        
        // Update display on input change
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('change', () => this.updateDisplayFromInputs());
        });
        
        // Initial display update
        this.updateDisplayFromInputs();
    }
    
    validateInput(input, max) {
        let value = parseInt(input.value);
        if (isNaN(value) || value < 0) value = 0;
        if (value > max) value = max;
        input.value = value;
    }
    
    updateDisplayFromInputs() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;
        this.display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    start() {
        if (!this.isRunning && this.remainingSeconds > 0) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.resetBtn.disabled = false;
            this.disableInputs(true);
            
            // Start rain animation
            this.rainAnimation.start(this.totalSeconds);
            
            this.interval = setInterval(() => {
                this.remainingSeconds--;
                this.updateDisplay();
                
                if (this.remainingSeconds <= 0) {
                    this.complete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            clearInterval(this.interval);
            this.rainAnimation.pause();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = true;
        clearInterval(this.interval);
        this.disableInputs(false);
        this.updateDisplayFromInputs();
        this.rainAnimation.reset();
    }
    
    complete() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resetBtn.disabled = false;
        clearInterval(this.interval);
        this.disableInputs(false);
        this.rainAnimation.complete();
    }
    
    disableInputs(disabled) {
        this.hoursInput.disabled = disabled;
        this.minutesInput.disabled = disabled;
        this.secondsInput.disabled = disabled;
    }
}

// Initialize timer when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.timer = new Timer();
    // Set demo duration - 15 seconds is good for demo
    window.timer.secondsInput.value = 15;
    window.timer.updateDisplayFromInputs();
});
