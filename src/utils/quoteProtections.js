/**
 * Shared helpers to turn raw quote coverages into the display "protections"
 * list shown on the confirmation pages (and now reused for the confirmation
 * emails). Extracted so the same logic feeds both the UI and the email payload.
 */

// Format currency in French format (10 000$ instead of $10,000)
export const formatFrenchCurrency = (value) => {
  if (!value) return null;
  const numStr = String(value).replace(/[$,\s]/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num)) return value;
  const formatted = num.toLocaleString('fr-CA', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace(/,/g, ' ');
  return `${formatted}$`;
};

// Extract limit value from string like "$2,000,000/-$1"
const extractLimitValue = (limit) => {
  if (!limit) return null;
  const parts = limit.split('/-');
  return parts[0].trim();
};

// Coverage code mapping to French names
const COVERAGE_INFO = {
  TP: 'Responsabilité civile',
  TPL: 'Responsabilité civile',
  COL: 'Collision et renversement (B2)',
  COLL: 'Collision et renversement (B2)',
  CMP: 'Accidents sans collision ni renversement (B3)',
  COMP: 'Accidents sans collision ni renversement (B3)',
  34: 'Assurance de personnes (FAQ 34)',
  33: 'Assistance routière (FAQ 33)',
  20: 'Assistance routière (FAQ 20)',
  27: 'Assurance des personnes (FAQ 27)',
  AB: "Indemnités d'accident",
  DCPD: 'Indemnisation directe',
  UA: 'Automobile non assurée',
  SEF44: 'Protection de la famille',
};

/**
 * Build the deduplicated, sorted list of protections from raw coverages.
 * @param {Array} coverages
 * @returns {Array<{ title, type, coverageValue, code, isPak }>}
 */
export const buildProtections = (coverages = []) => {
  const protections = coverages.map((coverage) => {
    // Handle both formats: order API uses 'id', quote API uses 'code'
    const code = String(coverage.id || coverage.code || '').toUpperCase();
    let title = code;
    let type = null;
    let coverageValue = null;

    // Check for PAK codes (pak12, pak7, etc.)
    const isPakCode = code.includes('PAK') || /PAK\d+/i.test(code);

    if (isPakCode) {
      title = 'Protections bonifiées';
      type = null;
      coverageValue = null;
    } else if (COVERAGE_INFO[code]) {
      title = COVERAGE_INFO[code];
    }

    // Extract limit value — handle both formats:
    // Order API: limit1 = 2000000 (numeric); Quote API: limit = "$2,000,000/-$1" (string)
    const getLimitValue = () => {
      if (coverage.limit1 && coverage.limit1 > 1) {
        return formatFrenchCurrency(coverage.limit1);
      }
      if (coverage.limit && coverage.limit !== '-$1/-$1') {
        const rawValue = extractLimitValue(coverage.limit);
        return formatFrenchCurrency(rawValue);
      }
      return null;
    };

    // Determine coverage value and type
    if (!isPakCode) {
      if (code === 'TP' || code === 'TPL') {
        type = 'couverture';
        coverageValue = getLimitValue();
      } else if (['CMP', 'COMP', 'COL', 'COLL'].includes(code)) {
        if (coverage.deductible && coverage.deductible !== -1) {
          type = 'franchise';
          coverageValue = formatFrenchCurrency(coverage.deductible);
        }
      } else if (['34', '33', '20', '27'].includes(code)) {
        type = 'couverture';
        coverageValue = getLimitValue();
      } else {
        // Default: try limit first, then deductible
        const limitVal = getLimitValue();
        if (limitVal) {
          type = 'couverture';
          coverageValue = limitVal;
        } else if (coverage.deductible && coverage.deductible !== -1) {
          type = 'franchise';
          coverageValue = formatFrenchCurrency(coverage.deductible);
        }
      }
    }

    return { title, type, coverageValue, code, isPak: isPakCode };
  }).filter((p) => p.coverageValue || p.isPak);

  // Deduplicate (same coverages repeat across multiple vehicles)
  const uniqueProtections = [];
  const seen = new Set();
  protections.forEach((protection) => {
    const key = `${protection.code}-${protection.coverageValue || 'none'}-${protection.type || 'none'}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueProtections.push(protection);
    }
  });

  // Sort: TP, COL, CMP, other coverages, PAK at the end
  const sortOrder = ['TP', 'TPL', 'COL', 'COLL', 'CMP', 'COMP'];
  return uniqueProtections.sort((a, b) => {
    if (a.isPak && !b.isPak) return 1;
    if (!a.isPak && b.isPak) return -1;
    const aIndex = sortOrder.indexOf(a.code);
    const bIndex = sortOrder.indexOf(b.code);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });
};

export default buildProtections;
