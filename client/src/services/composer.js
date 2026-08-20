/**
 * composer.js — Canvas Image Composition Engine
 * Portrait Mode for Kabinet Avantera Templates
 */

import { getFrameSlots, CANVAS_W, CANVAS_H } from '../frames/frameConfig.js';
import { drawQRBadgeOnCanvas } from './qr.js';

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

/** Draw a photo in a slot using object-fit: cover logic */
function drawPhotoInSlot(ctx, img, slot, r = 24) {
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
  
  // Add a subtle inner shadow/border to blend with the template
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

// ── Main Export ─────────────────────────────────────────────────────────────

/**
 * Compose photos into a 1080x1920 COMIT Booth frame.
 */
export async function composePhotos(photos, frame, photoCount, onProgress) {
  await document.fonts.ready.catch(() => {});

  const canvas  = document.createElement('canvas');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  onProgress?.(10);

  // 1. Load Background Template
  if (frame.image) {
    try {
      const templateImg = await loadImage(frame.image);
      ctx.drawImage(templateImg, 0, 0, CANVAS_W, CANVAS_H);
    } catch (e) {
      console.error("Failed to load template:", e);
      ctx.fillStyle = '#071426';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  } else {
    ctx.fillStyle = '#071426';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
  onProgress?.(40);

  // 2. Get photo slots
  const slots = getFrameSlots(frame.id, photoCount);
  
  // 3. Load & draw photos on top of the template
  const images = await Promise.all(photos.map(loadImage));
  onProgress?.(70);

  images.forEach((img, i) => {
    if (slots[i]) drawPhotoInSlot(ctx, img, slots[i], 20); // 20px border radius
  });
  onProgress?.(90);

  // 4. QR badge
  try {
    const qrSize = 80;
    const badgeCX = CANVAS_W - 90;
    const badgeCY = CANVAS_H - 120;
    await drawQRBadgeOnCanvas(ctx, badgeCX, badgeCY, qrSize, frame);
  } catch (e) {
    console.warn('[composer] QR badge skipped:', e.message);
  }
  
  // Outer border
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';
  ctx.lineWidth   = 2;
  ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);
  ctx.restore();

  onProgress?.(100);
  return canvas;
}

export function generateFilename(ext = 'jpg') {
  const year   = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `COMIT-BOOTH-${year}-${random}.${ext}`;
}

export function downloadCanvas(canvas, filename) {
  const name = filename || generateFilename('jpg');
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, 'image/jpeg', 0.97);
}

export function downloadCanvasPNG(canvas, filename) {
  const name = filename || generateFilename('png');
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, 'image/png');
}

export function printCanvas(canvas, frame) {
  const dataUrl  = canvas.toDataURL('image/jpeg', 0.97);
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr  = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const frameName = frame?.name || 'COMIT Booth';

  const printWin = window.open('', '_blank', 'width=800,height=900');
  if (!printWin) {
    _fallbackPrint(canvas);
    return;
  }

  printWin.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>COMIT Booth — ${frameName}</title>
  <style>
    body { background: #071426; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
    .print-frame { max-width: 500px; width: 100%; border: 2px solid rgba(0,217,255,0.4); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .print-photo { width: 100%; height: auto; display: block; }
    .print-btn { padding: 12px 30px; background: #00D9FF; color: black; font-weight: bold; border: none; border-radius: 50px; cursor: pointer; }
    @media print {
      @page { margin: 0; size: portrait; }
      body { background: white !important; margin: 0; padding: 0; height: 100vh; overflow: hidden; }
      .print-btn { display: none !important; }
      .print-frame { max-width: 100% !important; height: 100vh; border: none !important; margin: 0; border-radius: 0; display: flex; justify-content: center; align-items: center; }
      .print-photo { max-width: 100vw; max-height: 100vh; object-fit: contain; }
    }
  </style>
</head>
<body>
  <div class="print-frame"><img class="print-photo" src="${dataUrl}" /></div>
  <button class="print-btn" onclick="window.print()">CETAK FOTO</button>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 600); };
  </script>
</body>
</html>`);

  printWin.document.close();
}

function _fallbackPrint(canvas) {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.97);
  const style   = document.createElement('style');
  style.innerHTML = `@media print { @page { margin: 0; } body > *:not(#comit-print-img) { display: none !important; } #comit-print-img { display: block !important; position: fixed; top: 0; left: 0; max-width: 100vw; max-height: 100vh; object-fit: contain; } }`;
  const img = document.createElement('img');
  img.id    = 'comit-print-img';
  img.src   = dataUrl;
  img.style.display = 'none';
  document.head.appendChild(style);
  document.body.appendChild(img);
  window.print();
  setTimeout(() => { document.head.removeChild(style); document.body.removeChild(img); }, 2000);
}
