/**
 * analytics.js — Client-side analytics reporter
 *
 * Sends session events to the COMIT Booth server.
 * All calls are fire-and-forget (errors silently ignored so they
 * never break the user experience).
 */

const SERVER = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Post a session event to the analytics endpoint.
 * @param {'complete'|'download'|'print'} action
 * @param {string} frameId
 * @param {number} photoCount
 */
export async function trackSession(action, frameId, photoCount) {
  try {
    await fetch(`${SERVER}/api/analytics/session`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        frameId,
        photoCount,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Server offline or network error — silently ignored
  }
}

/**
 * Fetch aggregated analytics from the server.
 * @returns {Promise<object|null>}
 */
export async function fetchAnalytics() {
  try {
    const res  = await fetch(`${SERVER}/api/analytics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[analytics] fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch server health info.
 * @returns {Promise<object|null>}
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${SERVER}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}
/**
 * Reset all analytics data on the server.
 * @returns {Promise<boolean>}
 */
export async function resetAnalytics() {
  try {
    const res = await fetch(`${SERVER}/api/analytics/reset`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn('[analytics] reset failed:', err.message);
    return false;
  }
}
