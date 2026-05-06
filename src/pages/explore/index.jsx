import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/pageHeader';
import InsuranceCard from '../../components/insuranceCard';
import { Home05, UserCheck01, Car01, Heart, Building05, Shield01, ChevronDown, ChevronUp } from '../../utils/icons';
import { ExploreModal } from '../../components/courtikaModal';
import styles from './Explore.module.css';

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

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCardClick = (product, actionLabel) => {
    const isCourtikaAction = product.buttonText === 'Speak with Courtika';
    const isRefinanceAction = actionLabel === 'Refinance';

    if (isCourtikaAction || isRefinanceAction) {
      // If it's a refinance action, we might want to use "REFINANCE" as the product title in the modal
      setSelectedProduct(isRefinanceAction ? 'REFINANCEMENT HYPOTHÉCAIRE' : product.title);
      setIsCourtikaModal(isCourtikaAction);
      setIsModalOpen(true);
    } else {
      console.log(`Navigating to funnel for: ${product.title}`);
      // Standard funnel navigation would go here
    }
  };

  // Mock data for insurance cards organized by categories
  const insuranceCategories = {
    'Conseiller en sécurité financière': [
      {
        id: 1,
        icon: <Heart />,
        title: 'Life Insurance',
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
                {products.map((option) => (
                  <InsuranceCard 
                    key={option.id} 
                    {...option} 
                    onButtonClick={(actionLabel) => handleCardClick(option, actionLabel)}
                  />
                ))}
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
