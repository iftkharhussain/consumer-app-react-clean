import React from 'react';
import styles from './LifeInsuranceResult.module.css';

// SVG Icons (Exact Figma SVGs)
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.rowIcon}>
    <path d="M12.5 3H3.5C2.67157 3 2 3.67157 2 4.5V12.5C2 13.3284 2.67157 14 3.5 14H12.5C13.3284 14 14 13.3284 14 12.5V4.5C14 3.67157 13.3284 3 12.5 3Z" stroke="#1A1ABA" strokeWidth="1.33333" />
    <path d="M5 2V4M11 2V4" stroke="#1A1ABA" strokeWidth="1.33333" strokeLinecap="round" />
    <path d="M2 7H14" stroke="#1A1ABA" strokeWidth="1.33333" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.rowIcon}>
    <path d="M8 2L13 5V9C13 11.5 11 13.5 8 14C5 13.5 3 11.5 3 9V5L8 2Z" stroke="#1A1ABA" strokeWidth="1.33333" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.rowIcon}>
    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#1A1ABA" strokeWidth="1.33333" />
    <path d="M8 4.5V8L10 10" stroke="#1A1ABA" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LifeInsuranceResult = ({
  coverageType = 'Temporaire 10 ans',
  coverageAmount = '500 000 $',
  paymentFrequency = 'Mensuel'
}) => {
  return (
    <div className={styles.container}>
      {/* Votre Protection Card Section ONLY */}
      <div className={styles.protectionCard}>
        <div className={styles.protectionHeader}>
          <h3 className={styles.protectionTitle}>Votre protection</h3>
          <span className={styles.customizeText}>Personnaliser</span>
        </div>

        <div className={styles.protectionGrid}>
          <div className={styles.firstRowWrapper}>
            <div className={styles.protectionRow}>
              <div className={styles.rowLabelGroup}>
                <CalendarIcon />
                <span className={styles.rowLabel}>Type de couverture</span>
              </div>
              <span className={styles.rowValue}>{coverageType}</span>
            </div>
          </div>

          <div className={styles.protectionRow}>
            <div className={styles.rowLabelGroup}>
              <ShieldIcon />
              <span className={styles.rowLabel}>Montant</span>
            </div>
            <span className={styles.rowValue}>
              <span className={styles.valuePrefix}>Couverture : </span>
              <strong className={styles.valueHighlight}>{coverageAmount}</strong>
            </span>
          </div>

          <div className={`${styles.protectionRow} ${styles.noBorderRow}`}>
            <div className={styles.rowLabelGroup}>
              <ClockIcon />
              <span className={styles.rowLabel}>Fréquence de paiement</span>
            </div>
            <span className={styles.rowValue}>
              <span className={styles.valuePrefix}>Fréquence : </span>
              <strong className={styles.valueHighlight}>{paymentFrequency}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeInsuranceResult;
