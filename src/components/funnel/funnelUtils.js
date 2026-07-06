/**
 * Shared funnel helpers — formatting plus the real OTP + lead-submit calls used
 * by funnels that opt into backend wiring (via config.submit). Funnels without
 * config.submit stay UI-only.
 */

import { addPhoneOTPUrl, verifyPhoneOTPUrl } from '../../apis/sharedApi';

// Twilio Verify codes are 6 digits — drives the OTP input count visually.
export const OTP_LENGTH = 6;

// ── Backend calls (mirror the bespoke funnels, e.g. assuranceVie) ──────────────

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

// POST the lead to the product's custom-form endpoint. Surfaces the LMS redirect
// (consumer /auth/lead-login?token=…) as data.redirectUrl.
export async function submitFunnelLead(postUrl, payload) {
  const res = await fetch(postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.redirect?.url) data.redirectUrl = data.redirect.url;
  if (!res.ok) throw new Error(data?.message || 'submit_failed');
  return data;
}

// Normalize a user-entered phone to E.164 (+1XXXXXXXXXX) for display/validation.
export function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (raw && raw.trim().startsWith('+')) return `+${digits}`;
  return digits ? `+1${digits}` : '';
}

export function prettyPhone(raw) {
  const digits = (raw || '').replace(/\D/g, '').slice(-10);
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw || '';
}
