/**
 * Shared product list for the "Other products" cross-sell banner.
 *
 * Used by both `components/otherProducts` and `pages/thankyouAdvisor` so the list
 * (and the already-quoted filtering) lives in one place.
 *
 * Each entry carries matchers used to detect whether the user has already quoted
 * the product (see `matchesBannerProduct`):
 * - `slugs`: clean product slugs the backend MIGHT send (e.g. 'car-insurance').
 * - `keywords`: words that appear in the French product title; matched against the
 *   returned `productName`. This is the reliable path, because the backend slug is
 *   generated from the French title and is unreliable for several products
 *   (accents collapse to dashes — see the LMS slug generation).
 */

export const OTHER_PRODUCTS = [
  {
    key: 'mortgage',
    title: 'Assurance hypothécaire',
    desc: 'Protégez votre hypothèque.',
    icon: '/images/NORGA-Assurance-Hypothécaire.svg',
    recommended: true,
    slugs: ['mortgage-insurance'],
    keywords: ['assurance', 'hypoth']
  },
  {
    key: 'life',
    title: 'Assurance vie',
    desc: 'Protégez vos proches.',
    icon: '/images/NORGA-Assurance-Vie.svg',
    slugs: ['life-insurance'],
    keywords: ['vie']
  },
  {
    key: 'disability',
    title: 'Assurance salaire',
    desc: 'Protégez votre revenu.',
    icon: '/images/Assurance-Salaire.svg',
    slugs: ['disability-insurance'],
    keywords: ['salaire']
  },
  {
    key: 'auto',
    title: 'Assurance auto',
    desc: 'Comparez et économisez.',
    icon: '/images/Assurance-Auto_new.svg',
    slugs: ['car-insurance', 'auto-insurance'],
    keywords: ['auto']
  },
  {
    key: 'critical',
    title: 'Assurance maladies graves',
    desc: "Faites face à l'imprévu.",
    icon: '/images/NORGA-Assurance-Maladie-Grave.svg',
    slugs: ['critical-illness'],
    keywords: ['maladies']
  },
  {
    key: 'mortgageBroker',
    title: 'Prêt hypothécaire',
    desc: 'Obtenez le meilleur taux.',
    icon: '/images/Prêt-Hypothécaire.svg',
    slugs: ['mortgage-broker', 'mortgage-loan'],
    keywords: ['pret', 'hypoth']
  }
];

/**
 * Lowercase + strip accents/diacritics for accent-insensitive matching
 * (e.g. "Assurance hypothécaire" -> "assurance hypothecaire").
 */
export const normalizeText = (str = '') =>
  str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/**
 * Does a quoted user-product record correspond to this banner product?
 * Matches on a clean productSlug OR on every keyword appearing in the
 * (normalized) productName. The name path is what makes this robust to the
 * backend's generated-from-title slugs.
 *
 * @param {Object} bannerProduct - An entry from OTHER_PRODUCTS.
 * @param {Object} record - A user product record ({ productSlug, productName }).
 */
export const matchesBannerProduct = (bannerProduct, record) => {
  const slug = normalizeText(record.productSlug);
  const name = normalizeText(record.productName);

  const slugMatch = (bannerProduct.slugs || []).some((s) => normalizeText(s) === slug);
  const keywords = bannerProduct.keywords || [];
  const nameMatch = keywords.length > 0 && keywords.every((k) => name.includes(normalizeText(k)));

  return slugMatch || nameMatch;
};

/**
 * Has the user already quoted the banner product identified by `key`?
 * Looks the product up in OTHER_PRODUCTS by key, then matches it against the
 * user's quoted records. Lets callers filter by key without importing the
 * matcher + product list separately.
 *
 * @param {string} key - A banner product key (e.g. 'disability').
 * @param {Array} quotedRecords - User product records with a completed quote.
 */
export const isBannerKeyQuoted = (key, quotedRecords = []) => {
  const product = OTHER_PRODUCTS.find((p) => p.key === key);
  if (!product) return false;
  return quotedRecords.some((record) => matchesBannerProduct(product, record));
};
