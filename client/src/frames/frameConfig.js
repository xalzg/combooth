/**
 * frameConfig.js — COMIT Booth Frame Registry
 * Portrait Mode (9:16) for Kabinet Avantera
 */

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

// ── Slot layout generators ─────────────────────────────────────────────────

function getPortraitSlots(count) {
  // For Kabinet Avantera, we focus on a 2x2 grid in the center
  // 400x300 photos (4:3 aspect ratio)
  // X: 120 and 560
  // Y: 600 and 940
  const slots = [
    { x: 120, y: 600, width: 400, height: 300 },
    { x: 560, y: 600, width: 400, height: 300 },
    { x: 120, y: 940, width: 400, height: 300 },
    { x: 560, y: 940, width: 400, height: 300 },
  ];
  
  if (count === 1) {
    return [{ x: 240, y: 660, width: 600, height: 600 }]; // 1 big square
  }
  if (count === 2) {
    return [
      { x: 340, y: 600, width: 400, height: 300 },
      { x: 340, y: 940, width: 400, height: 300 },
    ];
  }
  if (count === 3) {
    return [
      { x: 340, y: 550, width: 400, height: 300 },
      { x: 340, y: 880, width: 400, height: 300 },
      { x: 340, y: 1210, width: 400, height: 300 },
    ];
  }
  
  return slots;
}

// ── Frame definitions ──────────────────────────────────────────────────────

export const FRAMES = [
  {
    id:          'avantera-1',
    name:        'Kabinet Avantera 1',
    subtitle:    'Future In Motion',
    description: 'Frame vertikal dengan desain elegan arch neon dan panggung holografis.',
    previewBg:   'linear-gradient(135deg, var(--deep-navy) 0%, var(--navy-mid) 100%)',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    image:       '/src/assets/frames/avantera_1.jpg',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'avantera-2',
    name:        'Kabinet Avantera 2',
    subtitle:    'Innovation Edition',
    description: 'Frame vertikal dengan desain elegan arch neon dan tata letak dinamis.',
    previewBg:   'linear-gradient(135deg, var(--navy-mid) 0%, var(--navy-blue) 100%)',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    image:       '/src/assets/frames/avantera_2.jpg',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  },
  {
    id:          'avantera-3',
    name:        'Kabinet Avantera 3',
    subtitle:    'Technology Edition',
    description: 'Frame vertikal dengan nuansa neon biru elektrik khas COMIT.',
    previewBg:   'linear-gradient(135deg, var(--navy-blue) 0%, var(--deep-navy) 100%)',
    accentColor: '#1A73E8',
    overlayColor: '#00D9FF',
    canvas:      { width: CANVAS_W, height: CANVAS_H },
    image:       '/src/assets/frames/avantera_3.jpg',
    branding: {
      topText:    'COMIT BOOTH',
      bottomText: 'KABINET AVANTERA',
      orgText:    'Community of Information Technology',
    },
  }
];

/**
 * Get photo slot positions for a given frame and count.
 */
export function getFrameSlots(_frameId, count) {
  return getPortraitSlots(count);
}

/** Get frame config by ID */
export function getFrameById(id) {
  return FRAMES.find(f => f.id === id);
}

export default FRAMES;
