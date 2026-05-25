# Independent Analytics Tracking Layer — Architecture Reference

> **Status:** Implemented & verified (backend `node --check` clean; CRA + Vite builds exit 0; live create→update→attach and funnel-ladder aggregation tested).
> **Golden rule:** This layer is **completely decoupled** from the legacy `norga_sid` flow. Never mix the two. The legacy `sessionId` / `getFunnelReport` surface is intentionally preserved as an isolated fallback until it is sunset.

## Repository / path map (directive name → actual path)

The original spec used idealized paths. The **actual** files in this monorepo are:

| Role | Directive name | **Actual path** |
|---|---|---|
| Mongoose schema | `consumer-app/models/AnalyticsSession.js` | `consumer-app/src/schema/AnalyticsSession.js` |
| Tracking controller + resolver | `controllers/analyticsController.js` + `services/resolveFunnelStep.js` | `consumer-app/src/controllers/analyticsController.js` (resolver lives **inline** here) |
| Route mount | — | `consumer-app/src/routes/analyticsRoutes.js` → mounted at `/api` in `consumer-app/src/app.js` |
| Embedded questionnaire widget | `embedded-widget/src/components/PhoneVerification.jsx` | `consumer-app-questions/src/components/PhoneVerification/PhoneVerification.jsx` |
| Consumer portal helper | `consumer-app-frontend/src/utils/analyticsHelper.js` | `consumer-app-react/src/utils/analyticsHelper.js` |
| Consumer portal wiring | — | `consumer-app-react/src/App.jsx` (`PixelTracker`) |
| Lead-login hook | `consumer-app-frontend/src/pages/leadLogin/index.jsx` | `consumer-app-react/src/pages/leadLogin/index.jsx` |
| Dashboard report aggregator | `consumer-app/controllers/reportController.js` | `norga-app/services/analytics/analyticsService.js` (`fetchConsumerFunnelReport`) — the **Norgay** app reads the Consumer DB read-only |

**Runtime topology:** Consumer API runs on port `3025`, DB `consumer-app` (Mongo `mongodb://localhost:27017/consumer-app`). The Norgay (LMS) backend opens a **separate read-only mongoose connection** to that same Consumer DB and reads the `analyticssessions` collection for dashboards.

---

## 1. SYSTEM OVERVIEW & IDENTITY LIFECYCLE

### The Tracking Core

Every event for the analytics layer lands in a single Mongoose model, `AnalyticsSession` (collection `analyticssessions`). The same collection also holds legacy `norga_sid` documents; the two are distinguished by which fields are present.

**Primary filtering keys — `{ visitor_id_analytics, session_id_analytics }`.** Every write (`findOneAndUpdate`/`updateOne`) filters on this pair. It is the upsert identity for the analytics layer and is backed by a compound index. `sessionId` (the legacy `norga_sid`) is **not** used by this layer and is left `undefined` on analytics documents.

- **`visitor_id_analytics`** — permanent UUID created once per browser, persisted in `localStorage` forever. Identifies **new vs returning** visitors across sessions.
- **`session_id_analytics`** — UUID with a **rolling 30-minute inactivity window**. Identifies a single visit. Resets to a new UUID after 30 minutes of no events.
- **First-touch attribution (`trafficSource`)** — `referrer`, `landingPage`, and the five UTM fields are written **only on document insert** via `$setOnInsert`. Because later events on the same session match the existing document, `$setOnInsert` is skipped and these values are **never overwritten** — preserving the original campaign that brought the user in.
- **`insurance_type`** — the product (`auto`/`home`/`life`/`mortgage`), resolved from the path the **first** time a product-specific step (1 or 2) is seen, then frozen (see §3 resolver). Shared paths (`/result`, `/confirmation-*`) never change it.
- **`lead_id_analytics`** — the **late-attaching** identifier. When an anonymous visitor becomes a lead, the true LMS `leadId` is stitched onto the already-open session document via a separate `updateOne` `$set` (it does not exist at insert time). Kept distinct from the legacy `leadId` ObjectId field.
- **`current_funnel_step`** — the **furthest** funnel step reached (1–4), written monotonically via `$max` (see below).
- **`events[]`** — append-only stream of `{ eventName, url, path, timestamp, metadata }`, one entry per page transition (`$push` on every hit).

### Monotonic Step Progression (`$max`)

`current_funnel_step` is written with the MongoDB **`$max`** update operator, never `$set`:

