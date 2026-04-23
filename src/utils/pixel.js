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
  trackCustom: trackCustomPixelEvent,
};
