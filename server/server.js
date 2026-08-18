/**
 * COMIT Booth — Express Server (Minimal MVP)
 *
 * In MVP mode, all photo processing happens in the browser.
 * This server just serves static files and exposes a health endpoint.
 *
 * Future: frame management, analytics, admin, cloud save.
 */

import express   from 'express';
import cors      from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath }  from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));

// ── Static (production build) ──────────────────────────────────────────────
app.use(express.static(join(__dirname, '../client/dist')));

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'COMIT Booth Server',
    version: '1.0.0',
    time:    new Date().toISOString(),
  });
});

// ── Frames metadata ────────────────────────────────────────────────────────
// Returns frame config for future admin use (client can also read directly from frameConfig.js)
import { FRAMES } from '../client/src/frames/frameConfig.js';

app.get('/api/frames', (_req, res) => {
  res.json({ frames: FRAMES.map(f => ({ id: f.id, name: f.name, subtitle: f.subtitle })) });
});

// ── Analytics (stub) ───────────────────────────────────────────────────────
const usageLog = [];

app.post('/api/analytics/session', (req, res) => {
  const { frameId, photoCount, timestamp } = req.body;
  usageLog.push({ frameId, photoCount, timestamp: timestamp || new Date().toISOString() });
  console.log('[Analytics] Session recorded:', { frameId, photoCount });
  res.json({ ok: true });
});

app.get('/api/analytics', (_req, res) => {
  res.json({ sessions: usageLog.length, log: usageLog });
});

// ── SPA fallback ───────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 COMIT Booth Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Frames: http://localhost:${PORT}/api/frames\n`);
});
