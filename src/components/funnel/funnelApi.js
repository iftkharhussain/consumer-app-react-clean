/**
 * Shared funnel backend wiring — real OTP + lead-submit calls, opt-in per form.
 *
 * Only forms that set `contact.api = true` use these (the insurance funnels).
 * The UI-only mortgage funnels never import/trigger them.
 *
 * Endpoints (mirror the proven consumer-app-questions contract):
 *   - Phone OTP send:   POST  {addPhoneOTPUrl}      (form-encoded)
 *   - Phone OTP verify: GET   {verifyPhoneOTPUrl}?otp=&phoneNumber=
 *   - Lead submit:      POST  {FUNNEL_SUBMIT_URL}   -> { redirect: { url } }
 */

import { addPhoneOTPUrl, verifyPhoneOTPUrl, baseUrl } from '../../apis/sharedApi';

// Funnel submit endpoint. Overridable via the window global (as consumer-app-
// questions uses) or an env var; otherwise the LMS funnels/submit on baseUrl.
export const FUNNEL_SUBMIT_URL =
  (typeof window !== 'undefined' && window.FORM_SUBMISSION_API) ||
  process.env.REACT_APP_FUNNEL_SUBMIT_URL ||
  `${baseUrl}/api/v1/funnels/submit`;

export async function apiSendOtp(phoneNumber) {
  const body = new URLSearchParams();
  body.append('phoneNumber', phoneNumber);
  body.append('channel', 'sms');
  body.append('locale', 'fr');
  const res = await fetch(addPhoneOTPUrl, { method: 'POST', body });
  return res.json().catch(() => ({ success: false }));
}

export async function apiVerifyOtp(code, phoneNumber) {
  const qs = new URLSearchParams({ otp: code, phoneNumber, channel: 'sms', locale: 'fr' });
  const res = await fetch(`${verifyPhoneOTPUrl}?${qs.toString()}`, { method: 'GET' });
  return res.json().catch(() => ({ success: false }));
}

export async function apiSubmitLead(payload) {
  const res = await fetch(FUNNEL_SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.redirect?.url) data.redirectUrl = data.redirect.url;
  if (!res.ok) throw new Error(data?.message || 'submit_failed');
  return data;
}
