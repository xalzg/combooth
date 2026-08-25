/**
 * composer.js — Canvas Image Composition Engine
 * Portrait Mode for Kabinet Avantera Templates
 */

import { getFrameSlots } from '../frames/frameConfig.js';
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

export async function bakeStickersOntoPhoto(videoEl, stickers, isMirrored) {
  const W = videoEl.videoWidth || 1280;
  const H = videoEl.videoHeight || 720;
  
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  
  // Draw mirrored video
  ctx.save();
  if (isMirrored) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(videoEl, 0, 0, W, H);
  ctx.restore();

  // Draw stickers
  for (const s of stickers) {
    try {
      const img = await loadImage(s.sticker.src);
      ctx.save();
      
      // Calculate center of the sticker based on top-left x,y and width,height
      const cx = s.x + s.width / 2;
      const cy = s.y + s.height / 2;
      
      ctx.translate(cx, cy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.drawImage(img, -s.width / 2, -s.height / 2, s.width, s.height);
      
      ctx.restore();
    } catch(e) {
      console.warn("Failed to bake sticker:", s.sticker.name);
    }
  }
  
  return canvas.toDataURL('image/jpeg', 0.95);
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

  const W = frame.canvas?.width || 1080;
  const H = frame.canvas?.height || 1920;

  const canvas  = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  onProgress?.(10);

  // 1. Fill base background color
  ctx.fillStyle = frame.previewBg || '#071426';
  ctx.fillRect(0, 0, W, H);
  onProgress?.(20);

  // 2. Get photo slots
  const slots = getFrameSlots(frame.id, photoCount);
  
  // 3. Load & draw photos FIRST (so they sit underneath the frame)
  const images = await Promise.all(photos.map(loadImage));
  onProgress?.(50);

  images.forEach((img, i) => {
    if (slots[i]) drawPhotoInSlot(ctx, img, slots[i], 20); // 20px border radius
  });
  onProgress?.(70);

  // 4. Load & draw Background Template ON TOP of the photos
  if (frame.image) {
    try {
      const templateImg = await loadImage(frame.image);
      
      // Chroma-key the solid grey slots to be transparent
      const tCanvas = document.createElement('canvas');
      tCanvas.width = W;
      tCanvas.height = H;
      const tCtx = tCanvas.getContext('2d');
      tCtx.drawImage(templateImg, 0, 0, W, H);
      
      const imgData = tCtx.getImageData(0, 0, W, H);
      const data = imgData.data;
      
      // Extract the center color of each slot
      const slotColors = slots.map(slot => {
         const cx = Math.floor(slot.x + slot.width / 2);
         const cy = Math.floor(slot.y + slot.height / 2);
         const idx = (cy * W + cx) * 4;
         return { r: data[idx], g: data[idx+1], b: data[idx+2], slot };
      });

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2];
          
          for (const sc of slotColors) {
            const { slot, r: sr, g: sg, b: sb } = sc;
            // Check if within slot bounds (with 5px padding)
            if (x >= slot.x - 5 && x <= slot.x + slot.width + 5 &&
                y >= slot.y - 5 && y <= slot.y + slot.height + 5) {
                
                // If it matches the solid grey color
                if (Math.abs(r - sr) <= 15 && Math.abs(g - sg) <= 15 && Math.abs(b - sb) <= 15) {
                   data[i+3] = 0; // Make transparent
                }
            }
          }
        }
      }
      
      tCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(tCanvas, 0, 0, W, H);
    } catch (e) {
      console.error("Failed to load template:", e);
    }
  }
  onProgress?.(90);

  // 4. QR badge
  try {
    const qrSize = Math.floor(Math.min(W, H) * 0.1); // responsive QR size
    const badgeCX = W - qrSize - 20;
    const badgeCY = H - qrSize - 20;
    await drawQRBadgeOnCanvas(ctx, badgeCX, badgeCY, qrSize, frame);
  } catch (e) {
    console.warn('[composer] QR badge skipped:', e.message);
  }
  
  // Outer border
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';
  ctx.lineWidth   = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.restore();

  onProgress?.(100);
  return canvas;
}

/**
 * Apply editor changes (filters and stickers) to the base canvas.
 */
export async function applyEditorChanges(baseCanvas, { filter, stickers, containerWidth, containerHeight }, onProgress) {
  const W = baseCanvas.width;
  const H = baseCanvas.height;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  onProgress?.(20);

  // Apply filter to base canvas
  if (filter && filter.css && filter.css !== 'none') {
    ctx.filter = filter.css;
  }
  ctx.drawImage(baseCanvas, 0, 0);
  ctx.filter = 'none'; // reset filter for stickers

  onProgress?.(60);

  // Draw stickers relative to canvas size
  for (let i = 0; i < stickers.length; i++) {
    const s = stickers[i];
    try {
      const img = await loadImage(s.src);
      
      // Make sticker size proportional to the frame canvas
      const baseRatio = Math.min(W, H) / 1000;
      const sWidth = 300 * baseRatio;
      const sHeight = 300 * baseRatio;
      
      const cX = W / 2 - sWidth / 2;
      const cY = i === 0 ? (H * 0.15) : (H * 0.85 - sHeight);

      ctx.drawImage(img, cX, cY, sWidth, sHeight);
    } catch (e) {
      console.warn('Failed to load sticker image, drawing text instead', e);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 4;
      
      const baseRatio = Math.min(W, H) / 1000;
      const sWidth = 400 * baseRatio;
      const sHeight = 150 * baseRatio;
      const cX = W / 2 - sWidth / 2;
      const cY = i === 0 ? (H * 0.15) : (H * 0.85 - sHeight);
      
      roundedRect(ctx, cX, cY, sWidth, sHeight, 20 * baseRatio);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1E3A8A';
      ctx.font = `bold ${Math.floor(60 * baseRatio)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.name, cX + sWidth/2, cY + sHeight/2);
    }
  }

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

/**
 * Dynamically chroma-keys the frame and returns a transparent PNG Data URL.
 * Used for the live camera preview overlay.
 */
export async function getTransparentFrameURL(frame, photoCount) {
  if (!frame || !frame.image) return null;
  const W = frame.canvas?.width || 1080;
  const H = frame.canvas?.height || 1920;
  
  try {
    const templateImg = await loadImage(frame.image);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(templateImg, 0, 0, W, H);
    
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;
    const slots = getFrameSlots(frame.id, photoCount);
    
    const slotColors = slots.map(slot => {
       const cx = Math.floor(slot.x + slot.width / 2);
       const cy = Math.floor(slot.y + slot.height / 2);
       const idx = (cy * W + cx) * 4;
       return { r: data[idx], g: data[idx+1], b: data[idx+2], slot };
    });

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        
        for (const sc of slotColors) {
          const { slot, r: sr, g: sg, b: sb } = sc;
          if (x >= slot.x - 5 && x <= slot.x + slot.width + 5 &&
              y >= slot.y - 5 && y <= slot.y + slot.height + 5) {
              if (Math.abs(r - sr) <= 15 && Math.abs(g - sg) <= 15 && Math.abs(b - sb) <= 15) {
                 data[i+3] = 0;
              }
          }
        }
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn("Failed to generate transparent frame overlay", e);
    return null;
  }
}
