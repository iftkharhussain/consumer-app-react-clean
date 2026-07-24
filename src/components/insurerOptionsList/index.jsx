import React from 'react';
import styles from './InsurerOptionsList.module.css';

const InsurerOptionsList = ({
  userName = 'Nicolas',
  totalCount = 23,
  onBuyOption = (insurer) => console.log('Buy clicked for', insurer),
  onPlanCall = () => console.log('Plan call clicked')
}) => {
  const visibleInsurers = [
    {
      id: 1,
      name: 'IA Groupe financier',
      logo: '/images/logo-assurance-de-personne/ia.png',
      price: '90',
      period: '/ mois'
    },
    {
      id: 2,
      name: 'Desjardins',
      logo: '/images/logo-assurance-de-personne/desjardins.png',
      price: '93',
      period: '/ mois'
    },
    {
      id: 3,
      name: 'Empire Vie',
      logo: '/images/logo-assurance-de-personne/empire-vie.png',
      price: '88',
      period: '/ mois'
    },
    {
      id: 4,
      name: 'Humania',
      logo: '/images/logo-assurance-de-personne/humania.png',
      price: '85',
      period: '/ mois'
    },
    {
      id: 5,
      name: 'Ivari',
      logo: '/images/logo-assurance-de-personne/ivari.png',
      price: '92',
      period: '/ mois'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Insurer Section Title */}
      <div className={styles.headerSection}>
        <h2 className={styles.title}>
          {userName}, nous avons trouvé <span className={styles.highlightText}>{totalCount} options d'assureurs</span> pour toi!
        </h2>
      </div>

      {/* Visible Insurer Cards */}
      <div className={styles.insurerList}>
        {visibleInsurers.map((insurer) => (
          <div key={insurer.id} className={styles.insurerCard}>
            <div className={styles.insurerCardContent}>
              <div className={styles.insurerLeftInfo}>
                <div className={styles.logoContainer}>
                  <img src={insurer.logo} alt={insurer.name} className={styles.insurerLogo} />
                </div>
                <div className={styles.insurerMeta}>
                  <h4 className={styles.insurerName}>{insurer.name}</h4>
                  <div className={styles.insurerPriceRow}>
                    <span className={styles.priceAmount}>{insurer.price}$</span>
                    <span className={styles.priceUnit}>{insurer.period}</span>
                  </div>
                </div>
              </div>

              <button type="button" className={styles.buyBtn} onClick={() => onBuyOption(insurer)}>
                Acheter
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Blurred Locked Cards with Call-To-Action Overlay */}
      <div className={styles.blurSection}>
        {/* Placeholder 1 */}
        <div className={styles.blurredCard}>
          <div className={styles.insurerCardContent}>
            <div className={styles.insurerLeftInfo}>
              <div className={styles.logoContainer}>
                <img src="/images/logo-assurance-de-personne/beneva.png" alt="Beneva" className={styles.insurerLogo} />
              </div>
              <div className={styles.insurerMeta}>
                <h4 className={styles.insurerName}>Beneva</h4>
                <div className={styles.insurerPriceRow}>
                  <span className={styles.priceAmount}>87$</span>
                  <span className={styles.priceUnit}>/ mois</span>
                </div>
              </div>
            </div>
            <button type="button" className={styles.buyBtn}>Acheter</button>
          </div>
        </div>

        {/* Placeholder 2 */}
        <div className={styles.blurredCard}>
          <div className={styles.insurerCardContent}>
            <div className={styles.insurerLeftInfo}>
              <div className={styles.logoContainer}>
                <img src="/images/logo-assurance-de-personne/canada-vie.png" alt="Canada Vie" className={styles.insurerLogo} />
              </div>
              <div className={styles.insurerMeta}>
                <h4 className={styles.insurerName}>Canada Vie</h4>
                <div className={styles.insurerPriceRow}>
                  <span className={styles.priceAmount}>91$</span>
                  <span className={styles.priceUnit}>/ mois</span>
                </div>
              </div>
            </div>
            <button type="button" className={styles.buyBtn}>Acheter</button>
          </div>
        </div>

        {/* Centered Overlay CTA */}
        <div className={styles.ctaOverlay}>
          <p className={styles.ctaText}>
            Pour obtenir plus d'options, planifier un appel avec votre conseiller en sécurité financière
          </p>
          <button type="button" className={styles.planCallBtn} onClick={onPlanCall}>
            Planifier mon appel
          </button>
        </div>
      </div>

    </div>
  );
};

export default InsurerOptionsList;
