// Initialize canvas size
function initCanvas() {
    const canvas = document.getElementById('sandCanvas');
    const container = document.querySelector('.container');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
} else {
    initCanvas();
}
