/**
 * qr.js — QR Code generation utilities for COMIT Booth
 *
 * Generates QR codes pointing to the COMIT Instagram page.
 * Uses the 'qrcode' npm package for client-side generation.
 */

import QRCode from 'qrcode';

// ── Config ────────────────────────────────────────────────────────────────

/** URL encoded in every QR code */
export const QR_URL = 'https://www.instagram.com/comit.ipem';

/** Label shown below QR on the UI widget */
export const QR_LABEL = '@comit.ipem';

// ── Core generator ────────────────────────────────────────────────────────

/**
 * Render a QR code onto an existing <canvas> element.
 *
 * @param {HTMLCanvasElement} canvas  - Target canvas
 * @param {object}            opts    - Optional overrides
 * @param {string}            opts.url        - QR content (default: QR_URL)
 * @param {number}            opts.size       - Canvas size in px (default: 180)
 * @param {string}            opts.dark       - Dark module color (default: '#00D9FF')
 * @param {string}            opts.light      - Light module color (default: '#071426')
 * @param {number}            opts.margin     - Quiet zone in modules (default: 1)
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderQRToCanvas(canvas, opts = {}) {
  const {
    url    = QR_URL,
    size   = 180,
    dark   = '#00D9FF',
    light  = '#071426',
    margin = 1,
  } = opts;

  await QRCode.toCanvas(canvas, url, {
    width:          size,
    margin,
    color: { dark, light },
    errorCorrectionLevel: 'M',
  });

  return canvas;
}

/**
 * Return a QR code as a PNG data-URL string.
 *
 * @param {object} opts - Same options as renderQRToCanvas
 * @returns {Promise<string>}  data:image/png;base64,...
 */
export async function getQRDataURL(opts = {}) {
  const {
    url    = QR_URL,
    size   = 180,
    dark   = '#00D9FF',
    light  = '#071426',
    margin = 1,
  } = opts;

  return QRCode.toDataURL(url, {
    type:  'image/png',
    width:  size,
    margin,
    color: { dark, light },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Draw a QR code badge (QR + label card) onto a large composed canvas
 * at the specified position. Used to embed QR into the photo result.
 *
 * The badge is a rounded rectangle containing:
 *   - the QR modules
 *   - label text below (e.g. "@comit.ipem")
 *   - subtle brand icon above (📷)
 *
 * @param {CanvasRenderingContext2D} ctx     - Context of the composed photo canvas
 * @param {number}                  cx      - Center X of badge
 * @param {number}                  cy      - Center Y of badge
 * @param {number}                  qrSize  - QR pixel size (default: 90)
 * @param {object}                  frame   - Frame config (for accent color)
 * @returns {Promise<void>}
 */
export async function drawQRBadgeOnCanvas(ctx, cx, cy, qrSize = 90, frame = {}) {
  const accent = frame.accentColor || '#00D9FF';
  const pad    = 10;          // padding inside card
  const labelH = 22;          // height reserved for label text below QR
  const iconH  = 16;          // height reserved for icon above QR
  const cardW  = qrSize + pad * 2;
  const cardH  = iconH + qrSize + labelH + pad * 2;
  const cardX  = cx - cardW / 2;
  const cardY  = cy - cardH / 2;
  const r      = 8;           // corner radius

  // ── 1. Generate QR as an image ──
  const qrDataUrl = await getQRDataURL({
    size:  qrSize * 2,    // 2× for sharpness on HiDPI canvas
    dark:  accent,
    light: '#071426F0',
    margin: 0,
  });

  const qrImg = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error('QR image load failed'));
    img.src = qrDataUrl;
  });

  // ── 2. Draw card background ──
  ctx.save();
  ctx.beginPath();
  _roundedRect(ctx, cardX, cardY, cardW, cardH, r);
  ctx.fillStyle   = 'rgba(7, 20, 38, 0.90)';
  ctx.shadowColor = accent;
  ctx.shadowBlur  = 12;
  ctx.fill();

  ctx.strokeStyle = accent + 'AA';
  ctx.lineWidth   = 1.5;
  ctx.shadowBlur  = 6;
  ctx.stroke();
  ctx.restore();

  // ── 3. Draw icon line (📷 text or small camera icon) ──
  ctx.save();
  ctx.font         = `${iconH - 4}px Arial, sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = accent;
  ctx.shadowColor  = accent;
  ctx.shadowBlur   = 6;
  ctx.fillText('📷', cx, cardY + pad + iconH / 2);
  ctx.restore();

  // ── 4. Draw QR image ──
  const qrX = cardX + pad;
  const qrY = cardY + pad + iconH;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // ── 5. Draw label below QR ──
  ctx.save();
  ctx.font         = `bold ${Math.max(8, Math.round(qrSize * 0.12))}px "Orbitron", monospace`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = accent;
  ctx.shadowColor  = accent;
  ctx.shadowBlur   = 5;
  ctx.fillText(QR_LABEL, cx, qrY + qrSize + labelH / 2);
  ctx.restore();
}

// ── Helpers ───────────────────────────────────────────────────────────────

function _roundedRect(ctx, x, y, w, h, r) {
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
