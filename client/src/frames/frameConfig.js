/**
 * frameConfig.js — COMIT Booth Frame Registry
 * Portrait Mode (9:16)
 */

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

// ── Slot layout generators ─────────────────────────────────────────────────

function getSlotsForFrame(frameId) {
  if (frameId === 'frame-1') { // Live Report (1 slot)
    return [{ x: 122, y: 162, width: 459, height: 674 }];
  }
  
  if (frameId === 'frame-2') { // Blue texture (2 slots)
    return [
      { x: 94, y: 75, width: 434, height: 317 },
      { x: 94, y: 435, width: 434, height: 317 }
    ];
  }
  
  if (frameId === 'frame-3a') { // Diagonal stripes (3 slots)
    return [
      { x: 64, y: 82, width: 443, height: 267 },
      { x: 64, y: 369, width: 443, height: 267 },
      { x: 64, y: 656, width: 443, height: 267 },
    ];
  }
  
  if (frameId === 'frame-4') { // Building Background (4 slots)
    return [
      { x: 51, y: 52, width: 373, height: 202 },
      { x: 51, y: 279, width: 373, height: 202 },
      { x: 51, y: 506, width: 373, height: 202 },
      { x: 51, y: 732, width: 373, height: 202 },
    ];
  }
  
  if (frameId === 'frame-5') { // Circuit COMIT Landscape (1 slot)
    return [{ x: 69, y: 69, width: 874, height: 524 }];
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
  },
  {
    id:          'frame-5',
    name:        'Circuit COMIT',
    subtitle:    '1 Photo Landscape',
    description: 'Frame lanskap dengan desain sirkuit dan maskot COMIT.',
    photoCount:  1,
    previewBg:   '#020C1A',
    accentColor: '#00D9FF',
    overlayColor: '#1A73E8',
    canvas:      { width: 1024, height: 695 },
    image:       '/frames-new/frame-5.png',
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
