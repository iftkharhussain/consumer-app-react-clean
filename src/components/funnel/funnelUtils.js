/**
 * Shared funnel UI helpers — pure formatting only, NO network / API calls.
 * (Backend wiring for OTP + lead submit is intentionally not included yet;
 * these funnel forms are UI/UX-only for now.)
 */

// Twilio Verify codes are 6 digits — drives the OTP input count visually.
export const OTP_LENGTH = 6;

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
