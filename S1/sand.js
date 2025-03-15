class RainDrop {
    constructor(x, y, containerWidth) {
        this.x = x;
        this.y = y;
        // Varied speeds for more natural movement
        this.speed = 7 + Math.random() * 8;
        // Varied drop sizes
        this.length = 15 + Math.random() * 10;
        this.width = 1.5 + Math.random() * 0.5;
        // Slightly varied angles
        this.slant = -20 + (Math.random() * 5 - 2.5);
        this.containerWidth = containerWidth;
        // Higher base opacity for better visibility
        this.opacity = 0.6 + Math.random() * 0.2;
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 3;
    }

    update(deltaTime) {
        // Update position with delta time for smooth movement
        const movement = (this.speed * deltaTime) / 16; // Normalize to ~60fps
        this.y += movement;
        
        // Update x position based on slant
        const xMovement = movement * Math.tan(this.slant * Math.PI / 180);
        this.x += xMovement;

        // Update trail
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
    }

    draw(ctx) {
        // Draw trail with gradient opacity
        if (this.trail.length > 1) {
            const gradient = ctx.createLinearGradient(
                this.trail[0].x, this.trail[0].y,
                this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y
            );
            // More saturated blue color with higher opacity
            gradient.addColorStop(0, `rgba(135, 206, 235, ${this.opacity})`);
            gradient.addColorStop(1, `rgba(135, 206, 235, ${this.opacity * 0.4})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.width;
            
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }
    }
}

class RainAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drops = [];
        this.isRunning = false;
        this.fillLevel = 0;
        this.waterLevel = 0;
        this.duration = 5; // Short test duration
        this.startTime = 0;
        this.lastTime = 0;
        this.lastDropTime = 0;
        
        // Set up audio with lower initial volume
        this.rainSound = document.getElementById('rainSound');
        this.alarmSound = document.getElementById('alarmSound');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.muteBtn = document.getElementById('muteBtn');
        this.isMuted = false;
        
        // Initialize volume at a peaceful level
        const initialVolume = Math.min(0.3, this.volumeSlider.value / 100);
        this.rainSound.volume = initialVolume;
        this.alarmSound.volume = initialVolume;
        this.volumeSlider.value = Math.floor(initialVolume * 100);

        // Audio controls with smoother transitions
        this.volumeSlider.addEventListener('input', () => {
            const volume = this.volumeSlider.value / 100;
            // Smooth volume transition
            const currentVolume = this.rainSound.volume;
            const volumeDiff = volume - currentVolume;
            const steps = 10;
            const stepSize = volumeDiff / steps;
            
            let step = 0;
            const smoothVolume = setInterval(() => {
                if (step < steps) {
                    this.rainSound.volume = currentVolume + (stepSize * step);
                    this.alarmSound.volume = currentVolume + (stepSize * step);
                    step++;
                } else {
                    this.rainSound.volume = volume;
                    this.alarmSound.volume = volume;
                    clearInterval(smoothVolume);
                }
            }, 20);

            const volumeIcon = this.muteBtn.querySelector('.material-icons');
            if (this.volumeSlider.value === '0') {
                volumeIcon.textContent = 'volume_off';
            } else if (this.volumeSlider.value < 50) {
                volumeIcon.textContent = 'volume_down';
            } else {
                volumeIcon.textContent = 'volume_up';
            }
        });

        this.muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            this.rainSound.muted = this.isMuted;
            this.alarmSound.muted = this.isMuted;
            const volumeIcon = this.muteBtn.querySelector('.material-icons');
            volumeIcon.textContent = this.isMuted ? 'volume_off' : 
                (this.volumeSlider.value < 50 ? 'volume_down' : 'volume_up');
        });

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    reset() {
        this.isRunning = false;
        this.drops = [];
        this.fillLevel = 0;
        this.rainSound.pause();
        this.rainSound.currentTime = 0;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    start(duration) {
        this.duration = duration;
        this.isRunning = true;
        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.lastDropTime = this.startTime;
        this.drops = [];
        this.fillLevel = 0;

        // Start rain sound
        this.rainSound.currentTime = 0;
        this.rainSound.play();

        requestAnimationFrame(time => this.animate(time));
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Check if timer is complete
        const elapsed = currentTime - this.startTime;
        const progress = elapsed / (this.duration * 1000);
        
        if (progress >= 1) {
            this.isRunning = false;
            
            // Stop rain sound
            this.rainSound.pause();
            
            // Play completion sound
            this.alarmSound.currentTime = 0;
            this.alarmSound.volume = this.volumeSlider.value / 100;
            this.alarmSound.play();
            
            return;
        }

        // Calculate number of drops to spawn based on canvas width
        const dropsPerSecond = Math.ceil(this.canvas.width / 20); // One drop every ~20px width
        const dropInterval = 1000 / dropsPerSecond;
        
        // Spawn new drops
        const now = performance.now();
        while (now - this.lastDropTime > dropInterval) {
            this.lastDropTime += dropInterval;
            // Add 5 drops at random positions
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * this.canvas.width;
                const y = -20; // Start above canvas
                this.drops.push(new RainDrop(x, y, this.canvas.width));
            }
        }

        // Update and remove drops
        this.drops = this.drops.filter(drop => {
            drop.update(deltaTime);
            return drop.y < this.canvas.height;
        });

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw drops
        this.drops.forEach(drop => drop.draw(this.ctx));

        // Calculate fill level based on progress
        const targetHeight = this.canvas.height * 0.95;
        const remainingHeight = targetHeight - 2;
        this.fillLevel = 2 + (remainingHeight * progress);

        // Draw water level
        if (this.fillLevel > 0) {
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height - this.fillLevel, 0, this.canvas.height);
            gradient.addColorStop(0, 'rgba(135, 206, 235, 0.4)');
            gradient.addColorStop(1, 'rgba(135, 206, 235, 0.6)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, this.canvas.height - this.fillLevel, this.canvas.width, this.fillLevel);

            // Add ripple effect
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.7)';
            this.ctx.lineWidth = 1;
            
            const rippleTime = Date.now();
            for (let x = 0; x < this.canvas.width; x += 15) {
                const wave = 
                    Math.sin(x / 30 + rippleTime / 600) * 1.5 + 
                    Math.sin(x / 20 + rippleTime / 400) * 1;
                const y = this.canvas.height - this.fillLevel + wave;
                
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }

        // Continue animation
        requestAnimationFrame(time => this.animate(time));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sandAnimation = new RainAnimation(document.getElementById('sandCanvas'));
    });
} else {
    window.sandAnimation = new RainAnimation(document.getElementById('sandCanvas'));
}