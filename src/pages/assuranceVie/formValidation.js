/**
 * Shared field validation + input sanitizers for the funnel funnel pages
 * (assurance vie / maladie grave / salaire). Keep one source of truth so all
 * forms enforce the same rules.
 */

// Keep only letters (any alphabet), spaces, hyphen and apostrophe — strip the
// rest as the user types (so a "name" field can never contain digits/symbols).
export const sanitizeName = (s) => (s || '').replace(/[^\p{L}\s'’-]/gu, '');

// Keep only digits.
export const sanitizeDigits = (s) => (s || '').replace(/\D/g, '');

// Progressive Canadian phone mask: formats keystrokes into "(514) 123-4567".
// Drops a leading country code "1" so "1XXXXXXXXXX" / "+1 …" paste cleanly, and
// caps at 10 digits. Strips all non-digits first, so backspacing always removes
// a real digit. normalizePhone() re-derives E.164 from this, so the masked value
// is safe to keep in state and send.
export const formatCAPhone = (s) => {
  let d = (s || '').replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

// A real name: starts with a letter, only letters/space/hyphen/apostrophe, and
// at least 3 characters — 1–2 characters are not a real name.
export const isValidName = (s) => {
  const v = (s || '').trim();
  return v.length >= 3 && /^[\p{L}][\p{L}\s'’-]*$/u.test(v);
};

// Standard "something@something.tld" check.
export const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());

// A valid amount is a positive whole number of dollars.
export const isValidAmount = (s) => {
  const v = sanitizeDigits(String(s ?? ''));
  return v.length > 0 && Number(v) > 0;
};
