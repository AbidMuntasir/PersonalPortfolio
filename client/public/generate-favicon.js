const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas of 512x512 pixels
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Create a purple gradient background
const gradient = ctx.createLinearGradient(0, 0, 512, 512);
gradient.addColorStop(0, '#9333EA');
gradient.addColorStop(1, '#7C3AED');

// Draw a filled circle with the gradient
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(256, 256, 256, 0, Math.PI * 2);
ctx.fill();

// Add text "A"
ctx.fillStyle = 'white';
ctx.font = 'bold 250px Arial, Helvetica, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('A', 256, 280);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./client/public/favicon.png', buffer);

// Create a smaller version for apple-touch-icon
const appleCanvas = createCanvas(180, 180);
const appleCtx = appleCanvas.getContext('2d');

// Create a purple gradient background
const appleGradient = appleCtx.createLinearGradient(0, 0, 180, 180);
appleGradient.addColorStop(0, '#9333EA');
appleGradient.addColorStop(1, '#7C3AED');

// Draw a filled circle with the gradient
appleCtx.fillStyle = appleGradient;
appleCtx.beginPath();
appleCtx.arc(90, 90, 90, 0, Math.PI * 2);
appleCtx.fill();

// Add text "A"
appleCtx.fillStyle = 'white';
appleCtx.font = 'bold 90px Arial, Helvetica, sans-serif';
appleCtx.textAlign = 'center';
appleCtx.textBaseline = 'middle';
appleCtx.fillText('A', 90, 98);

// Save as PNG
const appleBuffer = appleCanvas.toBuffer('image/png');
fs.writeFileSync('./client/public/apple-touch-icon.png', appleBuffer);

console.log('Favicon PNG files generated!'); 