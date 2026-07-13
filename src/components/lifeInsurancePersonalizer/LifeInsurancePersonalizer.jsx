import React, { useState } from 'react';
import styles from './LifeInsurancePersonalizer.module.css';

const COVERAGE_TYPES = [
  'Temporaire 10 ans',
  'Temporaire 15 ans',
  'Temporaire 20 ans',
  'Temporaire 25 ans',
  'Temporaire 30 ans',
  'Permanent',
];

const PAYMENT_FREQUENCIES = ['Mensuel', 'Annuel'];

const LifeInsurancePersonalizer = ({
  isOpen,
  onClose,
  onApply,
  initialCoverageType = 'Temporaire 10 ans',
  initialCoverageAmount = 500000,
  initialFrequency = 'Mensuel',
}) => {
  const [coverageType, setCoverageType] = useState(initialCoverageType);
  const [coverageAmount, setCoverageAmount] = useState(initialCoverageAmount);
  const [frequency, setFrequency] = useState(initialFrequency);

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    // Keep only digits so the field stays a clean numeric amount.
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setCoverageAmount(digits === '' ? '' : Number(digits));
  };

  const handleApply = () => {
    onApply?.({ coverageType, coverageAmount, frequency });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Personnaliser votre protection</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
            <svg className={styles.closeIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {/* Type de couverture */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Type de couverture</label>
            <div className={styles.pillGroup}>
              {COVERAGE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={[
                    styles.pill,
                    coverageType === type ? styles.pillActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setCoverageType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Montant de couverture */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Montant de couverture</label>
            <div className={styles.amountInputWrapper}>
              <span className={styles.currencySymbol}>$</span>
              <input
                type="text"
                inputMode="numeric"
                className={styles.amountInput}
                value={coverageAmount}
                onChange={handleAmountChange}
              />
            </div>
          </div>

          {/* Fréquence de paiement */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fréquence de paiement</label>
            <div className={styles.frequencyGroup}>
              {PAYMENT_FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  className={`${styles.frequencyOption} ${frequency === freq ? styles.frequencyActive : ''}`}
                  onClick={() => setFrequency(freq)}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Annuler
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifeInsurancePersonalizer;
