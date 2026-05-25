/**
 * analyticsHelper.js
 *
 * Independent first-party analytics tracing layer.
 * Completely decoupled from the functional `norga_sid` parameter — never mix the two.
 *
 *  - visitor_id_analytics : permanent UUID in localStorage (new vs returning users)
 *  - session_id_analytics : rolling 30-minute inactivity window (resets on every event)
 *  - UTM tags             : read straight from the URL on each event
 *
 * Sends a combined payload to POST /api/analytics/track.
 */

import { baseUrl } from '../apis/sharedApi';

const VISITOR_KEY = 'visitor_id_analytics';
const SESSION_KEY = 'session_id_analytics';
const SESSION_EXPIRY_KEY = 'session_id_analytics_expiry';
const LEAD_KEY = 'analytics_lead_id';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes of inactivity

/** Generate a UUID — uses crypto.randomUUID when available, with a safe fallback. */
function generateUuid() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	// RFC4122-ish fallback for non-secure contexts / older browsers
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/**
 * Cross-domain handoff: if the landing URL carries visitor_id_analytics /
 * session_id_analytics (forwarded from norga.io), adopt them as the active IDs
 * on this origin (app.norga.io) — overriding any local generation — then strip
 * them from the address bar. Idempotent: once stripped, re-running is a no-op.
 */
export function inheritAnalyticsIdsFromUrl() {
	try {
		const params = new URLSearchParams(window.location.search);
		const urlVisitor = params.get(VISITOR_KEY);
		const urlSession = params.get(SESSION_KEY);
		if (!urlVisitor && !urlSession) return;

		if (urlVisitor) {
			localStorage.setItem(VISITOR_KEY, urlVisitor);
		}
		if (urlSession) {
			localStorage.setItem(SESSION_KEY, urlSession);
			// Treat the inherited session as freshly active so getSessionId reuses it
			localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_TTL_MS));
		}

		// Strip the tracking params so the visible URL stays pristine for the user
		params.delete(VISITOR_KEY);
		params.delete(SESSION_KEY);
		const qs = params.toString();
		const cleanUrl = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
		window.history.replaceState({}, document.title, cleanUrl);
	} catch (err) {
		console.error('[AnalyticsTrace] inherit IDs from URL failed:', err);
	}
}

/** Permanent visitor id — created once, then persists forever in localStorage. */
export function getVisitorId() {
	let visitorId = localStorage.getItem(VISITOR_KEY);
	if (!visitorId) {
		visitorId = generateUuid();
		localStorage.setItem(VISITOR_KEY, visitorId);
	}
	return visitorId;
}

/**
 * Session id with a rolling 30-minute inactivity window.
 * Mints a fresh id if none exists or the stored one has expired; otherwise reuses it.
 * Every call pushes the expiry forward by another 30 minutes (resets on each event).
 */
export function getSessionId() {
	const now = Date.now();
	const existingId = localStorage.getItem(SESSION_KEY);
	const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY), 10);

	let sessionId = existingId;
	if (!sessionId || !expiry || now > expiry) {
		sessionId = generateUuid();
		localStorage.setItem(SESSION_KEY, sessionId);
	}

	// Reset the inactivity window
	localStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_TTL_MS));
	return sessionId;
}

/** Pull utm_source / utm_medium / utm_campaign straight from the URL. */
export function getUtmParams() {
	const params = new URLSearchParams(window.location.search);
	return {
		source: params.get('utm_source') || '',
		medium: params.get('utm_medium') || '',
		campaign: params.get('utm_campaign') || ''
	};
}

/**
 * Fire a single analytics page event to the consumer backend.
 * Non-blocking: failures are logged but never interrupt the UI.
 */
export function trackAnalyticsEvent({ eventName = 'page_view', url, path } = {}) {
	try {
		// Adopt any IDs handed off via the landing URL BEFORE generating new ones
		inheritAnalyticsIdsFromUrl();

		const resolvedPath = path || window.location.pathname;

		const payload = {
			visitor_id_analytics: getVisitorId(),
			session_id_analytics: getSessionId(),
			eventName,
			url: url || window.location.href,
			path: resolvedPath,
			utm: getUtmParams()
		};

		// Attach the LMS lead id once the visitor has become a lead
		const leadIdAnalytics = localStorage.getItem(LEAD_KEY);
		if (leadIdAnalytics) {
			payload.lead_id_analytics = leadIdAnalytics;
		}

		fetch(`${baseUrl}/api/analytics/track`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
			.then(() => {
				// On a successful /result hit, clear the lead id and the temporary session
				// identifiers so they don't leak into a future, separate tracking loop.
				// visitor_id_analytics is permanent and intentionally preserved.
				if (resolvedPath === '/result') {
					localStorage.removeItem(LEAD_KEY);
					localStorage.removeItem(SESSION_KEY);
					localStorage.removeItem(SESSION_EXPIRY_KEY);
				}
			})
			.catch((err) => console.error('[AnalyticsTrace] track failed:', err));
	} catch (err) {
		console.error('[AnalyticsTrace] track error:', err);
	}
}
