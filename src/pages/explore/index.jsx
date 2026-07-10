import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/pageHeader';
import InsuranceCard from '../../components/insuranceCard';
import { Home05, UserCheck01, Car01, Heart, Building05, Shield01, ChevronDown, ChevronUp } from '../../utils/icons';
import { ExploreModal } from '../../components/courtikaModal';
import quoteService from '../../services/api/quoteService';
import styles from './Explore.module.css';

// Car & home are "Courtika" (damage-insurance broker) products; everything else is
// an advisor product. Mortgage renewal is a special broker card (Buy/Renew/Refinance).
const COURTIKA_SLUGS = ['car-insurance', 'home-insurance'];
// Which "Mes conseillers" cabinet each product's advisor belongs to — used to blink
// the relevant row when the user clicks "Speak with an advisor".
const ADVISOR_BUCKET = {
  'life-insurance': 'financial',
  'critical-illness': 'financial',
  'disability': 'financial',
  'mortgage-insurance': 'financial',
  'mortgage-renew': 'mortgage',
  // Car & home advisors sit in the "Cabinet en assurance de dommages" (Courtika) row.
  'car-insurance': 'insurance',
  'home-insurance': 'insurance',
};

const Explore = () => {
  const navigate = useNavigate();
  // State for collapsible categories
  const [expandedCategories, setExpandedCategories] = useState({
    'Conseiller en sécurité financière': true,
    'Cabinet en assurance de dommages': true,
    'Courtier hypothécaire': true
  });

  // State for the Courtika Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCourtikaModal, setIsCourtikaModal] = useState(true);

  // Product slugs the user already has a quote/lead for (drives the CTA per card).
  const [ownedSlugs, setOwnedSlugs] = useState(() => new Set());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await quoteService.getUserProducts();
        const slugs = (res?.products || []).map(p => p.productSlug).filter(Boolean);
        if (active) setOwnedSlugs(new Set(slugs));
      } catch (e) { /* no products -> everything shows "Get Quote" */ }
    })();
    return () => { active = false; };
  }, []);

  // The CTA for a card, based on whether the user already has that product:
  //  - car / home     : has quote -> "Speak with Courtika", else "Get Quote"
  //  - mortgage-renew : has quote -> "Speak with an advisor", else Buy / Renew / Refinance
  //  - everything else: has quote -> "Speak with an advisor", else "Get Quote"
  const ctaFor = (slug) => {
    const hasQuote = ownedSlugs.has(slug);
    // Once the user has the product, drop the "X min to complete" hint.
    if (slug === 'mortgage-renew') {
      return hasQuote
        ? { buttonText: 'Speak with an advisor', buttonType: 'secondary', additionalButtons: [], timeToComplete: undefined }
        : { buttonText: 'Buy', buttonType: 'primary', additionalButtons: ['Renew', 'Refinance'] };
    }
    if (!hasQuote) return { buttonText: 'Get Quote', buttonType: 'primary', additionalButtons: [] };
    return COURTIKA_SLUGS.includes(slug)
      ? { buttonText: 'Speak with Courtika', buttonType: 'secondary', additionalButtons: [], timeToComplete: undefined }
      : { buttonText: 'Speak with an advisor', buttonType: 'secondary', additionalButtons: [], timeToComplete: undefined };
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCardClick = (product, actionLabel) => {
    // The main button calls back with the click event; extra buttons pass their label.
    const label = typeof actionLabel === 'string' ? actionLabel : product.buttonText;

    if (label === 'Speak with Courtika' || label === 'Speak with an advisor') {
      // Go to "Mes conseillers" and blink the relevant cabinet's row (Courtika for
      // car/home; the financial/mortgage cabinet for the other products).
      navigate('/my-advisors', { state: { highlightBucket: ADVISOR_BUCKET[product.slug] } });
    } else if (label === 'Refinance') {
      setSelectedProduct('REFINANCEMENT HYPOTHÉCAIRE');
      setIsCourtikaModal(false);
      setIsModalOpen(true);
    } else if (product.slug) {
      // Get Quote / Buy / Renew -> open the internal quick-quote form for this product.
      navigate(`/explore/getquote/${product.slug}`);
    } else {
      console.log(`Navigating to funnel for: ${product.title}`);
    }
  };

  // Mock data for insurance cards organized by categories
  const insuranceCategories = {
    'Conseiller en sécurité financière': [
      {
        id: 1,
        icon: <Heart />,
        title: 'Life Insurance',
        slug: 'life-insurance',
        badgeText: 'Information Required',
        badgeType: 'yellow',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Get Quote',
        buttonType: 'primary',
        timeToComplete: '1 min to complete'
      },
      {
        id: 2,
        icon: <Shield01 />,
        title: 'Critical Illness Insurance',
        slug: 'critical-illness',
        badgeText: 'Ready for quote',
        badgeType: 'green',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Get Quote',
        buttonType: 'primary',
        timeToComplete: '2 min to complete'
      },
      {
        id: 3,
        icon: <UserCheck01 />,
        title: 'Disability Insurance',
        slug: 'disability',
        badgeText: 'Quote Received',
        badgeType: 'blue',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Get Quote',
        buttonType: 'primary',
        timeToComplete: '2 min to complete'
      },
      {
        id: 4,
        icon: <Building05 />,
        title: 'Mortgage Insurance',
        slug: 'mortgage-insurance',
        badgeText: 'Quote Received',
        badgeType: 'blue',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Get Quote',
        buttonType: 'primary',
        timeToComplete: '2 min to complete'
      }
    ],
    'Cabinet en assurance de dommages': [
      {
        id: 5,
        icon: <Home05 />,
        title: 'Home Insurance',
        slug: 'home-insurance',
        badgeText: 'Quote Received',
        badgeType: 'blue',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Speak with Courtika',
        buttonType: 'secondary'
      },
      {
        id: 6,
        icon: <Car01 />,
        title: 'Car Insurance',
        slug: 'car-insurance',
        badgeText: 'Quote Received',
        badgeType: 'blue',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Speak with Courtika',
        buttonType: 'secondary'
      }
    ],
    'Courtier hypothécaire': [
      {
        id: 7,
        icon: <Building05 />,
        title: 'Mortgage Renewal',
        slug: 'mortgage-renew',
        badgeText: 'Information Required',
        badgeType: 'yellow',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Buy',
        buttonType: 'primary',
        additionalButtons: ['Renew', 'Refinance']
      }
    ]
  };

  return (
    <div>
      <PageHeader 
        title="Explore"
        subtitle="What kind of insurance quote are you looking for?"
        className={styles.pageHeader}
      />
      
      <div className={styles.content}>

        {/* Render categories with collapsible sections */}
        {Object.entries(insuranceCategories).map(([categoryName, products]) => (
          <div key={categoryName} className={styles.categorySection}>
            <div 
              className={styles.categoryHeader}
              onClick={() => toggleCategory(categoryName)}
            >
              <h3 className={styles.categoryTitle}>{categoryName}</h3>
              <button className={styles.collapseButton} aria-label="Toggle category">
                {expandedCategories[categoryName] ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>

            {expandedCategories[categoryName] && (
              <div className={styles.cardsGrid}>
                {products.map((option) => {
                  // Override the static buttonText/buttonType/additionalButtons with the
                  // quote-status CTA, and hand the merged card to the click handler.
                  const card = { ...option, ...ctaFor(option.slug) };
                  return (
                    <InsuranceCard
                      key={option.id}
                      {...card}
                      onButtonClick={(actionLabel) => handleCardClick(card, actionLabel)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <ExploreModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStart={() => navigate('/explore-form', { state: { product: selectedProduct } })}
        productName={selectedProduct ? selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1).toLowerCase() : ''}
        isCourtika={isCourtikaModal}
      />
    </div>
  );
};

export default Explore;
