/**
 * composer.js — Canvas Image Composition Engine
 *
 * Draws a full Kabinet Avantera / COMIT Booth styled frame on a 1200×900 canvas
 * with frame-specific decorations: arch portal, circuit board patterns,
 * floating holographic elements, neon glow effects.
 *
 * All processing is client-side (no server upload).
 */

import { getFrameSlots } from '../frames/frameConfig.js';

const W = 1200;
const H = 900;

// Layout zones
const TOP_H    = 80;   // top header bar
const BOT_H    = 100;  // bottom branding bar
const SIDE_W   = 50;   // left/right side panel width
const PHOTO_X  = SIDE_W;
const PHOTO_Y  = TOP_H;
const PHOTO_W  = W - SIDE_W * 2;
const PHOTO_H  = H - TOP_H - BOT_H;

// ── Utilities ──────────────────────────────────────────────────────────────

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hex(color, alpha) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return color + a;
}

/** Draw a photo in a slot using object-fit: cover logic */
function drawPhotoInSlot(ctx, img, slot, r = 8) {
  const { x, y, width, height } = slot;
  const ia = img.naturalWidth / img.naturalHeight;
  const sa = width / height;
  let sx, sy, sw, sh;
  if (ia > sa) { sh = img.naturalHeight; sw = sh * sa; sx = (img.naturalWidth - sw) / 2; sy = 0; }
  else         { sw = img.naturalWidth;  sh = sw / sa; sx = 0; sy = (img.naturalHeight - sh) / 2; }

  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, x, y, width, height, r);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
  ctx.restore();
}

/** Draw glowing neon line */
function glowLine(ctx, x1, y1, x2, y2, color, width = 1.5, blur = 10) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = blur;
  ctx.strokeStyle = color;
  ctx.lineWidth   = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** Draw glowing dot */
function glowDot(ctx, x, y, r, color, blur = 8) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur  = blur;
  ctx.fillStyle   = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw a rotated diamond (crystal shape) */
function drawDiamond(ctx, cx, cy, size, color, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx,         cy - size);
  ctx.lineTo(cx + size,  cy);
  ctx.lineTo(cx,         cy + size);
  ctx.lineTo(cx - size,  cy);
  ctx.closePath();
  ctx.fillStyle = hex(color, 0.08);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Draw a futuristic floating card outline */
function drawFloatCard(ctx, x, y, w, h, color, alpha = 0.45) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 6;
  ctx.lineWidth   = 1;
  ctx.fillStyle   = hex(color, 0.05);
  ctx.beginPath();
  roundedRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ── Background ─────────────────────────────────────────────────────────────

function drawBg(ctx, frame) {
  const grad = ctx.createLinearGradient(0, 0, W, H);
  switch (frame.id) {
    case 'comit-tech':
      grad.addColorStop(0,   '#0B1F3A');
      grad.addColorStop(0.5, '#071426');
      grad.addColorStop(1,   '#0D2748');
      break;
    case 'avantera-city':
      grad.addColorStop(0,   '#071426');
      grad.addColorStop(0.5, '#0A1E3A');
      grad.addColorStop(1,   '#07142B');
      break;
    case 'comit-classic':
      grad.addColorStop(0, '#071426');
      grad.addColorStop(1, '#0B1F3A');
      break;
    default: // avantera-future
      grad.addColorStop(0,   '#071426');
      grad.addColorStop(0.4, '#0B1F3A');
      grad.addColorStop(1,   '#071426');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial spotlight
  const spot = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.6);
  spot.addColorStop(0,   hex(frame.accentColor, 0.06));
  spot.addColorStop(0.5, hex(frame.accentColor, 0.02));
  spot.addColorStop(1,   'transparent');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);

  // Dot-grid overlay (edges)
  const dotGrad = ctx.createRadialGradient(W/2, H/2, 200, W/2, H/2, W * 0.8);
  dotGrad.addColorStop(0,   'transparent');
  dotGrad.addColorStop(0.7, hex(frame.accentColor, 0.04));
  dotGrad.addColorStop(1,   hex(frame.accentColor, 0.08));
  ctx.fillStyle = dotGrad;
  ctx.fillRect(0, 0, W, H);
}

