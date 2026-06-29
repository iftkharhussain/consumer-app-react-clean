/**
 * TikTok Pixel Tracking Utility
 * Used to track events in the consumer application.
 * The base pixel (ttq.load / ttq.page) is initialized in public/index.html.
 */

export const TIKTOK_PIXEL_ID = 'D8U474BC77UBEINTGEM0';

/**
 * Track a standard or custom TikTok Pixel event
 * @param {string} eventName - Name of the event (e.g., 'Contact', 'Schedule')
 * @param {Object} params - Optional parameters for the event
 */
export const trackTikTokEvent = (eventName, params = {}) => {
  if (window.ttq) {
    window.ttq.track(eventName, params);
  } else {
    console.debug(`[TikTokPixel] Event "${eventName}" not tracked: ttq not initialized.`, params);
  }
};

/**
 * Track a TikTok Pixel event at most once per browser session.
 * Uses sessionStorage so the guard survives a full page refresh (unlike a
 * React useRef/state flag, which resets when the app reloads). This mirrors
 * how the Meta 'Lead' event is de-duplicated in App.jsx.
 * @param {string} eventName - Name of the event (e.g., 'Lead', 'Schedule')
 * @param {Object} params - Optional parameters for the event
 * @param {string} [dedupeKey] - Override the session key (defaults to eventName)
 */
export const trackTikTokEventOnce = (eventName, params = {}, dedupeKey = eventName) => {
  const storageKey = `tiktok_event_${dedupeKey}`;
  try {
    if (sessionStorage.getItem(storageKey)) {
      return; // already fired this session — skip to avoid refresh double-counting
    }
    trackTikTokEvent(eventName, params);
    sessionStorage.setItem(storageKey, 'true');
  } catch (e) {
    // sessionStorage unavailable (e.g. private mode) — fall back to firing normally
    trackTikTokEvent(eventName, params);
  }
};

export default {
  track: trackTikTokEvent,
  trackOnce: trackTikTokEventOnce,
};