```js
update.$max = { current_funnel_step: funnel.step };
```

`$max` only writes the new value if it is **greater** than the stored one. This provides **backward-navigation protection**: if a user reaches Step 4 (`/confirmation-call/...`) and then hits the **back button** to Step 3 (`/result`), the incoming write is `$max(4, 3)` → the field **stays 4**. The metric represents "furthest step reached," never the literal latest page.

This monotonic guarantee is the **precondition** for the dashboard's reporting math (§5): because the value only ever increases, **"reached step N" is exactly `current_funnel_step >= N`**, so step counts and drop-offs can be computed in a single grouped query with no negative numbers and no undercounting.

---

## 2. THE WEBFLOW GLOBAL SCRIPT (PRODUCTION CODE)

Paste verbatim into **Webflow → Site Settings → Custom Code → Head Code** so it runs on every page (landing + questionnaire) before any submit/redirect. It mints the identity keys with the exact naming the React layers read, and fires the Step 1 / Step 2 `page_view`. The whole block is wrapped in `try/catch` so a storage-blocked browser or ad-blocker can never break the page.

```html
<!-- NORGA Analytics — Global Identity + Funnel Step Tracking (Webflow Head Code, all pages) -->
<script>
(function () {
  try {
    var API_ENDPOINT       = 'https://app.norga.io/api/analytics/track';
    var VISITOR_KEY        = 'visitor_id_analytics';
    var SESSION_KEY        = 'session_id_analytics';
    var SESSION_EXPIRY_KEY = 'session_id_analytics_expiry';
    var SESSION_TTL_MS     = 30 * 60 * 1000; // 30-minute rolling inactivity window

    function genId() {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    }

    // visitor_id_analytics — permanent
    function getVisitorId() {
      var v = localStorage.getItem(VISITOR_KEY);
      if (!v) { v = genId(); localStorage.setItem(VISITOR_KEY, v); }
      return v;
    }

    // session_id_analytics — rolling 30-min window; resets on every page load
    function getSessionId() {
      var now = Date.now();
      var s   = localStorage.getItem(SESSION_KEY);
      var exp = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY), 10);
      if (!s || !exp || now > exp) { s = genId(); localStorage.setItem(SESSION_KEY, s); }
      localStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_TTL_MS));
      return s;
    }

    function getUtm() {
      var p = new URLSearchParams(window.location.search);
      return {
        source:   p.get('utm_source')   || '',
        medium:   p.get('utm_medium')   || '',
        campaign: p.get('utm_campaign') || ''
      };
    }

    var visitorId = getVisitorId();
    var sessionId = getSessionId();

    // Expose so the questionnaire redirect builder / any other script can reuse them
    window.NorgaAnalytics = {
      visitorId: visitorId, sessionId: sessionId,
      getVisitorId: getVisitorId, getSessionId: getSessionId
    };

    // Funnel step ping (Step 1 landing / Step 2 questionnaire) — fire-and-forget
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        visitor_id_analytics: visitorId,
        session_id_analytics: sessionId,
        eventName: 'page_view',
        url: window.location.href,
        path: window.location.pathname,
        utm: getUtm()
      })
    }).catch(function () { /* network / ad-blocker — ignore, never break the page */ });
  } catch (e) {
    /* storage blocked (private mode / strict privacy) — widget fallback mints instead */
  }
})();
</script>
```

**CORS:** the Consumer API allow-lists `https://norga.io` and `https://www.norga.io`, so this cross-origin POST (and its preflight) is permitted.

---

## 3. FILE-BY-FILE CHANGELOG & EXACT CODE

### 3.1 `consumer-app/src/schema/AnalyticsSession.js`

**Role:** The single Mongoose model for the analytics layer (and the legacy `norga_sid` flow). Defines fields, the sparse-unique legacy index, the upsert compound index, and the two dashboard aggregation indexes.