// ── Top Header ─────────────────────────────────────────────────────────────

function drawTopHeader(ctx, frame) {
  // Header background
  const hGrad = ctx.createLinearGradient(0, 0, 0, TOP_H);
  hGrad.addColorStop(0,   hex('#0D2748', 1));
  hGrad.addColorStop(1,   hex('#071426', 1));
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, W, TOP_H);

  // Bottom glow line of header
  const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
  lineGrad.addColorStop(0,    'transparent');
  lineGrad.addColorStop(0.25, frame.accentColor);
  lineGrad.addColorStop(0.5,  frame.overlayColor);
  lineGrad.addColorStop(0.75, frame.accentColor);
  lineGrad.addColorStop(1,    'transparent');
  ctx.save();
  ctx.shadowColor = frame.accentColor;
  ctx.shadowBlur  = 12;
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, TOP_H);
  ctx.lineTo(W, TOP_H);
  ctx.stroke();
  ctx.restore();

  // Left circuit decoration
  drawHeaderCircuit(ctx, 40, TOP_H / 2, 'left', frame.accentColor);

  // Center: COMIT BOOTH text
  ctx.save();
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.font        = 'bold 28px Orbitron, monospace';
  ctx.fillStyle   = frame.overlayColor;
  ctx.shadowColor = frame.overlayColor;
  ctx.shadowBlur  = 16;
  ctx.fillText('COMIT BOOTH', W / 2, TOP_H / 2 - 6);

  // Subtitle
  ctx.font      = '11px Inter, sans-serif';
  ctx.fillStyle = '#C8D4E380';
  ctx.shadowBlur = 0;
  ctx.fillText('Community of Information Technology', W / 2, TOP_H / 2 + 14);
  ctx.restore();

  // Right: KABINET AVANTERA text
  ctx.save();
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'middle';
  ctx.font         = 'bold 10px Orbitron, monospace';
  ctx.fillStyle    = frame.accentColor;
  ctx.shadowColor  = frame.accentColor;
  ctx.shadowBlur   = 8;
  ctx.letterSpacing = '0.1em';
  ctx.fillText('KABINET AVANTERA', W - 50, TOP_H / 2 - 6);
  ctx.font      = '9px Inter, sans-serif';
  ctx.fillStyle = '#8899AA';
  ctx.shadowBlur = 0;
  ctx.fillText('Universitas Insan Pembangunan Indonesia', W - 50, TOP_H / 2 + 10);
  ctx.restore();

  // Right circuit decoration (mirrored)
  drawHeaderCircuit(ctx, W - 40, TOP_H / 2, 'right', frame.accentColor);
}

function drawHeaderCircuit(ctx, x, y, side, color) {
  const d = side === 'left' ? 1 : -1;
  ctx.save();
  glowLine(ctx, x, y, x + d * 60, y, color, 1, 6);
  glowLine(ctx, x + d * 60, y, x + d * 60, y - 15, color, 1, 6);
  glowLine(ctx, x + d * 60, y - 15, x + d * 100, y - 15, color, 1, 6);
  glowDot(ctx, x + d * 60, y, 3, color, 8);
  glowDot(ctx, x + d * 100, y - 15, 2.5, color, 6);
  ctx.restore();
}

// ── Bottom Branding ─────────────────────────────────────────────────────────

