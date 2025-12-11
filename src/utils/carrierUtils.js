/**
 * Carrier Utilities
 * Maps carrier codes from Fortus API to logos and display names
 */

// Carrier code to display name mapping
export const CARRIER_NAMES = {
    // Intact Insurance
    'GC': 'Intact Insurance',
    'HAL': 'Intact Insurance (Halifax)',
    'GRP': 'Intact Insurance (Group)',
    // Optimum/Desjardins
    'NATS': 'Optimum Insurance',
    'NATF': 'Optimum Insurance',
    'BCIC': 'Optimum Insurance',
    // L'Unique
    'UNI': "L'Unique Assurances",
    // Wawanesa
    'WAWA': 'Wawanesa Insurance',
    // Economical
    'ECON': 'Economical Insurance',
    // Pafco
    'PAFM': 'Pafco Insurance',
    // Beneva
    'BENE': 'Beneva',
    // Promutuel
    'PROM': 'Promutuel Assurance',
    // CAA
    'CAA': 'CAA Insurance',
    // Aviva
    'AVIVA': 'Aviva Canada',
    // RSA
    'RSA': 'RSA Insurance',
};

// Carrier code to logo path mapping
export const CARRIER_LOGOS = {
    // Intact Insurance codes
    'GC': '/images/intact-insurance.svg',
    'HAL': '/images/intact-insurance.svg',
    'GRP': '/images/intact-insurance.svg',
    // Optimum/Desjardins codes (using default logo)
    'NATS': '/images/insurance-default.svg',
    'NATF': '/images/insurance-default.svg',
    'BCIC': '/images/insurance-default.svg',
    // L'Unique code
    'UNI': '/images/lunique.svg',
    // Wawanesa code
    'WAWA': '/images/wawanesa.svg',
    // Economical code
    'ECON': '/images/economical.svg',
    // Pafco code
    'PAFM': '/images/pafco.svg',
    // Beneva code
    'BENE': '/images/Beneva_rgb.svg',
    // Promutuel code
    'PROM': '/images/promutuel.svg',
    // CAA code
    'CAA': '/images/CAA_logo.svg',
};

// Carrier groups (codes that belong to the same carrier)
export const CARRIER_GROUPS = {
    'Intact': ['GC', 'HAL', 'GRP'],
    'Optimum': ['NATS', 'NATF', 'BCIC'],
    "L'Unique": ['UNI'],
    'Wawanesa': ['WAWA'],
    'Economical': ['ECON'],
    'Pafco': ['PAFM'],
    'Beneva': ['BENE'],
    'Promutuel': ['PROM'],
    'CAA': ['CAA'],
};

/**
 * Get carrier logo path from carrier code or name
 * @param {string} carrierCodeOrName - The carrier code (e.g., 'GC') or name (e.g., 'Intact')
 * @returns {string} - Path to the carrier logo
 */
export const getCarrierLogo = (carrierCodeOrName) => {
    if (!carrierCodeOrName) return '/images/insurance-default.svg';
    
    const normalizedValue = carrierCodeOrName.toUpperCase().trim();
    
    // Check if it's a carrier code first (exact match)
    if (CARRIER_LOGOS[normalizedValue]) {
        return CARRIER_LOGOS[normalizedValue];
    }
    
    // Check by carrier name (partial match)
    const nameToLogoMap = {
        'intact': '/images/intact-insurance.svg',
        'beneva': '/images/Beneva_rgb.svg',
        'promutuel': '/images/promutuel.svg',
        'economical': '/images/economical.svg',
        'caa': '/images/CAA_logo.svg',
        'aviva': '/images/aviva.svg',
        'wawanesa': '/images/wawanesa.svg',
        'rsa': '/images/rsa.svg',
        "l'unique": '/images/lunique.svg',
        'lunique': '/images/lunique.svg',
        'unique': '/images/lunique.svg',
        'desjardins': '/images/desjardins.svg',
        'optimum': '/images/optimum.svg',
        'pafco': '/images/pafco.svg',
    };
    
    const lowerValue = carrierCodeOrName.toLowerCase().trim();
    
    for (const [key, logo] of Object.entries(nameToLogoMap)) {
        if (lowerValue.includes(key)) {
            return logo;
        }
    }
    
    return '/images/insurance-default.svg';
};

/**
 * Get carrier display name from carrier code
 * @param {string} carrierCode - The carrier code (e.g., 'GC')
 * @returns {string} - Display name for the carrier
 */
export const getCarrierName = (carrierCode) => {
    if (!carrierCode) return 'Insurance Provider';
    
    const normalizedCode = carrierCode.toUpperCase().trim();
    return CARRIER_NAMES[normalizedCode] || carrierCode;
};

/**
 * Check if a carrier code belongs to Intact Insurance
 * @param {string} carrierCode - The carrier code
 * @returns {boolean}
 */
export const isIntactCarrier = (carrierCode) => {
    if (!carrierCode) return false;
    return CARRIER_GROUPS['Intact'].includes(carrierCode.toUpperCase().trim());
};

/**
 * Get all codes for a carrier group
 * @param {string} carrierGroupName - The carrier group name (e.g., 'Intact')
 * @returns {string[]} - Array of carrier codes
 */
export const getCarrierGroupCodes = (carrierGroupName) => {
    return CARRIER_GROUPS[carrierGroupName] || [];
};

export default {
    CARRIER_NAMES,
    CARRIER_LOGOS,
    CARRIER_GROUPS,
    getCarrierLogo,
    getCarrierName,
    isIntactCarrier,
    getCarrierGroupCodes,
};