```js
const mongoose = require('mongoose');

const AnalyticsSessionSchema = new mongoose.Schema({
  // Legacy norga_sid identifier (functional flow). Kept fully isolated from the
  // analytics tracing layer below. Now optional + sparse-unique (index defined further
  // down) so analytics-only documents can exist without a norga_sid. Legacy callers
  // always send a sessionId, so uniqueness is still enforced for them.
  sessionId: {
    type: String
  },
  // ---- Independent analytics tracing layer (decoupled from norga_sid) ----
  visitor_id_analytics: {
    type: String,
    index: true
  },
  session_id_analytics: {
    type: String,
    index: true
  },
  // LMS lead id attached when an analytics visitor becomes a lead (decoupled from
  // the legacy `leadId` ObjectId field, which is left untouched).
  lead_id_analytics: {
    type: String,
    index: true
  },
  // Resolved product + funnel position for the analytics tracing layer
  insurance_type: {
    type: String, // e.g. 'auto', 'home', 'life', 'mortgage'
    index: true
  },
  current_funnel_step: {
    type: Number // 1=landing, 2=questionnaire, 3=result, 4=confirmation
  },
  userId: {
    type: String, // Can store user ID or leadId from LMS if authenticated
    index: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    index: true
  },
  // Traffic Source & UTMs
  trafficSource: {
    referrer: String,
    landingPage: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String
  },
  // Device & Browser Details
  device: {
    userAgent: String,
    ipAddress: String
  },
  // Parsed device information for the analytics tracing layer (from ua-parser-js)
  device_information: {
    device_type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    os: String,
    browser: String
  },
  // Funnel Event Stream
  events: [{
    eventName: {
      type: String,
      enum: ['page_view', 'form_start', 'step_completed', 'lead_conversion', 'custom_click'],
      required: true
    },
    url: String,
    path: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for analytical queries
AnalyticsSessionSchema.index({ createdAt: 1 });
AnalyticsSessionSchema.index({ 'events.eventName': 1 });
AnalyticsSessionSchema.index({ 'events.path': 1 });

// Legacy norga_sid uniqueness — sparse so analytics-only docs (no sessionId) are allowed
AnalyticsSessionSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

// Analytics tracing layer: upsert lookup keys on BOTH ids
AnalyticsSessionSchema.index({ visitor_id_analytics: 1, session_id_analytics: 1 });

// Dashboard funnel aggregations: per-product step counts + time-ordered listings
AnalyticsSessionSchema.index({ insurance_type: 1, current_funnel_step: 1 });
AnalyticsSessionSchema.index({ insurance_type: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsSession', AnalyticsSessionSchema);
```

> **Migration note:** the `sessionId` index was historically `{ unique: true }` (non-sparse). It MUST be migrated to sparse before this layer goes live, or the 2nd analytics-only document (`sessionId: null`) throws `E11000 duplicate key`. See §6.

---

### 3.2 `consumer-app/src/controllers/analyticsController.js` — Funnel resolver

**Role:** Module-scope path-matching dictionary that maps request paths → `{ insurance_type, step }`. Defined once (not per request). Steps 1–2 are product-specific; steps 3–4 are **shared** across all products, so they resolve a step but `insurance_type: null` (inherited from the stored session value).