function drawBottomBar(ctx, frame, photoCount) {
  const by = H - BOT_H;

  // Background
  const bGrad = ctx.createLinearGradient(0, by, 0, H);
  bGrad.addColorStop(0, '#071426FF');
  bGrad.addColorStop(1, '#0B1F3AFF');
  ctx.fillStyle = bGrad;
  ctx.fillRect(0, by, W, BOT_H);

  // Top glow line
  const lg = ctx.createLinearGradient(0, 0, W, 0);
  lg.addColorStop(0,    'transparent');
  lg.addColorStop(0.2,  frame.accentColor);
  lg.addColorStop(0.5,  frame.overlayColor);
  lg.addColorStop(0.8,  frame.accentColor);
  lg.addColorStop(1,    'transparent');
  ctx.save();
  ctx.shadowColor = frame.accentColor;
  ctx.shadowBlur  = 10;
  ctx.strokeStyle = lg;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, by);
  ctx.lineTo(W, by);
  ctx.stroke();
  ctx.restore();

  // Left neon dots
  [by + 20, by + 40, by + 60].forEach((dotY, i) => {
    glowDot(ctx, 30, dotY, 2 - i * 0.3, frame.accentColor, 6);
  });
  // Right neon dots
  [by + 20, by + 40, by + 60].forEach((dotY, i) => {
    glowDot(ctx, W - 30, dotY, 2 - i * 0.3, frame.overlayColor, 6);
  });

  // Center: Main branding text
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';

  ctx.font      = 'bold 20px Orbitron, monospace';
  ctx.fillStyle = frame.accentColor;
  ctx.shadowColor = frame.accentColor;
  ctx.shadowBlur  = 14;
  ctx.fillText(frame.branding.topText, W / 2, by + 12);

  ctx.shadowBlur  = 0;
  ctx.font        = '10px Inter, sans-serif';
  ctx.fillStyle   = '#8899AACC';
  ctx.fillText(frame.branding.orgText, W / 2, by + 38);

  ctx.font      = 'bold 9px Orbitron, monospace';
  ctx.fillStyle = frame.accentColor;
  ctx.shadowColor = frame.accentColor;
  ctx.shadowBlur  = 6;
  ctx.fillText(frame.branding.bottomText, W / 2, by + 55);
  ctx.restore();

  // Date (bottom-left)
  ctx.save();
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'bottom';
  ctx.font         = '9px Orbitron, monospace';
  ctx.fillStyle    = '#8899AA88';
  const now = new Date();
  ctx.fillText(now.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }), 30, H - 10);
  ctx.restore();

  // Photo count (bottom-right)
  ctx.save();
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'bottom';
  ctx.font         = '9px Orbitron, monospace';
  ctx.fillStyle    = '#8899AA88';
  ctx.fillText(`${photoCount} PHOTO${photoCount > 1 ? 'S' : ''}`, W - 30, H - 10);
  ctx.restore();
}

// ── Side Panels ─────────────────────────────────────────────────────────────

function drawSidePanels(ctx, frame) {
  // Left side panel
  drawSidePanel(ctx, 0, TOP_H, SIDE_W, PHOTO_H, frame, 'left');
  // Right side panel
  drawSidePanel(ctx, W - SIDE_W, TOP_H, SIDE_W, PHOTO_H, frame, 'right');
}

function drawSidePanel(ctx, px, py, pw, ph, frame, side) {
  const color = frame.accentColor;
  const cx    = side === 'left' ? px + pw / 2 : px + pw / 2;
  const d     = side === 'left' ? 1 : -1;

  // Circuit lines running down the side
  const steps = 5;
  const stepH = ph / steps;
  for (let i = 0; i <= steps; i++) {
    const y = py + i * stepH;
    glowLine(ctx, cx, y, cx + d * 12, y, color, 0.8, 4);
    if (i < steps) {
      glowLine(ctx, cx + d * 12, y, cx + d * 12, y + stepH * 0.6, color, 0.8, 4);
    }
    glowDot(ctx, cx + d * 12, y, 2, color, 5);
  }

  // Vertical spine line
  glowLine(ctx, cx, py, cx, py + ph, color, 0.5, 3);
}

// ── Frame-Specific Overlay Decorations ─────────────────────────────────────

/**
 * Draw frame-specific overlay elements ON TOP of photos.
 * Each frame has a unique visual signature.
 */
