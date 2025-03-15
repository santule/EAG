class SandParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.speed = 1 + Math.random() * 2; // Randomized speed
        this.drift = (Math.random() - 0.5) * 0.8; // Initial drift direction
        this.color = this.randomizeColor(color);
        this.size = 1.5 + Math.random(); // Randomized size
        this.opacity = 0.7 + Math.random() * 0.3; // Randomized opacity
        this.settled = false;
        this.bounceChance = Math.random() * 0.05; // Small chance to bounce
        this.stickiness = Math.random(); // How likely to stick vs. roll
    }

    randomizeColor(baseColor) {
        // Slightly randomize the color to create more visual interest
        const rgb = this.hexToRgb(baseColor);
        if (!rgb) return baseColor;
        
        // Adjust RGB values slightly
        const variance = 15;
        const r = Math.max(0, Math.min(255, rgb.r + (Math.random() - 0.5) * variance));
        const g = Math.max(0, Math.min(255, rgb.g + (Math.random() - 0.5) * variance));
        const b = Math.max(0, Math.min(255, rgb.b + (Math.random() - 0.5) * variance));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
    
    hexToRgb(hex) {
        // Convert hex to rgb
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    update(width, height, grid, cellSize) {
        if (this.settled) return;

        // Apply gravity with randomized speed
        this.y += this.speed;
        
        // Apply drift with random variations
        if (Math.random() < 0.2) {
            this.drift += (Math.random() - 0.5) * 0.3;
        }
        this.drift *= 0.95; 
        this.x += this.drift;

        // Keep particles within canvas bounds
        if (this.x < this.size) {
            this.x = this.size;
            this.drift = Math.abs(this.drift) * 0.5; // Bounce off edge
        }
        if (this.x > width - this.size) {
            this.x = width - this.size;
            this.drift = -Math.abs(this.drift) * 0.5; // Bounce off edge
        }
        
        // Check if particle has reached the bottom
        if (this.y >= height - this.size) {
            this.settled = true;
            this.y = height - this.size;
            this.markGridPosition(grid, width, height, cellSize);
            return;
        }

        // Get grid cell coordinates
        const gridX = Math.floor(this.x / cellSize);
        const gridY = Math.floor((this.y + this.speed) / cellSize); // Position after next move
        
        // Check if there's something directly below
        if (this.checkGridOccupied(grid, gridX, gridY, width, height, cellSize)) {
            // Small chance to "bounce" for more interesting patterns
            if (Math.random() < this.bounceChance) {
                this.y -= this.speed * 0.5;
                this.drift = (Math.random() - 0.5) * 2;
                return;
            }
            
            // Try to slide left or right with randomized preference
            const leftX = gridX - 1;
            const rightX = gridX + 1;
            
            const canSlideLeft = !this.checkGridOccupied(grid, leftX, gridY - 1, width, height, cellSize) && 
                                !this.checkGridOccupied(grid, leftX, gridY, width, height, cellSize);
                                
            const canSlideRight = !this.checkGridOccupied(grid, rightX, gridY - 1, width, height, cellSize) &&
                                 !this.checkGridOccupied(grid, rightX, gridY, width, height, cellSize);

            // Randomize the preferred direction based on drift
            const preferRight = this.drift > 0;
            
            if (canSlideLeft && canSlideRight) {
                // Slide in the preferred direction with some randomness
                if (Math.random() < 0.7) {
                    this.x += (preferRight ? 1 : -1) * (cellSize/2 + Math.random());
                } else {
                    this.x += (preferRight ? -1 : 1) * (cellSize/2 + Math.random());
                }
            } else if (canSlideLeft) {
                this.x -= cellSize/2 + Math.random();
            } else if (canSlideRight) {
                this.x += cellSize/2 + Math.random();
            } else {
                // Check if we should settle based on stickiness
                if (Math.random() < this.stickiness) {
                    // Settle here
                    this.settled = true;
                    this.y = (gridY - 1) * cellSize + this.size;
                    this.markGridPosition(grid, width, height, cellSize);
                } else {
                    // Try to find another path by adding more drift
                    this.drift += (Math.random() - 0.5) * 2;
                }
            }
        }
    }

    checkGridOccupied(grid, gridX, gridY, width, height, cellSize) {
        // Calculate grid dimensions
        const gridWidth = Math.ceil(width / cellSize);
        const gridHeight = Math.ceil(height / cellSize);
        
        // Check if coordinates are within bounds
        if (gridX < 0 || gridX >= gridWidth || gridY < 0) {
            return false;
        }
        
        if (gridY >= gridHeight) {
            return true; // Bottom of screen is always "occupied"
        }
        
        // Check if the grid cell is occupied
        return grid[gridY * gridWidth + gridX];
    }

    markGridPosition(grid, width, height, cellSize) {
        // Calculate grid coordinates and dimensions
        const gridWidth = Math.ceil(width / cellSize);
        const gridHeight = Math.ceil(height / cellSize);
        const gridX = Math.floor(this.x / cellSize);
        const gridY = Math.floor(this.y / cellSize);
        
        if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
            grid[gridY * gridWidth + gridX] = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class SandAnimation {
    constructor() {
        this.canvas = document.getElementById('sandCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;
        this.spawnPoints = [];
        this.streamColors = [];
        this.grid = [];
        this.cellSize = 3; // Cell size for collision detection
        this.spawnTimer = 0;
        this.spawnInterval = 1; // Frames between spawns
        this.spawnVariance = true; // Enable random spawn patterns
        
        // Set canvas style to be behind other content
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1'; // Behind other content
        this.canvas.style.pointerEvents = 'none'; // Don't intercept clicks
        
        this.resize();
        
        window.addEventListener('resize', () => {
            this.resize();
            this.updateSpawnPoints();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.updateSpawnPoints();
        this.initializeGrid();
    }

    initializeGrid() {
        // Create a grid to track which cells are occupied
        const gridWidth = Math.ceil(this.canvas.width / this.cellSize);
        const gridHeight = Math.ceil(this.canvas.height / this.cellSize);
        this.grid = new Array(gridWidth * gridHeight).fill(false);
    }

    updateSpawnPoints() {
        const width = this.canvas.width;
        // Create many spawn points for better coverage and more variation
        this.spawnPoints = [];
        
        // Add fixed spawn points
        const basePoints = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        
        // Add some random points between the fixed ones
        for (let i = 0; i < basePoints.length; i++) {
            this.spawnPoints.push(width * basePoints[i]);
            
            // Add 1-2 random points between each fixed point
            if (i < basePoints.length - 1) {
                const start = basePoints[i];
                const end = basePoints[i + 1];
                const randomPoints = 1 + Math.floor(Math.random() * 2);
                
                for (let j = 0; j < randomPoints; j++) {
                    const randomFactor = Math.random();
                    this.spawnPoints.push(width * (start + (end - start) * randomFactor));
                }
            }
        }
        
        // Get colors and assign to spawn points
        const colors = this.getColors();
        this.streamColors = [];
        for (let i = 0; i < this.spawnPoints.length; i++) {
            this.streamColors.push(colors[i % colors.length]);
        }
    }

    getColors() {
        const defaultColors = ['#f4d58d', '#e8c872', '#d8b668', '#c19d55', '#a2834d'];
        try {
            const customColors = getComputedStyle(document.body)
                .getPropertyValue('--sand-colors')
                .split(',')
                .map(c => c.trim())
                .filter(c => c);
                
            return customColors.length > 0 ? customColors : defaultColors;
        } catch (e) {
            return defaultColors;
        }
    }

    addParticles() {
        this.spawnTimer++;
        if (this.spawnTimer < this.spawnInterval) return;
        this.spawnTimer = 0;
        
        // Choose a random subset of spawn points for this frame
        let activeSpawnPoints = [];
        
        if (this.spawnVariance) {
            // Randomly choose which spawn points to use this frame
            // This creates more interesting patterns
            const spawnCount = 3 + Math.floor(Math.random() * (this.spawnPoints.length - 3));
            const shuffledIndices = [...Array(this.spawnPoints.length).keys()]
                .sort(() => Math.random() - 0.5)
                .slice(0, spawnCount);
                
            activeSpawnPoints = shuffledIndices.map(i => ({
                x: this.spawnPoints[i],
                color: this.streamColors[i]
            }));
        } else {
            // Use all spawn points
            activeSpawnPoints = this.spawnPoints.map((x, i) => ({
                x,
                color: this.streamColors[i]
            }));
        }
        
        // Add particles at the active spawn points
        for (const point of activeSpawnPoints) {
            // Randomize particle count per spawn
            const particleCount = Math.random() < 0.7 ? 1 : 2;
            
            for (let j = 0; j < particleCount; j++) {
                const spawnX = point.x + (Math.random() - 0.5) * 15; // Wide spawn area
                this.particles.push(new SandParticle(
                    spawnX,
                    0,
                    point.color
                ));
            }
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.initializeGrid();
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        this.particles = [];
        this.initializeGrid();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Manage particle count
        const maxParticles = 20000;
        if (this.particles.length > maxParticles) {
            const settledParticles = this.particles.filter(p => p.settled);
            const unsettledParticles = this.particles.filter(p => !p.settled);
            
            if (settledParticles.length > maxParticles * 0.9) {
                // Create a more random removal pattern that maintains visual interest
                const toKeep = Math.floor(maxParticles * 0.9);
                
                // Shuffle the settled particles and keep a random selection
                // This creates more interesting patterns as particles disappear
                const shuffled = [...settledParticles].sort(() => 0.5 - Math.random());
                this.particles = [
                    ...shuffled.slice(0, toKeep),
                    ...unsettledParticles
                ];
                
                // Rebuild grid based on remaining particles
                this.initializeGrid();
                for (const p of this.particles) {
                    if (p.settled) {
                        p.markGridPosition(this.grid, this.canvas.width, this.canvas.height, this.cellSize);
                    }
                }
            } else {
                // Keep all settled particles and as many unsettled as we can fit
                const toKeep = maxParticles - settledParticles.length;
                this.particles = [
                    ...settledParticles,
                    ...unsettledParticles.slice(0, toKeep)
                ];
            }
        }

        // Update and draw all particles
        for (const particle of this.particles) {
            particle.update(this.canvas.width, this.canvas.height, this.grid, this.cellSize);
            particle.draw(this.ctx);
        }

        // Add more particles
        this.addParticles();

        // Occasionally update spawn points for more variety
        if (Math.random() < 0.001) {
            this.updateSpawnPoints();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Modify the initialization function
function initSandCanvas() {
    // Check if canvas exists, if not create it
    let canvas = document.getElementById('sandCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'sandCanvas';
        document.body.appendChild(canvas);
    }
    
    // Initialize animation but don't start it
    window.sandAnimation = new SandAnimation();
    // Don't auto-start the animation
}

// Run initialization when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSandCanvas);
} else {
    initSandCanvas();
}