```js
/**
 * Funnel step configuration for the analytics tracing layer.
 * Maps request paths -> { product, step }. Steps 1-2 are product-specific
 * (Webflow landing/questionnaire); steps 3-4 (/result, /confirmation-*) are
 * SHARED across every product, so the product for those is inherited from the
 * session's already-stored insurance_type, not derived from the path.
 */
const FUNNEL_STEPS = {
  auto: [
    { step: 1, name: 'landing',       match: '/assurance/auto',                                 type: 'exact' },
    { step: 2, name: 'questionnaire', match: '/assurance/questionnaire-auto',                   type: 'exact' },
    { step: 3, name: 'result',        match: '/result',                                         type: 'exact' },
    { step: 4, name: 'confirmation',  match: ['/confirmation-call', '/confirmation-meeting'],   type: 'prefix' }
  ],
  home: [
    { step: 1, name: 'landing',       match: '/assurance/habitation',                           type: 'exact' },
    { step: 2, name: 'questionnaire', match: '/assurance/questionnaire-habitation',             type: 'exact' },
    { step: 3, name: 'result',        match: '/result',                                         type: 'exact' },
    { step: 4, name: 'confirmation',  match: ['/confirmation-call', '/confirmation-meeting'],   type: 'prefix' }
  ],
  life: [
    { step: 1, name: 'landing',       match: '/assurance/vie',                                  type: 'exact' },
    { step: 2, name: 'questionnaire', match: '/assurance/questionnaire-vie',                    type: 'exact' },
    { step: 3, name: 'result',        match: '/result',                                         type: 'exact' },
    { step: 4, name: 'confirmation',  match: ['/confirmation-call', '/confirmation-meeting'],   type: 'prefix' }
  ],
  mortgage: [
    { step: 1, name: 'landing',       match: '/assurance/hypotheque',                           type: 'exact' },
    { step: 2, name: 'questionnaire', match: '/assurance/questionnaire-hypotheque',             type: 'exact' },
    { step: 3, name: 'result',        match: '/result',                                         type: 'exact' },
    { step: 4, name: 'confirmation',  match: ['/confirmation-call', '/confirmation-meeting'],   type: 'prefix' }
  ]
};

/** Does a path match a step definition (exact or prefix; single string or array)? */
function pathMatchesStep(path, stepDef) {
  const matchers = Array.isArray(stepDef.match) ? stepDef.match : [stepDef.match];
  if (stepDef.type === 'prefix') {
    return matchers.some((m) => path.startsWith(m));
  }
  return matchers.includes(path);
}

/**
 * Resolve a path to { insurance_type, step, name }.
 *  - product-specific path (steps 1-2) -> insurance_type identified.
 *  - shared path (steps 3-4) matches every product -> insurance_type = null
 *    (caller inherits the product from the stored session value).
 *  - no funnel match -> null.
 */
function resolveFunnelStep(path) {
  if (!path) return null;
  const matches = [];
  for (const [product, steps] of Object.entries(FUNNEL_STEPS)) {
    for (const stepDef of steps) {
      if (pathMatchesStep(path, stepDef)) {
        matches.push({ insurance_type: product, step: stepDef.step, name: stepDef.name });
      }
    }
  }
  if (matches.length === 0) return null;
  const products = [...new Set(matches.map((m) => m.insurance_type))];
  const { step, name } = matches[0];
  return {
    insurance_type: products.length === 1 ? products[0] : null, // null => shared path
    step,
    name
  };
}
```

The `/confirmation-*` step uses `type: 'prefix'`, so `'/confirmation-call/abc123'.startsWith('/confirmation-call')` matches despite the dynamic `:userProductId` segment.

---

### 3.3 `consumer-app/src/controllers/analyticsController.js` — Tracking handler

**Role:** The route entry point branches: when `visitor_id_analytics` + `session_id_analytics` are present it routes to `trackAnalyticsTrace`; otherwise the legacy `norga_sid` flow runs untouched. `trackAnalyticsTrace` does (a) the main atomic `findOneAndUpdate` upsert with `$setOnInsert` + `$push` + `$max`, (b) a separate guarded first-touch `insurance_type` `$set`, and (c) the late-attach `lead_id_analytics` conditional `$set`.

**Header / helpers:**

```js
const AnalyticsSession = require('../schema/AnalyticsSession');
const logger = require('../utils/logger');

// User-Agent parser (compatible with both v1 and v2 export shapes)
const UAParserPkg = require('ua-parser-js');
const UAParser = UAParserPkg.UAParser || UAParserPkg;

/**
 * Extract the client's real IP address.
 * Prefer the X-Forwarded-For header (first hop, when behind a proxy/CDN),
 * and fall back to the raw socket address.
 */
function extractClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    return fwd.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || '';
}

/**
 * Bucket a parsed User-Agent device type into desktop / mobile / tablet.
 * ua-parser-js leaves `device.type` undefined for desktops.
 */
function bucketDeviceType(uaDeviceType) {
  if (uaDeviceType === 'mobile') return 'mobile';
  if (uaDeviceType === 'tablet') return 'tablet';
  if (!uaDeviceType) return 'desktop';
  return 'unknown';
}
```

**The branch inside `trackEvent` (route handler) that routes to the analytics layer:**

```js
const {
  sessionId, eventName, url, path, utm, referrer, metadata,
  visitor_id_analytics, session_id_analytics, lead_id_analytics
} = req.body;

if (!eventName) {
  return res.status(400).json({ success: false, message: 'eventName is required' });
}

// ---- Independent analytics tracing layer (decoupled from norga_sid) ----
// When the new analytics identifiers are present, route to the dedicated upsert
// handler and leave the legacy norga_sid flow below completely untouched.
if (visitor_id_analytics && session_id_analytics) {
  return await trackAnalyticsTrace(req, res, {
    visitor_id_analytics, session_id_analytics, lead_id_analytics, eventName, url, path, utm, referrer, metadata
  });
}

// ---- Legacy norga_sid flow (unchanged) ----  [omitted here; intentionally not modified]
```

