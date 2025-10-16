import React, { useState } from 'react';
import PageHeader from '../../components/pageHeader';
import InsuranceCard from '../../components/insuranceCard';
import { Home05, UserCheck01, Car01, Heart, Building05, Shield01, ChevronDown, ChevronUp } from '../../utils/icons';
import styles from './Explore.module.css';

const Explore = () => {
  // State for collapsible categories
  const [expandedCategories, setExpandedCategories] = useState({
    'People Insurance': true,
    'P & C Insurance': true,
    'Mortgage': true
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Mock data for insurance cards organized by categories
  const insuranceCategories = {
    'People Insurance': [
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
    'P & C Insurance': [
      {
        id: 5,
        icon: <Home05 />,
        title: 'Home Insurance',
        badgeText: 'Quote Received',
        badgeType: 'blue',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Speak with Marcus',
        buttonType: 'secondary'
      },
      {
        id: 6,
        icon: <Car01 />,
        title: 'Car Insurance',
        badgeText: 'Quote Received',
        badgeType: 'blue',
        description: 'Brief Description on Life Insurance',
        buttonText: 'Speak with Marcus',
        buttonType: 'secondary'
      }
    ],
    'Mortgage': [
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
        subtitle="blah blah"
        className={styles.pageHeader}
      />
      
      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>What kind of insurance quote do you want?</h2>
          <p className={styles.sectionSubtitle}>
            You may need to input additional information on the intake to receive a quote.
          </p>
        </div>

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
                  <InsuranceCard key={option.id} {...option} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
