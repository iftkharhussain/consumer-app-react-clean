import React from 'react';
import PageHeader from '../../components/pageHeader';
import ProgressSteps from '../../components/progressSteps';
import styles from './BoostSavings.module.css';

const BoostSavings = () => {
  const progressSteps = [
    {
      id: 1,
      level: 'Level 1',
      description: 'Complete People Insurance Quote',
      completed: true
    },
    {
      id: 2,
      level: 'Level 2',
      description: 'Complete P&C Insurance Quote',
      completed: true
    },
    {
      id: 3,
      level: 'Level 3',
      description: 'Complete Mortgage Quote',
      completed: false
    },
    {
      id: 4,
      level: 'Reward',
      description: 'Claim your Reward',
      completed: false
    }
  ];

  const categories = [
    {
      id: 1,
      title: 'Personal Insurance',
      status: 'completed',
      statusText: 'You have successfully requested for a quote!',
      products: 'Products: Life Insurance, Critical Illness Insurance, Disability Insurance and Mortgage Insurance',
      buttonText: 'Request Completed!',
      buttonDisabled: true
    },
    {
      id: 2,
      title: 'P&C Insurance',
      status: 'completed',
      statusText: 'You have successfully requested for a quote!',
      products: 'Products: Home and Auto Insurance',
      buttonText: 'Request Completed!',
      buttonDisabled: true
    },
    {
      id: 3,
      title: 'Mortgage',
      status: 'pending',
      statusText: 'Not started yet. Request a Mortgage quote to finish your intake and unlock your final reward.',
      products: 'Products: Mortgage Renewal and Refinancing',
      buttonText: 'Request for a quote',
      buttonDisabled: false
    },
    {
      id: 4,
      title: 'Claim your Reward',
      status: 'locked',
      statusText: "You're just one step away. Complete your intake to level up and claim your reward.",
      products: 'Complete the Mortgage Category to unlock!',
      buttonText: 'Claim Reward',
      buttonDisabled: true,
      showRewardImages: true
    }
  ];

  // Calculate progress percentage based on completed steps
  // With 4 steps total, each segment represents 33.33% of the bar
  // 2 completed means the bar should fill from start to the 2nd node (33.33%)
  const completedCount = progressSteps.filter(step => step.completed).length;
  
  // Ant Design Steps uses current index (0-based), so if 2 are completed, current should be 1 (second item)
  const currentStep = completedCount > 0 ? completedCount - 1 : 0;

  // Prepare steps for ProgressSteps component
  const formattedSteps = progressSteps.map((step) => ({
    title: step.level,
    description: step.description,
    status: step.completed ? 'finish' : 'wait'
  }));

  return (
    <div className={styles.boostSavingsPage}>
      {/* Alert Banner */}
      <div className={styles.alertBanner}>
        <div className={styles.alertIcon}>
          <img src="/images/check-circle.svg" alt="Alert" />
        </div>
        <div className={styles.alertContent}>
          <div className={styles.alertTitle}>You are almost there!</div>
          <div className={styles.alertDescription}>
            Complete a Mortgage request and get a $50 Amazon gift card!
          </div>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader 
        title="Boost Your Savings"
        subtitle="Complete a quote in these categories to earn points, unlock rewards, and maximize your insurance coverage."
        className={styles.pageHeader}
      />

      {/* Progress Bar */}
      {/* <ProgressSteps steps={formattedSteps} current={currentStep} /> */}

      {/* Category Cards */}
      <div className={styles.categoriesContainer}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              {category.status === 'completed' && (
                <div className={styles.completedIcon}>
                  <img src="/images/check-ok.svg" alt="Completed" />
                </div>
              )}
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>{category.title}</h3>
                <p className={styles.categoryStatus}>{category.statusText}</p>
                <p className={styles.categoryProducts}>{category.products}</p>
                {category.showRewardImages && (
                  <div className={styles.rewardImages}>
                    <img src="/images/award1.png" alt="Amazon" className={styles.rewardImage} />
                    <img src="/images/award2.png" alt="Tim Hortons" className={styles.rewardImage} />
                    <img src="/images/award3.png" alt="Subway" className={styles.rewardImage} />
                    <img src="/images/award4.png" alt="Starbucks" className={styles.rewardImage} />
                  </div>
                )}
              </div>
            </div>
            <button 
              className={`${styles.categoryButton} ${category.buttonDisabled ? styles.disabled : ''}`}
              disabled={category.buttonDisabled}
            >
              {category.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoostSavings;
