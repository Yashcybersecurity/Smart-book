const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(dir, { recursive: true });

const svg192 = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">',
  '<rect width="192" height="192" rx="32" fill="#111827"/>',
  '<text x="96" y="120" font-size="80" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">SB</text>',
  '</svg>'
].join('');

const svg512 = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
  '<rect width="512" height="512" rx="80" fill="#111827"/>',
  '<text x="256" y="310" font-size="200" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">SB</text>',
  '</svg>'
].join('');

fs.writeFileSync(path.join(dir, 'icon-192x192.svg'), svg192);
fs.writeFileSync(path.join(dir, 'icon-512x512.svg'), svg512);

// Overwrite the placeholder .png files with the SVG content
// (browsers handle SVG icons in manifests)
fs.writeFileSync(path.join(dir, 'icon-192x192.png'), svg192);
fs.writeFileSync(path.join(dir, 'icon-512x512.png'), svg512);

console.log('Icons generated successfully.');