function drawFrameOverlay(ctx, frame, slots, photoCount) {
  // Calculate the bounding box of all photo slots
  const xs = slots.flatMap(s => [s.x, s.x + s.width]);
  const ys = slots.flatMap(s => [s.y, s.y + s.height]);
  const bx1 = Math.min(...xs);
  const bx2 = Math.max(...xs);
  const by1 = Math.min(...ys);
  const by2 = Math.max(...ys);
  const bw   = bx2 - bx1;
  const bh   = by2 - by1;
  const bcx  = (bx1 + bx2) / 2;
  const bcy  = (by1 + by2) / 2;

  switch (frame.id) {
    case 'avantera-future':
      drawOverlayAvanteraFuture(ctx, frame, bx1, by1, bw, bh, bcx, bcy);
      break;
    case 'comit-tech':
      drawOverlayComitTech(ctx, frame, bx1, by1, bw, bh);
      break;
    case 'avantera-city':
      drawOverlayAvanteraCity(ctx, frame, bx1, by1, bw, bh, bcx, bcy);
      break;
    case 'comit-classic':
      drawOverlayComitClassic(ctx, frame, bx1, by1, bw, bh);
      break;
    default:
      drawOverlayAvanteraFuture(ctx, frame, bx1, by1, bw, bh, bcx, bcy);
  }

  // Universal: photo slot borders
  slots.forEach(slot => {
    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, slot.x, slot.y, slot.width, slot.height, 8);
    ctx.strokeStyle = hex(frame.accentColor, 0.5);
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = frame.accentColor;
    ctx.shadowBlur  = 8;
    ctx.stroke();
    ctx.restore();
  });
}

/** Avantera Future — arch portal + floating crystals */
function drawOverlayAvanteraFuture(ctx, frame, bx, by, bw, bh, bcx, bcy) {
  const color   = frame.accentColor;
  const color2  = frame.overlayColor;
  const PAD_ARC = 16;

  // Multi-layer glowing arch (rounded rect) around the entire photo grid
  const layers = [
    { offset: 24, opacity: 0.12, blur: 30, width: 4 },
    { offset: 14, opacity: 0.25, blur: 20, width: 3 },
    { offset:  7, opacity: 0.50, blur: 14, width: 2 },
    { offset:  0, opacity: 1.00, blur:  8, width: 2 },
  ];

  layers.forEach(({ offset, opacity, blur, width }) => {
    ctx.save();
    ctx.beginPath();
    roundedRect(ctx,
      bx - PAD_ARC - offset,
      by - PAD_ARC - offset,
      bw + (PAD_ARC + offset) * 2,
      bh + (PAD_ARC + offset) * 2,
      20 + offset
    );
    const arcGrad = ctx.createLinearGradient(0, by - PAD_ARC, 0, by + bh + PAD_ARC);
    arcGrad.addColorStop(0,    hex(color2, opacity));
    arcGrad.addColorStop(0.5,  hex(color,  opacity));
    arcGrad.addColorStop(1,    hex(color2, opacity * 0.6));
    ctx.strokeStyle = arcGrad;
    ctx.lineWidth   = width;
    ctx.shadowColor = color;
    ctx.shadowBlur  = blur;
    ctx.stroke();
    ctx.restore();
  });

  // TOP ARCH: Additional glowing arc at top of frame
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(bcx, by - PAD_ARC + 10, bw * 0.52, 40, 0, Math.PI, 0);
  ctx.strokeStyle = hex(color2, 0.8);
  ctx.lineWidth   = 2;
  ctx.shadowColor = color2;
  ctx.shadowBlur  = 20;
  ctx.stroke();
  ctx.restore();

  // Floating crystals in side panels
  const crystalPositions = [
    [SIDE_W / 2, H * 0.25], [SIDE_W / 2, H * 0.55], [SIDE_W / 2, H * 0.75],
    [W - SIDE_W / 2, H * 0.20], [W - SIDE_W / 2, H * 0.50], [W - SIDE_W / 2, H * 0.70],
  ];
  crystalPositions.forEach(([cx, cy], i) => {
    drawDiamond(ctx, cx, cy, 8 + (i % 2) * 4, color, 0.6);
  });

  // Corner crystal accents (large)
  const cornerOff = 20;
  [[bx - 10, by - 10], [bx + bw + 10, by - 10], [bx - 10, by + bh + 10], [bx + bw + 10, by + bh + 10]]
    .forEach(([cx, cy]) => drawDiamond(ctx, cx, cy, 7, color2, 0.8));

  // Floating tech cards (left side)
  [[8, H * 0.3 - 25], [8, H * 0.55 - 25], [8, H * 0.72 - 25]].forEach(([fx, fy]) => {
    drawFloatCard(ctx, fx, fy, SIDE_W - 12, 36, color, 0.4);
    // Small horizontal lines inside cards
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = color;
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(fx + 4, fy + 8 + i * 9);
      ctx.lineTo(fx + SIDE_W - 18, fy + 8 + i * 9);
      ctx.stroke();
      ctx.restore();
    }
  });

  // Floating tech cards (right side)
  [[W - SIDE_W + 4, H * 0.25 - 25], [W - SIDE_W + 4, H * 0.48 - 25], [W - SIDE_W + 4, H * 0.68 - 25]]
    .forEach(([fx, fy]) => {
      drawFloatCard(ctx, fx, fy, SIDE_W - 12, 36, color2, 0.4);
    });

  // Neon ring at bottom center
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(bcx, H - BOT_H + 12, 60, 10, 0, 0, Math.PI * 2);
  ctx.strokeStyle = hex(color, 0.5);
  ctx.lineWidth   = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 12;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(bcx, H - BOT_H + 12, 100, 16, 0, 0, Math.PI * 2);
  ctx.strokeStyle = hex(color2, 0.25);
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();
}

