/**
 * COMIT Booth — Express Server
 *
 * Serves static files, exposes API endpoints for analytics and admin.
 */

import express        from 'express';
import cors           from 'cors';
import nodemailer     from 'nodemailer';
import dotenv         from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath }  from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));

// ── Static (production build) ─────────────────────────────────────────────────
app.use(express.static(join(__dirname, '../client/dist')));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'COMIT Booth Server',
    version: '1.0.0',
    uptime:  Math.round(process.uptime()),
    time:    new Date().toISOString(),
  });
});

// ── Frames metadata ───────────────────────────────────────────────────────────
import { FRAMES } from '../client/src/frames/frameConfig.js';

app.get('/api/frames', (_req, res) => {
  res.json({ frames: FRAMES.map(f => ({ id: f.id, name: f.name, subtitle: f.subtitle })) });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

/** In-memory store (resets on restart — swap for a JSON file or DB in production) */
const usageLog = [];

/**
 * POST /api/analytics/session
 * Body: { frameId, photoCount, action, timestamp }
 * action: 'complete' | 'download' | 'print'
 */
app.post('/api/analytics/session', (req, res) => {
  const { frameId, photoCount, action = 'complete', timestamp } = req.body;
  const entry = {
    frameId,
    photoCount: Number(photoCount) || 0,
    action,
    timestamp: timestamp || new Date().toISOString(),
  };
  usageLog.push(entry);
  console.log('[Analytics]', entry);
  res.json({ ok: true });
});

/**
 * GET /api/analytics
 * Returns aggregated stats + raw log (last 200 entries).
 */
app.get('/api/analytics', (_req, res) => {
  const total     = usageLog.length;
  const log       = usageLog.slice(-200);             // last 200

  // ── Per-frame counts ──
  const byFrame = {};
  FRAMES.forEach(f => { byFrame[f.id] = { id: f.id, name: f.name, count: 0 }; });
  usageLog
    .filter(e => e.action === 'complete')
    .forEach(e => {
      if (byFrame[e.frameId]) byFrame[e.frameId].count++;
    });

  // ── Per-photo-count ──
  const byPhotoCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
  usageLog
    .filter(e => e.action === 'complete')
    .forEach(e => {
      const k = String(e.photoCount);
      if (byPhotoCount[k] !== undefined) byPhotoCount[k]++;
    });

  // ── Per-hour (last 24 h) ──
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  const now    = Date.now();
  usageLog
    .filter(e => e.action === 'complete' && now - new Date(e.timestamp).getTime() < 86400000)
    .forEach(e => {
      const h = new Date(e.timestamp).getHours();
      byHour[h].count++;
    });

  // ── Action counts ──
  const actions = { complete: 0, download: 0, print: 0 };
  usageLog.forEach(e => { if (actions[e.action] !== undefined) actions[e.action]++; });

  // ── Most popular frame ──
  const topFrame = Object.values(byFrame).sort((a, b) => b.count - a.count)[0] || null;

  res.json({
    total,
    actions,
    byFrame:      Object.values(byFrame),
    byPhotoCount,
    byHour,
    topFrame,
    log,
    serverTime:   new Date().toISOString(),
    uptime:       Math.round(process.uptime()),
  });
});

// ── Export CSV ──────────────────────────────────────────────────────────────────
app.get('/api/analytics/export/csv', (_req, res) => {
  const headers = ['Timestamp', 'FrameId', 'PhotoCount', 'Action'];
  const rows = usageLog.map(e => [
    e.timestamp,
    e.frameId || '',
    e.photoCount || 0,
    e.action
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="comit-booth-analytics.csv"');
  res.send(csvContent);
});

// ── Reset ─────────────────────────────────────────────────────────────────────
app.delete('/api/analytics/reset', (_req, res) => {
  usageLog.length = 0; // Clear the array
  res.json({ ok: true });
});

// ── Email ─────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-email', async (req, res) => {
  const { email, imageBase64, frameName } = req.body;
  if (!email || !imageBase64) {
    return res.status(400).json({ error: 'Missing email or imageBase64' });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const mailOptions = {
      from: `"COMIT Booth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Foto COMIT Booth Anda! 📸✨',
      text: `Halo!\n\nTerima kasih telah menggunakan COMIT Booth. Terlampir adalah foto Anda dengan frame ${frameName || 'spesial'}.\n\nSalam,\nTim COMIT`,
      attachments: [
        {
          filename: 'comit-booth-photo.jpg',
          content: buffer,
          contentType: 'image/jpeg'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Email Error]', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 COMIT Booth Server running on http://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`   Frames:    http://localhost:${PORT}/api/frames`);
  console.log(`   Analytics: http://localhost:${PORT}/api/analytics\n`);
});
