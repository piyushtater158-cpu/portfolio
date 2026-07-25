// One-off generator for the social share card (public/og-cover.png, 1200×630).
// Re-run with `bun scripts/gen-og.mjs` if the name/tagline changes.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../public/og-cover.png', import.meta.url));

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07090c"/>
      <stop offset="1" stop-color="#0f1620"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.6">
      <stop offset="0" stop-color="#1e2a3a" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#07090c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g font-family="Segoe UI, Arial, Helvetica, sans-serif">
    <text x="80" y="300" fill="#f5f7fa" font-size="112" font-weight="700" letter-spacing="6">PIYUSH TATER</text>
    <text x="84" y="372" fill="#7fd1c4" font-size="40" font-weight="500" letter-spacing="2">GenAI Systems Developer</text>
    <text x="84" y="430" fill="#9aa7b4" font-size="30" font-weight="400">Building living AI systems, workflows, and automation for organizations.</text>
    <text x="84" y="560" fill="#5f6b78" font-size="28" font-weight="500" letter-spacing="3">piyushtater.com</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('wrote', out);