/** COMIT Tech — circuit board all edges */
function drawOverlayComitTech(ctx, frame, bx, by, bw, bh) {
  const color = frame.accentColor;

  // Circuit board border (thick trace style)
  const traceOff = 10;
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, bx - traceOff, by - traceOff, bw + traceOff * 2, bh + traceOff * 2, 6);
  ctx.strokeStyle = hex(color, 0.7);
  ctx.lineWidth   = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 14;
  ctx.stroke();
  ctx.restore();

  // Corner square PCB pads
  const corners = [
    [bx - traceOff, by - traceOff],
    [bx + bw + traceOff, by - traceOff],
    [bx - traceOff, by + bh + traceOff],
    [bx + bw + traceOff, by + bh + traceOff],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.save();
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
    ctx.restore();
  });

  // Top circuit traces
  for (let i = 0; i < 8; i++) {
    const x = bx + bw * (i / 8) + 20;
    glowLine(ctx, x, by - traceOff, x, by - traceOff - 20, color, 0.8, 4);
    glowDot(ctx, x, by - traceOff - 20, 2, color, 5);
  }
  // Bottom circuit traces
  for (let i = 0; i < 8; i++) {
    const x = bx + bw * (i / 8) + 20;
    glowLine(ctx, x, by + bh + traceOff, x, by + bh + traceOff + 15, color, 0.8, 4);
    glowDot(ctx, x, by + bh + traceOff + 15, 2, color, 5);
  }

  // Binary code on sides
  ctx.save();
  ctx.font         = '8px monospace';
  ctx.fillStyle    = hex(color, 0.35);
  ctx.textBaseline = 'top';
  const binStr = '0101 1100\n0010 1011\n1101 0110\n0110 1001\n1010 0011';
  binStr.split('\n').forEach((line, i) => {
    ctx.fillText(line, 4, TOP_H + 20 + i * 14);
    ctx.fillText(line, W - 44, TOP_H + 20 + i * 14);
  });
  ctx.restore();

  // Outer second border
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, bx - traceOff - 8, by - traceOff - 8, bw + (traceOff + 8) * 2, bh + (traceOff + 8) * 2, 10);
  ctx.strokeStyle = hex(color, 0.2);
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();
}

