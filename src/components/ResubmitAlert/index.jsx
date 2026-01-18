import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ResubmitAlert.module.css';

/**
 * ResubmitAlert Component
 * 
 * Shows an alert when user resubmits a form with different personal info
 * Advises them to use the app for additional quotes instead of resubmitting
 */
const ResubmitAlert = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.alertContainer}>
      <div className={styles.alertContent}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
        <p className={styles.alertMessage}>
          {t('resubmit_alert_message', 'If you want to add another quote or get a different product, use this app instead of filling the form again or contact  (450) 558-3553')}
        </p>
      </div>
    </div>
  );
};

export default ResubmitAlert;
