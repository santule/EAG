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
        this.isPaused = false;
        this.waterLevel = 0;
        this.duration = 5;
        this.startTime = 0;
        this.lastTime = 0;
        this.lastDropTime = 0;
        this.elapsedBeforePause = 0;
        this.rippleOffset = 0;
        
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

    createDrop() {
        const width = 1.5; // Thin drops
        const length = Math.random() * 10 + 15; // Natural length 15-25px
        const speed = Math.random() * 7 + 5; // Fast falling speed 5-12 units
        const x = Math.random() * (this.canvas.width + 50) - 25; // Wide spawn area
        const opacity = Math.random() * 0.3 + 0.2; // Semi-transparent
        
        return {
            x,
            y: -length,
            width,
            length,
            speed,
            opacity
        };
    }

    start(duration) {
        this.duration = duration;
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.lastDropTime = this.startTime;
        this.elapsedBeforePause = 0;
        this.drops = [];
        this.waterLevel = 0;
        this.rippleOffset = 0;
        
        // Start rain sound
        this.rainSound.currentTime = 0;
        this.rainSound.play();
        
        requestAnimationFrame(() => this.animate());
    }

    pause() {
        if (this.isRunning) {
            this.isPaused = true;
            this.isRunning = false;
            this.elapsedBeforePause += performance.now() - this.startTime;
            this.rainSound.pause();
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.isRunning = true;
            this.startTime = performance.now();
            this.lastTime = this.startTime;
            this.lastDropTime = this.startTime;
            this.rainSound.play();
            requestAnimationFrame(() => this.animate());
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.drops = [];
        this.waterLevel = 0;
        this.elapsedBeforePause = 0;
        this.rippleOffset = 0;
        this.rainSound.pause();
        this.rainSound.currentTime = 0;
        this.clear();
    }

    complete() {
        this.isRunning = false;
        this.isPaused = false;
        this.rainSound.pause();
        this.alarmSound.currentTime = 0;
        this.alarmSound.play();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRipples() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(176, 224, 230, 0.4)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 10) {
            const y = this.canvas.height - this.waterLevel + 
                     Math.sin(x / 30 + this.rippleOffset) * 2 + 
                     Math.sin(x / 15 + this.rippleOffset * 1.5) * 1;
            
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        const totalElapsed = this.elapsedBeforePause + (currentTime - this.startTime);
        const progress = Math.min(totalElapsed / (this.duration * 1000), 1);

        // Create new drops
        if (currentTime - this.lastDropTime > 30) { // 5 drops every 30ms
            for (let i = 0; i < 5; i++) {
                this.drops.push(this.createDrop());
            }
            this.lastDropTime = currentTime;
        }

        // Clear canvas
        this.clear();

        // Update and draw drops with slant
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, 0);
        this.ctx.rotate(-20 * Math.PI / 180); // -20° slant angle
        this.ctx.translate(-this.canvas.width / 2, 0);

        this.drops = this.drops.filter(drop => {
            drop.y += drop.speed;
            
            // Draw drop
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(176, 224, 230, ${drop.opacity})`;
            this.ctx.lineWidth = drop.width;
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y - drop.length);
            this.ctx.stroke();
            
            return drop.y < this.canvas.height + drop.length;
        });

        this.ctx.restore();

        // Draw water level with smooth fill
        const targetLevel = this.canvas.height * progress;
        this.waterLevel += (targetLevel - this.waterLevel) * 0.1;
        
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - this.waterLevel, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(176, 224, 230, 0.2)');
        gradient.addColorStop(1, 'rgba(176, 224, 230, 0.4)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.canvas.height - this.waterLevel, this.canvas.width, this.waterLevel);

        // Draw ripples
        this.rippleOffset += 0.05;
        this.drawRipples();

        // Continue animation
        this.lastTime = currentTime;
        if (progress < 1) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.complete();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sandAnimation = new RainAnimation(document.getElementById('sandCanvas'));
    });
} else {
    window.sandAnimation = new RainAnimation(document.getElementById('sandCanvas'));
}