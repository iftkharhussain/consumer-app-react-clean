import React from 'react';
import PageHeader from '../../components/pageHeader';
import InsuranceCard from '../../components/insuranceCard';
import { Home05, UserCheck01, Car01, Heart, Building05, Shield01 } from '../../utils/icons';
import styles from './Explore.module.css';

const Explore = () => {
  // Mock data for insurance cards
  const insuranceOptions = [
    {
      id: 1,
      icon: <Home05 />,
      title: 'Home Insurance',
      badgeText: 'Quote Received',
      badgeType: 'blue',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Speak with an advisor',
      buttonType: 'secondary'
    },
    {
      id: 2,
      icon: <UserCheck01 />,
      title: 'Disability Insurance',
      badgeText: 'Quote Received',
      badgeType: 'blue',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Speak with an advisor',
      buttonType: 'secondary'
    },
    {
      id: 3,
      icon: <Building05 />,
      title: 'Mortgage Insurance',
      badgeText: 'Quote Received',
      badgeType: 'blue',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Speak with an advisor',
      buttonType: 'secondary'
    },
    {
      id: 4,
      icon: <Car01 />,
      title: 'Car Insurance',
      badgeText: 'Quote Request Sent',
      badgeType: 'yellow',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Speak with an advisor',
      buttonType: 'secondary'
    },
    {
      id: 5,
      icon: <Shield01 />,
      title: 'Critical Illness Insurance',
      badgeText: 'Ready for quote',
      badgeType: 'green',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Get Quote',
      buttonType: 'primary'
    },
    {
      id: 6,
      icon: <Heart />,
      title: 'Life Insurance',
      badgeText: 'Information Required',
      badgeType: 'yellow',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Get Quote',
      buttonType: 'primary'
    },
    {
      id: 7,
      icon: <Home05 />,
      title: 'Mortgage Renewal',
      badgeText: 'Information Required',
      badgeType: 'yellow',
      description: 'Brief Description on Life Insurance',
      buttonText: 'Buy',
      buttonType: 'primary',
      additionalButtons: ['Renew', 'Refinance']
    }
  ];

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

        <div className={styles.cardsGrid}>
          {insuranceOptions.map((option) => (
            <InsuranceCard key={option.id} {...option} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