/** Avantera City — city skyline at bottom + neon rings */
function drawOverlayAvanteraCity(ctx, frame, bx, by, bw, bh, bcx, bcy) {
  const color  = frame.accentColor;
  const color2 = frame.overlayColor;

  // Arch portal (same as Avantera Future but different color)
  const PAD = 12;
  [16, 8, 0].forEach((off, i) => {
    const a = [0.15, 0.35, 0.85][i];
    const b = [25, 15, 8][i];
    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, bx - PAD - off, by - PAD - off, bw + (PAD + off) * 2, bh + (PAD + off) * 2, 18 + off);
    ctx.strokeStyle = hex(color, a);
    ctx.lineWidth   = i === 2 ? 2 : 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur  = b;
    ctx.stroke();
    ctx.restore();
  });

  // City skyline silhouette at bottom strip area
  drawCitySkyline(ctx, color, color2);

  // Neon rings at bottom center
  [80, 130, 180].forEach((r, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(bcx, H - BOT_H + 8, r, r * 0.15, 0, 0, Math.PI * 2);
    ctx.strokeStyle = hex(i === 0 ? color : color2, 0.4 - i * 0.1);
    ctx.lineWidth   = 1.5 - i * 0.3;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12;
    ctx.stroke();
    ctx.restore();
  });

  // Violet accent elements
  [[SIDE_W / 2, H * 0.35], [W - SIDE_W / 2, H * 0.45]].forEach(([cx, cy]) => {
    drawDiamond(ctx, cx, cy, 10, '#7C5CFF', 0.7);
  });

  // Wave line across bottom
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, H - BOT_H - 5);
  for (let x = 0; x <= W; x += 10) {
    ctx.lineTo(x, H - BOT_H - 5 + Math.sin(x / 50) * 4);
  }
  ctx.strokeStyle = hex(color2, 0.3);
  ctx.lineWidth   = 1;
  ctx.shadowColor = color2;
  ctx.shadowBlur  = 6;
  ctx.stroke();
  ctx.restore();
}

function drawCitySkyline(ctx, color, color2) {
  const floorY = H - BOT_H + 2;
  ctx.save();
  ctx.fillStyle   = hex(color, 0.12);
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;

  // Draw building silhouettes
  const buildings = [
    [20, 35, 22], [50, 48, 18], [75, 28, 14], [96, 42, 20], [120, 56, 24],
    [150, 32, 16], [172, 60, 20], [198, 38, 12], [215, 50, 18], [238, 28, 14],
    [W - 258, 34, 14], [W - 238, 55, 18], [W - 215, 28, 12], [W - 192, 48, 20],
    [W - 165, 38, 16], [W - 144, 60, 22], [W - 118, 32, 14], [W - 96, 50, 20],
    [W - 72, 42, 18], [W - 48, 36, 16], [W - 28, 52, 18],
  ];

  buildings.forEach(([bx, bh, bw]) => {
    ctx.fillRect(bx, floorY - bh, bw, bh);
    // Small window lights
    for (let wy = floorY - bh + 4; wy < floorY - 4; wy += 8) {
      for (let wx = bx + 3; wx < bx + bw - 5; wx += 6) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = hex(color2, 0.5);
          ctx.fillRect(wx, wy, 2, 3);
          ctx.fillStyle = hex(color, 0.12);
        }
      }
      ctx.fillStyle = hex(color, 0.12);
    }
  });
  ctx.restore();
}

