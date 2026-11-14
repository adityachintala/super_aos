// Draws the link-preview (Open Graph) image and saves it as public/og.png.
// Run with:  bun scripts/make-og.ts
// The picture is described as SVG and rendered with sharp; text uses system fonts.

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { doodles, type DoodleName } from '../src/lib/doodles';

const W = 1200;
const H = 630;

// The sticky-note colours from src/styles/board.css.
const NOTE: Record<string, string> = {
  yellow: '#fff1a8',
  coral: '#ffc6c6',
  teal: '#c3faf5',
  rose: '#fdd9ee',
  orange: '#ffe0bf',
  lilac: '#e2e0ff',
  mint: '#cdf5df',
};
const INK = '#1c1c1e';
const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const HAND = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";

/** A doodle from the site, with its CSS colour variables replaced by real colours. */
function doodle(name: DoodleName, x: number, y: number, size: number, rotate = 0) {
  const inner = doodles[name].replace(/var\(--note-(\w+)\)/g, (_, c) => NOTE[c]).replace(/currentColor/g, INK);
  const s = size / 100;
  return `<g transform="translate(${x} ${y}) rotate(${rotate} ${size / 2} ${size / 2}) scale(${s})" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
}

/** A tilted sticky note with a strip of tape. */
function sticky(x: number, y: number, w: number, h: number, color: string, tilt: number, n: string, title: string, text: string) {
  return `<g transform="translate(${x} ${y}) rotate(${tilt} ${w / 2} ${h / 2})">
    <rect x="4" y="8" width="${w}" height="${h}" rx="6" fill="#050038" opacity="0.10"/>
    <path d="M0 4a4 4 0 014-4h${w - 8}a4 4 0 014 4v${h - 22}a18 18 0 01-18 18H4a4 4 0 01-4-4z" fill="${color}"/>
    <rect x="${w / 2 - 46}" y="-12" width="92" height="24" fill="#ffffff" opacity="0.7" transform="rotate(-2 ${w / 2} 0)"/>
    <text x="24" y="62" font-family="${HAND}" font-size="40" font-weight="700" fill="${INK}">${n}.</text>
    <text x="70" y="60" font-family="${SANS}" font-size="29" font-weight="600" fill="${INK}">${title}</text>
    <text x="24" y="100" font-family="${SANS}" font-size="21" fill="${INK}" opacity="0.8">${text}</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1.5" fill="#d3d6df"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#f7f8fa"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- logo -->
  <g transform="translate(72 64)">
    <rect width="60" height="60" rx="14" fill="#ffd02f" transform="rotate(-6 30 30)"/>
    <text x="30" y="41" text-anchor="middle" font-family="${SANS}" font-size="27" font-weight="700" fill="${INK}">OS</text>
    <text x="82" y="42" font-family="${SANS}" font-size="34" font-weight="600" fill="${INK}">Super AOS</text>
  </g>

  <!-- headline -->
  <text font-family="${SANS}" font-size="78" font-weight="600" fill="${INK}" letter-spacing="-2.5">
    <tspan x="72" y="266">Operating systems,</tspan>
    <tspan x="72" y="358">one small bite</tspan>
    <tspan x="72" y="450">at a time.</tspan>
  </text>
  <path d="M76 378 q 16 -12 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 28 0" fill="none" stroke="#ffd02f" stroke-width="9" stroke-linecap="round"/>

  <text x="72" y="520" font-family="${SANS}" font-size="29" fill="#555a6a">A free, visual course on Advanced Operating Systems.</text>
  <text x="72" y="562" font-family="${SANS}" font-size="29" fill="#555a6a">Short sections, simulators and fun facts.</text>

  <!-- sticky notes -->
  ${sticky(790, 70, 330, 132, NOTE.yellow, -3, '1', 'Read one bite', 'Short sections, one at a time.')}
  ${sticky(820, 246, 330, 132, NOTE.teal, 2.5, '2', 'Play with it', 'Drag, click, break things.')}
  ${sticky(780, 424, 330, 132, NOTE.rose, -1.5, '3', 'Prove it', 'Quick questions as you go.')}

  <!-- doodles -->
  ${doodle('chip', 668, 96, 84, -8)}
  ${doodle('bulb', 690, 300, 78, 10)}
  ${doodle('gridlock', 560, 392, 78, 6)}
</svg>`;

const outDir = join(import.meta.dir, '..', 'public');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'og.png');
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
const meta = await sharp(out).metadata();
console.log(`wrote ${out} (${meta.width} x ${meta.height})`);