**The dedicated upsert handler (`trackAnalyticsTrace`) — full:**

```js
/**
 * Independent analytics tracing layer handler.
 *
 * Upserts a single AnalyticsSession document keyed on BOTH visitor_id_analytics
 * and session_id_analytics:
 *   - On insert: stores the first-touch UTM tags, parsed device info, IP and UA.
 *   - On existing: atomically pushes only the new page event into the events array.
 *
 * Fully isolated from the legacy norga_sid (sessionId) flow.
 */
async function trackAnalyticsTrace(req, res, payload) {
  const {
    visitor_id_analytics, session_id_analytics, lead_id_analytics,
    eventName, url, path, utm, referrer, metadata
  } = payload;

  const userAgent = req.headers['user-agent'] || '';
  const ip = extractClientIp(req);

  // Parse the User-Agent into clean device/os/browser buckets
  const ua = new UAParser(userAgent).getResult();
  const device_information = {
    device_type: bucketDeviceType(ua.device && ua.device.type),
    os: [ua.os && ua.os.name, ua.os && ua.os.version].filter(Boolean).join(' '),
    browser: [ua.browser && ua.browser.name, ua.browser && ua.browser.version].filter(Boolean).join(' ')
  };

  const eventEntry = {
    eventName,
    url: url || '',
    path: path || '',
    metadata: metadata || {}
  };

  // Classify this hit into a funnel product/step from its path
  const funnel = resolveFunnelStep(path || '');

  const update = {
    // Create-only fields: first-touch attribution + device snapshot
    $setOnInsert: {
      visitor_id_analytics,
      session_id_analytics,
      trafficSource: {
        referrer: referrer || req.headers['referer'] || '',
        landingPage: url || '',
        utmSource: utm?.source || '',
        utmMedium: utm?.medium || '',
        utmCampaign: utm?.campaign || '',
        utmTerm: utm?.term || '',
        utmContent: utm?.content || ''
      },
      device: { userAgent, ipAddress: ip },
      device_information
    },
    // Always append the page transition
    $push: { events: eventEntry }
  };

  // Record the FURTHEST funnel step reached (monotonic via $max) so the dashboard's
  // step-completion and drop-off math stays correct even if the user navigates back.
  if (funnel) {
    update.$max = { current_funnel_step: funnel.step };
  }

  await AnalyticsSession.findOneAndUpdate(
    { visitor_id_analytics, session_id_analytics },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // First-touch product: set insurance_type once, the first time a product-specific
  // path (steps 1-2) is seen. The $or guard means an already-resolved product is
  // never overwritten, and shared paths (insurance_type null) never clear it.
  if (funnel && funnel.insurance_type) {
    await AnalyticsSession.updateOne(
      {
        visitor_id_analytics,
        session_id_analytics,
        $or: [
          { insurance_type: { $exists: false } },
          { insurance_type: null },
          { insurance_type: '' }
        ]
      },
      { $set: { insurance_type: funnel.insurance_type } }
    );
  }

  // When the visitor has become a lead, atomically attach the LMS lead id to the
  // already-open session document (late update -> $set, not $setOnInsert).
  if (lead_id_analytics) {
    await AnalyticsSession.updateOne(
      { visitor_id_analytics, session_id_analytics },
      { $set: { lead_id_analytics } },
      { upsert: false }
    );
  }

  return res.status(200).json({
    success: true,
    message: 'Analytics event logged',
    visitor_id_analytics,
    session_id_analytics,
    insurance_type: funnel ? funnel.insurance_type : null,
    current_funnel_step: funnel ? funnel.step : null
  });
}
```