/** COMIT Classic — minimal corner brackets only */
function drawOverlayComitClassic(ctx, frame, bx, by, bw, bh) {
  const color = frame.accentColor;
  const PAD   = 8;
  const LEN   = 30;

  // 4 corner brackets
  [
    [bx - PAD, by - PAD, 1, 1],
    [bx + bw + PAD, by - PAD, -1, 1],
    [bx - PAD, by + bh + PAD, 1, -1],
    [bx + bw + PAD, by + bh + PAD, -1, -1],
  ].forEach(([cx, cy, dx, dy]) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 10;
    ctx.lineCap     = 'square';
    ctx.beginPath();
    ctx.moveTo(cx + dx * LEN, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * LEN);
    ctx.stroke();
    glowDot(ctx, cx, cy, 3, color, 10);
    ctx.restore();
  });

  // Clean subtle border
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, bx - PAD, by - PAD, bw + PAD * 2, bh + PAD * 2, 4);
  ctx.strokeStyle = hex(color, 0.25);
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();

  // Horizontal accent lines
  glowLine(ctx, bx - PAD, by - PAD - 8, bx + bw + PAD, by - PAD - 8, color, 0.5, 3);
  glowLine(ctx, bx - PAD, by + bh + PAD + 8, bx + bw + PAD, by + bh + PAD + 8, color, 0.5, 3);
}

// ── Corner Decorations ──────────────────────────────────────────────────────

function drawCanvasCorners(ctx, frame) {
  const color = frame.accentColor;
  const L     = 40;
  const R     = 4;

  [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].forEach(([cx, cy, dx, dy]) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(cx + dx * R, cy);
    ctx.lineTo(cx + dx * L, cy);
    ctx.moveTo(cx, cy + dy * R);
    ctx.lineTo(cx, cy + dy * L);
    ctx.stroke();
    glowDot(ctx, cx + dx * R, cy + dy * R, 2.5, color, 6);
    ctx.restore();
  });
}

// ── Main Export ─────────────────────────────────────────────────────────────

/**
 * Compose photos into a 1200×900 COMIT Booth frame.
 *
 * @param {string[]} photos        - Array of JPEG dataURLs
 * @param {object}   frame         - Frame config from frameConfig.js
 * @param {number}   photoCount    - 1–4
 * @param {Function} [onProgress]  - progress callback (0–100)
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function composePhotos(photos, frame, photoCount, onProgress) {
  // Wait for fonts (especially Orbitron) to load for canvas text
  await document.fonts.ready.catch(() => {});

  const canvas  = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  onProgress?.(5);

  // 1. Background
  drawBg(ctx, frame);
  onProgress?.(12);

  // 2. Top header
  drawTopHeader(ctx, frame);
  onProgress?.(18);

  // 3. Side panel decorations (BEHIND photos)
  drawSidePanels(ctx, frame);
  onProgress?.(22);

  // 4. Get photo slots
  const slots = getFrameSlots(frame.id, photoCount);
  onProgress?.(25);

  // 5. Load & draw photos
  const images = await Promise.all(photos.map(loadImage));
  onProgress?.(55);

  images.forEach((img, i) => {
    if (slots[i]) drawPhotoInSlot(ctx, img, slots[i]);
  });
  onProgress?.(68);

  // 6. Frame-specific overlay (arch, circuit, crystals — ON TOP of photos)
  drawFrameOverlay(ctx, frame, slots, photoCount);
  onProgress?.(82);

  // 7. Bottom branding bar
  drawBottomBar(ctx, frame, photoCount);
  onProgress?.(90);

  // 8. Canvas corner decorations
  drawCanvasCorners(ctx, frame);
  onProgress?.(96);

  // 9. Outer border
  ctx.save();
  ctx.strokeStyle = hex(frame.accentColor, 0.25);
  ctx.lineWidth   = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.restore();

  onProgress?.(100);
  return canvas;
}

/**
 * Generate automatic filename.
 */
export function generateFilename(ext = 'jpg') {
  const year   = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `COMIT-BOOTH-${year}-${random}.${ext}`;
}

/**
 * Download canvas as JPEG.
 */
export function downloadCanvas(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename || generateFilename('jpg');
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  link.click();
}

/**
 * Download canvas as PNG.
 */
export function downloadCanvasPNG(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename || generateFilename('png');
  link.href = canvas.toDataURL('image/png');
  link.click();
}
