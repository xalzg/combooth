import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker = null;
let isInitialized = false;

export async function initFaceTracking() {
  if (isInitialized) return faceLandmarker;
  
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: false,
      runningMode: "VIDEO",
      numFaces: 1
    });
    
    isInitialized = true;
    return faceLandmarker;
  } catch (error) {
    console.error("Failed to initialize FaceLandmarker:", error);
    return null;
  }
}

export function detectFace(videoElement, time) {
  if (!faceLandmarker || !videoElement) return null;
  try {
    return faceLandmarker.detectForVideo(videoElement, time);
  } catch (e) {
    return null;
  }
}

export function getLandmarks(results) {
  if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
    return results.faceLandmarks[0];
  }
  return null;
}

export function getFeatureCoordinates(landmarks, videoWidth, videoHeight, type, isMirrored = true) {
  if (!landmarks) return null;

  let x = 0, y = 0, width = 0, height = 0, rotation = 0;

  if (type === 'head') {
    const top = landmarks[10];
    const left = landmarks[234];
    const right = landmarks[454];
    
    width = Math.abs(right.x - left.x) * videoWidth * 1.5;
    height = width * 0.8;
    
    x = top.x * videoWidth - width / 2;
    y = top.y * videoHeight - height * 0.9;
    
    rotation = Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI);
  } else if (type === 'eyes') {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    
    width = Math.abs(rightEye.x - leftEye.x) * videoWidth * 2.2;
    height = width * 0.5;
    
    const cx = (leftEye.x + rightEye.x) / 2 * videoWidth;
    const cy = (leftEye.y + rightEye.y) / 2 * videoHeight;
    
    x = cx - width / 2;
    y = cy - height / 2;
    
    rotation = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
  } else {
    // Default fallback to center of face (nose)
    const nose = landmarks[1];
    const left = landmarks[234];
    const right = landmarks[454];
    
    width = Math.abs(right.x - left.x) * videoWidth * 0.8;
    height = width;
    
    x = nose.x * videoWidth - width / 2;
    y = nose.y * videoHeight - height / 2;
    
    rotation = Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI);
  }

  // Flip X coordinate if mirrored
  if (isMirrored) {
    x = videoWidth - x - width;
    rotation = -rotation; // Flip rotation too
  }

  return { x, y, width, height, rotation };
}
