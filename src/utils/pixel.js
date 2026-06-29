/**
 * Meta Pixel Tracking Utility
 * Used to track events in the consumer application
 */

export const PIXEL_ID = '4299620996968520';

/**
 * Track a custom or standard Meta Pixel event
 * @param {string} eventName - Name of the event (e.g., 'PageView', 'Lead', 'Schedule')
 * @param {Object} params - Optional parameters for the event
 */
export const trackPixelEvent = (eventName, params = {}, eventID = null) => {
  if (window.fbq) {
    if (eventID) {
      window.fbq('track', eventName, params, { eventID });
    } else {
      window.fbq('track', eventName, params);
    }
  } else {
    console.debug(`[Pixel] Event "${eventName}" not tracked: fbq not initialized.`, params);
  }
};

/**
 * Track a Meta Pixel event at most once per browser session.
 * Uses sessionStorage so the guard survives a full page refresh (unlike a
 * React useRef/state flag, which resets when the app reloads).
 * @param {string} eventName - Name of the event (e.g., 'Schedule')
 * @param {Object} params - Optional parameters for the event
 * @param {string|null} eventID - Optional event ID for deduplication with CAPI
 * @param {string} [dedupeKey] - Override the session key (defaults to eventName)
 */
export const trackPixelEventOnce = (eventName, params = {}, eventID = null, dedupeKey = eventName) => {
  const storageKey = `pixel_event_${dedupeKey}`;
  try {
    if (sessionStorage.getItem(storageKey)) {
      return; // already fired this session — skip to avoid refresh double-counting
    }
    trackPixelEvent(eventName, params, eventID);
    sessionStorage.setItem(storageKey, 'true');
  } catch (e) {
    // sessionStorage unavailable (e.g. private mode) — fall back to firing normally
    trackPixelEvent(eventName, params, eventID);
  }
};

/**
 * Track a custom event (specifically for non-standard Meta events)
 * @param {string} eventName
 * @param {Object} params
 */
export const trackCustomPixelEvent = (eventName, params = {}) => {
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params);
  } else {
    console.debug(`[Pixel] Custom Event "${eventName}" not tracked: fbq not initialized.`, params);
  }
};

export default {
  track: trackPixelEvent,
  trackOnce: trackPixelEventOnce,
  trackCustom: trackCustomPixelEvent,
};
