class RainDrop {
    constructor(x, y, canvasWidth) {
        this.x = x;
        this.y = y;
        this.speed = 5 + Math.random() * 7; 
        this.size = 1.5;  
        this.opacity = 0.5;  
        this.length = 15 + Math.random() * 10;  
        this.slant = -20; 
        this.canvasWidth = canvasWidth;
        this.color = `rgba(176, 224, 230, ${0.3 + Math.random() * 0.3})`; 
    }

    update(height, waterLevel) {
        this.y += this.speed;
        this.x += this.speed * Math.tan(this.slant * Math.PI / 180);
        return this.y < waterLevel && this.x > 0 && this.x < this.canvasWidth;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.globalAlpha = this.opacity;
        
        const endX = this.x + Math.tan(this.slant * Math.PI / 180) * this.length;
        const endY = this.y + this.length;
        
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

class RainAnimation {
    constructor() {
        this.canvas = document.getElementById('sandCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context');
            return;
        }

        this.drops = [];
        this.isRunning = false;
        this.spawnInterval = null;
        this.animationFrame = null;
        this.waterLevel = this.canvas.height;
        this.startTime = null;
        this.duration = null;
        this.fillLevel = 0;
        this.width = this.canvas.width;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        document.addEventListener('timerUpdate', (e) => {
            if (this.isRunning && this.startTime && this.duration) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                const progress = Math.min(elapsed / this.duration, 1);
                this.waterLevel = this.canvas.height - (this.canvas.height * progress);
            }
        });
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.waterLevel = this.canvas.height;
        this.width = this.canvas.width;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.fillLevel = 0;
        
        if (window.timer && window.timer.timeLeft) {
            this.duration = window.timer.timeLeft;
            this.waterLevel = this.canvas.height;
        } else {
            this.duration = 60;
            this.waterLevel = this.canvas.height;
        }
        
        this.spawnInterval = setInterval(() => {
            for (let i = 0; i < 5; i++) { 
                const x = Math.random() * (this.width + 100) - 50;
                this.drops.push(new RainDrop(x, -20, this.width));
            }
            
            if (this.fillLevel < this.canvas.height) {
                this.fillLevel += 0.2;
            }
        }, 30); 

        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.startTime && this.duration) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const progress = Math.min(elapsed / this.duration, 1);
            this.waterLevel = this.canvas.height - (this.canvas.height * progress);
        }

        const bottomWaterHeight = Math.min(this.fillLevel, this.canvas.height - this.waterLevel);
        if (bottomWaterHeight > 0) {
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height - bottomWaterHeight, 0, this.canvas.height);
            gradient.addColorStop(0, 'rgba(176, 224, 230, 0.3)'); 
            gradient.addColorStop(1, 'rgba(176, 224, 230, 0.5)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, this.canvas.height - bottomWaterHeight, this.canvas.width, bottomWaterHeight);
        }

        this.drops = this.drops.filter(drop => {
            const isAlive = drop.update(this.canvas.height, this.canvas.height - bottomWaterHeight);
            if (isAlive) {
                drop.draw(this.ctx);
            }
            return isAlive;
        });

        if (bottomWaterHeight > 0) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(176, 224, 230, 0.6)';
            this.ctx.lineWidth = 1;
            const waterY = this.canvas.height - bottomWaterHeight;
            for (let x = 0; x < this.canvas.width; x += 15) { 
                const wave = Math.sin(x / 20 + Date.now() / 400) * 2; 
                if (x === 0) {
                    this.ctx.moveTo(x, waterY + wave);
                } else {
                    this.ctx.lineTo(x, waterY + wave);
                }
            }
            this.ctx.stroke();
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    pause() {
        this.isRunning = false;
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    reset() {
        this.pause();
        this.drops = [];
        this.waterLevel = this.canvas.height;
        this.startTime = null;
        this.duration = null;
        this.fillLevel = 0;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sandAnimation = new RainAnimation();
    });
} else {
    window.sandAnimation = new RainAnimation();
}