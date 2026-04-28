const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Configuration
const dotSpacing = 24;
const scale = 1.0;
const baseIntensity = 1.5;
const sigma = 30;
const decay = 2.5;
const growth = 5.0;
const clickBoost = 1.5;

let rows = Math.floor(window.innerHeight / dotSpacing) + 1;
let cols = Math.floor(window.innerWidth / dotSpacing) + 1;

let intensities = new Float32Array(rows * cols)
intensities.fill(0)

let mouse = { x: -1000, y: -1000 };

// Existing mouse listener
window.addEventListener('mousemove', (e) => {
    updateCoordinates(e.clientX, e.clientY);
});

// New Touch listeners
window.addEventListener('touchstart', (e) => {
    isPressed = true;
    updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
});
window.addEventListener('touchend', () => isPressed = false);

let mousePressed = false
window.addEventListener('mousedown', () => mousePressed = true);
window.addEventListener('mouseup', () => mousePressed = false);

function updateCoordinates(x, y) {
    mouse.x = x;
    mouse.y = y;
}

// Handle Resize (Retina/High-DPI Support)
function resize() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    ctx.scale(dpr, dpr);

    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    rows = Math.floor(window.innerHeight / dotSpacing) + 1;
    cols = Math.floor(window.innerWidth / dotSpacing) + 1;
    intensities = new Float32Array(rows * cols)
    intensities.fill(0)
}

window.addEventListener('resize', resize);
resize();

let lastTime = 0

function draw(t) {
    if (!lastTime) lastTime = t
    let dt = (t - lastTime) / 1000
    if (dt > 0.1) dt = 0.016 // Clamp
    console.log(dt)
    lastTime = t

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridColor = getComputedStyle(document.body)
        .getPropertyValue('--grid-color').trim();

    ctx.fillStyle = gridColor;

    for (let i = 0; i < intensities.length; i++) {
        const x = (i % cols) * dotSpacing
        const y = ((i / cols) | 0) * dotSpacing

        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;

        const gaussian = Math.exp(-d2 / (2 * sigma * sigma * (mousePressed ? clickBoost : 1)));

        intensities[i] += (growth * (mousePressed ? clickBoost : 1) * gaussian - decay * (intensities[i] - baseIntensity)) * dt

        r = intensities[i] * scale
        if (r > 0.1) { // Performance optimization: don't draw invisible dots
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