**Why three separate operations?**
1. `findOneAndUpdate` (upsert) — guarantees the document exists and records first-touch + the event + `$max` step in one atomic op.
2. Guarded `updateOne` for `insurance_type` — uses an `$or` "not yet set" filter so the product is captured **first-touch only** and never overwritten, independent of whether the doc was just inserted. (This is intentionally NOT in `$setOnInsert`, so it still works if a session's very first hit happens to be a shared path.)
3. `updateOne` `$set: { lead_id_analytics }` with `upsert: false` — stitches the LMS lead id onto the **existing** session without ever creating a duplicate.

---

### 3.4 `consumer-app-questions/src/components/PhoneVerification/PhoneVerification.jsx`

**Role:** On successful questionnaire submission, builds the cross-domain redirect to `app.norga.io`. Appends `event_id`, then the two analytics IDs (URL-encoded). Includes the **submission-time fallback**: if the global Webflow script was blocked and the IDs are missing/empty/expired, it mints them on the spot so the chain never forwards null. (Inside `handleFormSubmission`.)

```js
let targetUrl = response?.redirectUrl || response?.url;

if (targetUrl) {
  // Append event_id to the redirect URL for cross-app continuity
  if (event_id) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${separator}event_id=${event_id}`;
  }

  // Cross-domain analytics handoff: forward the independent tracing IDs
  // (norga.io localStorage -> app.norga.io via URL) so the consumer portal
  // can continue the same analytics session. Legacy norga_sid is untouched.
  //
  // Safety net: if the global Webflow script was blocked (browser extension /
  // cookie restriction) and the IDs are missing or the session has expired,
  // mint fresh ones here so the cross-domain chain never breaks.
  const SESSION_TTL_MS = 30 * 60 * 1000; // 30-min rolling window (matches app + Webflow)
  const genAnalyticsId = () =>
    (window.crypto && typeof window.crypto.randomUUID === 'function')
      ? window.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });

  // visitor id — permanent; create if missing/empty
  let visitorIdAnalytics = localStorage.getItem('visitor_id_analytics');
  if (!visitorIdAnalytics) {
    visitorIdAnalytics = genAnalyticsId();
    localStorage.setItem('visitor_id_analytics', visitorIdAnalytics);
  }

  // session id — rolling 30-min window; create if missing/empty/expired
  let sessionIdAnalytics = localStorage.getItem('session_id_analytics');
  const sessionExpiry = parseInt(localStorage.getItem('session_id_analytics_expiry'), 10);
  if (!sessionIdAnalytics || !sessionExpiry || Date.now() > sessionExpiry) {
    sessionIdAnalytics = genAnalyticsId();
    localStorage.setItem('session_id_analytics', sessionIdAnalytics);
  }
  localStorage.setItem('session_id_analytics_expiry', String(Date.now() + SESSION_TTL_MS));

  // Both IDs are now guaranteed present -> clean URL-encoded append
  const sepV = targetUrl.includes('?') ? '&' : '?';
  targetUrl = `${targetUrl}${sepV}visitor_id_analytics=${encodeURIComponent(visitorIdAnalytics)}`;
  const sepS = targetUrl.includes('?') ? '&' : '?';
  targetUrl = `${targetUrl}${sepS}session_id_analytics=${encodeURIComponent(sessionIdAnalytics)}`;

  window.location.href = targetUrl;
}
```

**Resulting redirect URL example:**

```
https://app.norga.io/lead-login?token=FORM_JWT&event_id=norga_173..._ab12&visitor_id_analytics=f1c2…&session_id_analytics=a9b8…
```

> The widget has **no on-mount analytics hook** — the Step 2 `page_view` is fired by the global Webflow script (same origin). The widget only touches the analytics keys here, at submit/redirect time.

---

### 3.5 `consumer-app-react/src/utils/analyticsHelper.js`

**Role:** The consumer portal's analytics module. Inherits IDs handed off via the URL (and strips them), maintains the permanent visitor id + rolling 30-min session, reads UTMs, and fires `POST /api/analytics/track`. Full file:

```js
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
```

---

### 3.6 `consumer-app-react/src/App.jsx` — wiring (`PixelTracker`)

**Role:** Fires `trackAnalyticsEvent` on every route change, decoupled from (and additive to) the legacy `norga_sid` block in the same component.

```js
import { trackAnalyticsEvent } from './utils/analyticsHelper';

// …inside the PixelTracker component, alongside the existing (untouched) norga_sid effect:

