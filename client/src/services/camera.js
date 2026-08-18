/**
 * camera.js — WebRTC Camera Service
 * Manages camera stream, capture, and cleanup.
 */

let activeStream = null;

/**
 * Start the camera stream.
 * @param {HTMLVideoElement} videoEl
 * @returns {Promise<MediaStream>}
 */
export async function startCamera(videoEl) {
  // Stop any existing stream first to avoid double-permission prompts
  if (activeStream) stopCamera();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width:  { ideal: 1280, min: 640 },
        height: { ideal: 720,  min: 480 },
        facingMode: 'user',
        frameRate: { ideal: 30 },
      },
      audio: false,
    });

    activeStream = stream;

    if (videoEl) {
      videoEl.srcObject = stream;
      try {
        await videoEl.play();
      } catch (playErr) {
        // Play may fail if component unmounted — ignore
        console.warn('[camera] play() ignored:', playErr.message);
      }
    }
    return stream;
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error('CAMERA_DENIED');
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      throw new Error('CAMERA_NOT_FOUND');
    }
    throw new Error('CAMERA_ERROR');
  }
}

/**
 * Stop all active camera tracks.
 */
export function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }
}

/**
 * Capture a single frame from the video element as a dataURL.
 * Mirrors the image (selfie mode).
 *
 * @param {HTMLVideoElement} videoEl
 * @param {number} [width=1280]
 * @param {number} [height=720]
 * @returns {string} JPEG dataURL
 */
export function captureFrame(videoEl, width, height) {
  if (!videoEl) throw new Error('Video element not ready');

  // If srcObject is missing but we have an active stream, re-attach
  if (!videoEl.srcObject && activeStream) {
    videoEl.srcObject = activeStream;
    videoEl.play().catch(() => {});
  }

  // Use natural video dimensions (or fallback to 1280x720)
  const vw = videoEl.videoWidth  || 1280;
  const vh = videoEl.videoHeight || 720;
  const fw = width  || vw;
  const fh = height || vh;

  if (!videoEl.videoWidth) {
    throw new Error('Video stream not active — no video data');
  }

  const canvas  = document.createElement('canvas');
  canvas.width  = fw;
  canvas.height = fh;
  const ctx = canvas.getContext('2d');

  // Mirror horizontally for natural selfie feel
  ctx.translate(fw, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, 0, 0, fw, fh);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Check if camera is available without actually starting it.
 * @returns {Promise<boolean>}
 */
export async function checkCameraAvailable() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(d => d.kind === 'videoinput');
  } catch {
    return false;
  }
}
