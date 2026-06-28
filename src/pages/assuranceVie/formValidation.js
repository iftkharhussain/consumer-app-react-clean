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
