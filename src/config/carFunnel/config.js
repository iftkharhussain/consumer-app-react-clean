/* eslint-disable */
/**
 * Central config for the car funnel — replaces the source app's Vite
 * `import.meta.env` / `window.*` globals.
 *
 * UI/UX phase: USE_MOCK_DATA is true, so all data (vehicle lookups, OTP,
 * submit) is served from hardcoded stubs. Flip it to false once the real
 * backend is wired, and fill in the API URLs below (or via env).
 */

export const USE_MOCK_DATA = true;

// API endpoints — only used when USE_MOCK_DATA is false.
export const API_URL = process.env.REACT_APP_CAR_API_URL || 'http://localhost:3025/api';
export const FORM_SUBMISSION_API = process.env.REACT_APP_CAR_SUBMIT_URL || '';
export const ASSET_BASE_URL = '';

// Phone-verification test mode (UI/UX: OTP is stubbed to always succeed).
export const PHONE_VERIFICATION_TEST_MODE = true;
export const TEST_OTP_CODE = '1234';
export const TEST_PHONE_NUMBERS = [];
export const USE_NEW_RENDERER = true;