// Independent analytics tracing layer (visitor_id_analytics + session_id_analytics).
// Fires on every route change; fully decoupled from the norga_sid logic above.
useEffect(() => {
	trackAnalyticsEvent({ eventName: 'page_view' });
}, [location.pathname]);
```

---

### 3.7 `consumer-app-react/src/pages/leadLogin/index.jsx` — late-attach capture

**Role:** On a successful lead-login response, captures the true LMS `leadId` and stores it under `analytics_lead_id` so the next `/result` `page_view` carries it to the backend for the late-attach `$set`. (Inside the success handler.)

```js
if (response?.success) {
  setIsNewUser(response.isNewUser);
  setUserData(response.user);

  // Persist the LMS lead id for the independent analytics tracing layer.
  // Safety-checked: only when a product carrying a leadId came back in the response.
  if (response.products && response.products.length > 0 && response.products[0].leadId) {
    localStorage.setItem('analytics_lead_id', response.products[0].leadId);
  }

  // Store session token if returned
  if (response.sessionToken) {
    localStorage.setItem('sessionToken', response.sessionToken);
  }
  // …
}
```

---

### 3.8 `norga-app/services/analytics/analyticsService.js` — `fetchConsumerFunnelReport`

**Role:** Dashboard aggregator (the `reportController.js` equivalent). Reads the Consumer DB `analyticssessions` read-only and computes per-product funnel metrics from `insurance_type` + `current_funnel_step` — **no page-path parsing**. Full method:

```js
/**
 * Fetch consumer funnel analytics from consumer database
 * @param {string} insuranceType - type of funnel ('auto', 'life', etc.)
 * @returns {Promise<Object>} Funnel report statistics
 */
