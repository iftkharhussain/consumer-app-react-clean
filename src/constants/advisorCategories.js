/**
 * Central Master Mapping for Advisor Categories & Assigned Products
 * EXACT match with `src/pages/explore/index.jsx` `insuranceCategories`.
 */

export const ADVISOR_CATEGORY_PRODUCTS = {
  // 1. Conseiller en sécurité financière (4 Products from Explore Page)
  'Conseiller en sécurité financière': [
    {
      key: 'life-insurance',
      title: 'Assurance vie',
      englishTitle: 'Life Insurance',
      subtitle: 'Protection pour vos proches',
      icon: '/images/NORGA-Assurance-Vie.svg',
      path: '/life-insurance'
    },
    {
      key: 'critical-illness',
      title: 'Assurance maladie grave',
      englishTitle: 'Critical Illness Insurance',
      subtitle: 'Pour les maladies sérieuses',
      icon: '/images/NORGA-Assurance-Maladie-Grave.svg',
      path: '/critical-illness'
    },
    {
      key: 'disability-insurance',
      title: 'Assurance salaire',
      englishTitle: 'Disability Insurance',
      subtitle: 'Maintien de votre revenu',
      icon: '/images/Assurance-Salaire.svg',
      path: '/disability'
    },
    {
      key: 'mortgage-insurance',
      title: 'Assurance hypothécaire',
      englishTitle: 'Mortgage Insurance',
      subtitle: 'Protégez votre hypothèque',
      icon: '/images/NORGA-Assurance-Hypothécaire.svg',
      path: '/mortgage-insurance'
    }
  ],

  // 2. Cabinet en assurance de dommages (2 Products from Explore Page)
  'Cabinet en assurance de dommages': [
    {
      key: 'habitation',
      title: 'Assurance habitation',
      englishTitle: 'Home Insurance',
      subtitle: 'Protégez votre propriété',
      icon: '/images/Assurance-Habitation.svg',
      path: '/explore'
    },
    {
      key: 'auto',
      title: 'Assurance auto',
      englishTitle: 'Car Insurance',
      subtitle: 'Protégez votre véhicule',
      icon: '/images/Assurance-Auto_new.svg',
      path: '/result'
    }
  ],

  // 3. Courtier hypothécaire (1 Product from Explore Page)
  'Courtier hypothécaire': [
    {
      key: 'mortgage-renewal',
      title: 'Prêt hypothécaire',
      englishTitle: 'Mortgage Renewal',
      subtitle: 'Obtenez le meilleur taux',
      icon: '/images/Prêt-Hypothécaire.svg',
      path: '/mortgage'
    }
  ]
};

/**
 * Helper to dynamically resolve products by Advisor Type or Category Key
 */
export const getProductsForAdvisorType = (advisorType = '') => {
  if (!advisorType) return [];
  const typeLower = advisorType.toLowerCase();

  if (typeLower.includes('financ') || typeLower.includes('sécurité') || typeLower.includes('life')) {
    return ADVISOR_CATEGORY_PRODUCTS['Conseiller en sécurité financière'];
  }
  if (typeLower.includes('dommage') || typeLower.includes('auto') || typeLower.includes('habitation') || typeLower.includes('courtika')) {
    return ADVISOR_CATEGORY_PRODUCTS['Cabinet en assurance de dommages'];
  }
  if (typeLower.includes('hypoth') || typeLower.includes('mortgage')) {
    return ADVISOR_CATEGORY_PRODUCTS['Courtier hypothécaire'];
  }

  return ADVISOR_CATEGORY_PRODUCTS['Cabinet en assurance de dommages'];
};
