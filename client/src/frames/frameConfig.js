/**
 * frameConfig.js — COMIT Booth Frame Registry
 *
 * Layout zones (must match composer.js constants):
 *   TOP_H  = 80   — top header bar
 *   BOT_H  = 100  — bottom branding strip
 *   SIDE_W = 50   — left/right side panel
 *
 * Photo grid occupies: x=[50..1150], y=[80..800]
 */

const CANVAS_W = 1200;
const CANVAS_H = 900;

const TOP_H   = 80;
const BOT_H   = 100;
const SIDE_W  = 50;
const GAP     = 16;

const PHOTO_X = SIDE_W;
const PHOTO_Y = TOP_H;
const PHOTO_W = CANVAS_W - SIDE_W * 2;
const PHOTO_H = CANVAS_H - TOP_H - BOT_H;

// ── Slot layout generators ─────────────────────────────────────────────────

function layout1() {
  return [{
    x: PHOTO_X, y: PHOTO_Y,
    width: PHOTO_W, height: PHOTO_H
  }];
}

function layout2() {
  const w = (PHOTO_W - GAP) / 2;
  return [
    { x: PHOTO_X,         y: PHOTO_Y, width: w, height: PHOTO_H },
    { x: PHOTO_X + w + GAP, y: PHOTO_Y, width: w, height: PHOTO_H },
  ];
}

function layout3() {
  const leftW  = (PHOTO_W - GAP) / 2;
  const halfH  = (PHOTO_H - GAP) / 2;
  return [
    { x: PHOTO_X,               y: PHOTO_Y,               width: leftW, height: PHOTO_H },
    { x: PHOTO_X + leftW + GAP, y: PHOTO_Y,               width: leftW, height: halfH },
    { x: PHOTO_X + leftW + GAP, y: PHOTO_Y + halfH + GAP, width: leftW, height: halfH },
  ];
}

function layout4() {
  const w = (PHOTO_W - GAP) / 2;
  const h = (PHOTO_H - GAP) / 2;
  return [
    { x: PHOTO_X,         y: PHOTO_Y,         width: w, height: h },
    { x: PHOTO_X + w + GAP, y: PHOTO_Y,       width: w, height: h },
    { x: PHOTO_X,         y: PHOTO_Y + h + GAP, width: w, height: h },
    { x: PHOTO_X + w + GAP, y: PHOTO_Y + h + GAP, width: w, height: h },
  ];
}

function getSlots(count) {
  switch (count) {
    case 1:  return layout1();
    case 2:  return layout2();
    case 3:  return layout3();
    case 4:  return layout4();
    default: return layout4();
  }
}

// ── Frame definitions ──────────────────────────────────────────────────────

export const FRAMES = [
  {
    id:          'avantera-future',
    name:        'Avantera Future',
    subtitle:    'Future In Motion',
    description: 'Gerbang portal holografis dengan arch neon, kristal mengambang, dan circuit board.',
    previewBg:   'linear-gradient(135deg, #071426 0%, #0B1F3A 50%, #071426 100%)',
    accentColor: '#00D9FF',
    overlayColor: '#00A8FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA × FUTURE IN MOTION',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'comit-tech',
    name:        'COMIT Tech Frame',
    subtitle:    'Circuit Board Edition',
    description: 'Frame pola circuit board dengan binary code, neon biru elektrik, dan PCB corner pads.',
    previewBg:   'linear-gradient(135deg, #0B1F3A 0%, #071426 50%, #0D2748 100%)',
    accentColor: '#00A8FF',
    overlayColor: '#00D9FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'COMIT × KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'avantera-city',
    name:        'Avantera City',
    subtitle:    'Urban Future Edition',
    description: 'Cakrawala kota futuristik dengan neon rings, city skyline, dan wave energy.',
    previewBg:   'linear-gradient(135deg, #071426 0%, #0A1E3A 60%, #071426 100%)',
    accentColor: '#7C5CFF',
    overlayColor: '#00D9FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'AVANTERA CITY × UNIPI',
      orgText:    'Universitas Insan Pembangunan Indonesia',
    },
  },
  {
    id:          'comit-classic',
    name:        'COMIT Classic',
    subtitle:    'Minimal Premium Edition',
    description: 'Desain bersih dengan corner bracket neon, border minimal, dan tipografi premium.',
    previewBg:   'linear-gradient(135deg, #071426 0%, #0B1F3A 100%)',
    accentColor: '#C8D4E3',
    overlayColor: '#00A8FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'Community of Information Technology | UNIPI',
      orgText:    'Universitas Insan Pembangunan Indonesia',
    },
  },
];

/**
 * Get photo slot positions for a given frame and count.
 * @param {string} _frameId  (reserved for future per-frame custom layouts)
 * @param {number} count     1–4
 */
export function getFrameSlots(_frameId, count) {
  return getSlots(count);
}

/** Get frame config by ID */
export function getFrameById(id) {
  return FRAMES.find(f => f.id === id);
}

export default FRAMES;