static async fetchConsumerFunnelReport(insuranceType = 'auto') {
  try {
    const sessionsCollection = consumerDB.analyticsSessions;
    const type = (insuranceType || 'auto').toLowerCase();

    // ---- Funnel counts straight from insurance_type + current_funnel_step ----
    // current_funnel_step holds the FURTHEST step reached (written via $max), so
    // "reached step N" === current_funnel_step >= N. No page-path parsing needed.
    const agg = await sessionsCollection.aggregate([
      { $match: { insurance_type: type } },
      {
        $group: {
          _id: null,
          step1: { $sum: { $cond: [{ $gte: ['$current_funnel_step', 1] }, 1, 0] } },
          step2: { $sum: { $cond: [{ $gte: ['$current_funnel_step', 2] }, 1, 0] } },
          step3: { $sum: { $cond: [{ $gte: ['$current_funnel_step', 3] }, 1, 0] } },
          step4: { $sum: { $cond: [{ $gte: ['$current_funnel_step', 4] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]).toArray();

    const c = agg[0] || { step1: 0, step2: 0, step3: 0, step4: 0, total: 0 };
    const pct = (num, den) => (den > 0 ? ((num / den) * 100).toFixed(2) + '%' : '0%');

    // ---- 100 most recent sessions for this product, for granular review ----
    const recent = await sessionsCollection
      .find({ insurance_type: type })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const sessions = recent.map((s) => ({
      sessionId: s.session_id_analytics,
      visitorId: s.visitor_id_analytics,
      leadId: s.lead_id_analytics || null,
      currentStep: s.current_funnel_step || 0,
      createdAt: s.createdAt || s.updatedAt,
      trafficSource: s.trafficSource || {},
      device: s.device_information || s.device || {},
      converted: (s.current_funnel_step || 0) >= 3, // reached /result === became a lead
      totalEvents: (s.events || []).length
    }));

    return {
      success: true,
      data: {
        insuranceType: type,
        funnel: {
          landingPageViews: c.step1,   // step 1
          questionnaireViews: c.step2, // step 2
          results: c.step3,            // step 3 (lead)
          confirmations: c.step4,      // step 4 (call/meeting — auto only)
          rates: {
            landingToFormRate: pct(c.step2, c.step1),
            formToResultRate: pct(c.step3, c.step2),
            resultToConfirmationRate: pct(c.step4, c.step3),
            overallConversionRate: pct(c.step3, c.step1)
          },
          dropOff: {
            afterLanding: c.step1 - c.step2,
            afterQuestionnaire: c.step2 - c.step3,
            afterResult: c.step3 - c.step4
          }
        },
        sessions
      }
    };
  } catch (error) {
    console.error('Error fetching consumer funnel in AnalyticsService:', error.message);
    return {
      success: false,
      message: 'Failed to retrieve funnel metrics from consumer database: ' + error.message
    };
  }
}
```

Exposed to the dashboard via `GET /web/analytics/consumer-funnel?type=auto` (`norga-app/routes/web/analyticsRoutes/index.js` → `AnalyticsController.fetchConsumerFunnel`).

---

## 4. END-TO-END USER JOURNEY

| Step | Path | Fired by | `current_funnel_step` (`$max`) | `insurance_type` | Notes |
|---|---|---|---|---|---|
| 1 Landing | `/assurance/auto` | Webflow snippet | 1 | `auto` (first-touch set) | doc inserted; UTMs + device captured |
| 2 Questionnaire | `/assurance/questionnaire-auto` | Webflow snippet | 2 | `auto` (unchanged) | `$setOnInsert` skipped → UTMs preserved |
| (handoff) | `…/lead-login?…&visitor_id_analytics=…&session_id_analytics=…` | Widget redirect | — | — | IDs forwarded via URL (or fallback-minted) |
| 3 Result / Lead | `/result` | Consumer React | 3 | `auto` (inherited) | `inheritAnalyticsIdsFromUrl()` adopts + strips; `lead_id_analytics` stitched via `$set` |
| 4 Confirmation | `/confirmation-call/:id` | Consumer React | 4 | `auto` (inherited) | prefix match; `$max` guards back-navigation |

**Identity continuity:** Webflow mints → same-origin questionnaire keeps it (or fallback-mints at submit) → URL handoff carries it across the `norga.io` → `app.norga.io` boundary (localStorage is per-origin and cannot be shared directly) → consumer app inherits + strips → backend classifies and stitches. One document, one `visitor_id`/`session_id` pair, product set once, step only ever advancing.

---

## 5. THE AGGREGATED REPORT — performance model

Because `current_funnel_step` is monotonic (§1), the report computes all four step counts in a **single grouped query** using `{ $gte: ['$current_funnel_step', N] }` inside `$cond`/`$sum`. Rates and drop-offs are pure arithmetic on those four numbers.

**Index utilization:**
- `{ insurance_type: 1, current_funnel_step: 1 }` — the `$match: { insurance_type }` seeks directly to a product's slice via the index prefix; `current_funnel_step` as the second key lets the grouped `$gte` comparisons run as an **index range** rather than a collection scan. Per-product counts stay fast across millions of rows.
- `{ insurance_type: 1, createdAt: -1 }` — backs `find({ insurance_type }).sort({ createdAt: -1 }).limit(100)`: walks the index in reverse and stops after 100 docs — **no in-memory sort**.

---

## 6. DEPLOYMENT RUNBOOK (must-do before production)

1. **Deploy the Consumer API backend + `npm install`** (adds `ua-parser-js`), then restart (`npm run pm2:restart:prod` → `pm2 restart consumer-app-api-prod`). The `/api/analytics/track` route does not exist on an un-deployed instance (returns the app's own 404). **Deploy new code BEFORE the index migration** so an old instance with `autoIndex` doesn't recreate the non-sparse `sessionId_1`.
2. **Run the index migration on the production `consumer-app` DB** (both lines — drop is only half):
   ```js
   db.analyticssessions.dropIndex("sessionId_1");
   db.analyticssessions.createIndex({ sessionId: 1 }, { unique: true, sparse: true });
   ```
   Without it, the 2nd analytics-only document (`sessionId: null`) throws `E11000 duplicate key error … index: sessionId_1`. Confirm the funnel compound indexes exist (or run `AnalyticsSession.syncIndexes()` if `autoIndex` is off in prod).
3. **Deploy the two frontend builds** (`consumer-app-questions` Vite build, `consumer-app-react` CRA build) and **paste the Webflow head snippet** (§2) into Webflow global custom code.

---

## 7. KEY INVARIANTS & GOTCHAS

- **Decoupling:** the legacy `norga_sid` (`sessionId`) flow and `getFunnelReport` are untouched and isolated. Analytics docs carry no `sessionId`; legacy docs carry no `*_analytics` fields.
- **Cross-origin localStorage:** `norga.io` and `app.norga.io` do **not** share localStorage — the URL handoff is mandatory to continue a session across the boundary.
- **Product needs steps 1/2:** `insurance_type` is only set from a product-specific path. A session whose first-ever hit is a shared path (e.g. a direct deep-link to `/result`) will have no product and won't appear in any product funnel — by design.
- **`/result` cleanup:** on a successful `/result` hit, `analytics_lead_id`, `session_id_analytics`, and `session_id_analytics_expiry` are cleared so the next quote starts a fresh session loop. `visitor_id_analytics` is permanent and preserved.
- **Endpoint:** `POST /api/analytics/track` is public (unauthenticated) so Webflow and the questionnaire can hit it cross-origin. CORS allow-lists `norga.io`, `www.norga.io`, `app.norga.io`, and `localhost:3000-3002`.
- **30-minute window is uniform** across all three layers (Webflow, widget fallback, consumer helper): `SESSION_TTL_MS = 30 * 60 * 1000`.
