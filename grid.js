const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Configuration
const dotSpacing = 24;
const baseRadius = 1;
const maxBoost = 1.0; 
const baseSigma = 30;
const speed = 0.16; 

let mouse = { x: -1000, y: -1000 };
let viewMouse = { x: -1000, y: -1000 };
let prevMouse = { x: 0, y: 0 };
let currentSigma = baseSigma;

// Existing mouse listener
window.addEventListener('mousemove', (e) => {
    updateCoordinates(e.clientX, e.clientY);
});

// New Touch listeners
window.addEventListener('touchstart', (e) => {
    // We use e.touches[0] because mobile can track multiple fingers
    updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
});

function updateCoordinates(x, y) {
    mouse.x = x;
    mouse.y = y;
    console.log(x, y)
}

// Handle Resize (Retina/High-DPI Support)
function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
}

window.addEventListener('resize', resize);
resize();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dxVel = mouse.x - prevMouse.x;
    const dyVel = mouse.y - prevMouse.y;
    const velocity = Math.sqrt(dxVel * dxVel + dyVel * dyVel);
    
    const targetSigma = baseSigma + Math.min(velocity * 1.5, 200);
    currentSigma += (targetSigma - currentSigma) * 0.1;

    viewMouse.x += (mouse.x - viewMouse.x) * speed;
    viewMouse.y += (mouse.y - viewMouse.y) * speed;

    const gridColor = getComputedStyle(document.body)
        .getPropertyValue('--grid-color').trim();

    ctx.fillStyle = gridColor;

    // 5. Render Gaussian Grid
    for (let x = 0; x < window.innerWidth; x += dotSpacing) {
        for (let y = 0; y < window.innerHeight; y += dotSpacing) {
            const dx = x - viewMouse.x;
            const dy = y - viewMouse.y;
            const d2 = dx * dx + dy * dy;

            // Gaussian Function: r = r0 + boost * exp(-d^2 / 2σ^2)
            const intensity = Math.exp(-d2 / (2 * currentSigma * currentSigma));
            const r = baseRadius + maxBoost * intensity;

            if (r > 0.1) { // Performance optimization: don't draw invisible dots
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;
    requestAnimationFrame(draw);
}

draw();
