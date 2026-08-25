/**
 * frameConfig.js — COMIT Booth Frame Registry
 * Portrait Mode (9:16)
 */

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

// ── Slot layout generators ─────────────────────────────────────────────────

function getSlotsForFrame(frameId) {
  if (frameId === 'frame-1') { // Live Report (1 slot)
    return [{ x: 104, y: 153, width: 486, height: 686 }];
  }
  
  if (frameId === 'frame-2') { // Blue texture (2 slots)
    return [
      { x: 14, y: 75, width: 594, height: 368 },
      { x: 14, y: 444, width: 594, height: 407 }
    ];
  }
  
  if (frameId === 'frame-3a' || frameId === 'frame-3b') { // Diagonal stripes (3 slots)
    return [
      { x: 58, y: 82, width: 466, height: 266 },
      { x: 58, y: 368, width: 466, height: 266 },
      { x: 58, y: 654, width: 466, height: 266 },
    ];
  }
  
  if (frameId === 'frame-4') { // Building Background (4 slots)
    return [
      { x: 50, y: 50, width: 400, height: 220 },
      { x: 50, y: 290, width: 400, height: 220 },
      { x: 50, y: 530, width: 400, height: 220 },
      { x: 50, y: 770, width: 400, height: 220 },
    ];
  }
  
  return [{ x: 140, y: 300, width: 800, height: 1066 }];
}

// ── Frame definitions ──────────────────────────────────────────────────────

export const FRAMES = [
  {
    id:          'frame-1',
    name:        'Live Report',
    subtitle:    '1 Photo Edition',
    description: 'Frame bergaya koran dengan 1 slot foto besar.',
    photoCount:  1,
    previewBg:   '#888888',
    accentColor: '#FF3333',
    overlayColor: '#FFFFFF',
    canvas:      { width: 695, height: 1024 },
    image:       '/frames-new/frame-1.png',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'frame-2',
    name:        'COMIT Two-Tone',
    subtitle:    '2 Photos Edition',
    description: 'Frame dengan 2 slot foto horizontal.',
    photoCount:  2,
    previewBg:   '#8ABCEB',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: 612, height: 887 },
    image:       '/frames-new/frame-2.png',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'frame-3a',
    name:        'Blue Stripes',
    subtitle:    '3 Photos Edition',
    description: 'Frame dengan 3 slot foto horizontal.',
    photoCount:  3,
    previewBg:   '#4379C3',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: 583, height: 1024 },
    image:       '/frames-new/frame-3.png',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'frame-3b',
    name:        'Blue Stripes (Variant)',
    subtitle:    '3 Photos Edition',
    description: 'Frame dengan 3 slot foto horizontal.',
    photoCount:  3,
    previewBg:   '#4379C3',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: 583, height: 1024 },
    image:       '/frames-new/frame-3.png',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'frame-4',
    name:        'One Community',
    subtitle:    '4 Photos Edition',
    description: 'Frame dengan 4 slot foto dan maskot COMIT.',
    photoCount:  4,
    previewBg:   '#8ABCEB',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: 500, height: 1024 },
    image:       '/frames-new/frame-4.png',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  }
];

export function getFrameSlots(frameId, count) {
  return getSlotsForFrame(frameId);
}

export function getFrameById(id) {
  return FRAMES.find(f => f.id === id);
}

export default FRAMES;
