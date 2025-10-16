import React, { useState } from 'react';
import styles from './CustomAlert.module.css';

const CustomAlert = ({ 
  message = "Want to save? You are also eligible for a [Same Category] quote.",
  secondaryMessage = "Get a free quote now!",
  buttonText = "Get Free [Same Category Insurance] Quote",
  onButtonClick = () => {},
  onClose = () => {},
  showCloseButton = true,
  category = "Same Category",
  style = {}
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  // Replace placeholder with actual category
  const formattedMessage = message.replace('[Same Category]', category);
  const formattedButtonText = buttonText.replace('[Same Category Insurance]', `${category} Insurance`);

  return (
    <div className={styles.alertContainer} style={style}>
      <div className={styles.alertContent}>
        <div className={styles.alertIcon}>
          <img src="/images/alert-circle.svg" alt="Alert" />
        </div>
        <div className={styles.alertText}>
          <span className={styles.primaryMessage}>{formattedMessage}</span>
          <span className={styles.secondaryMessage}>{secondaryMessage}</span>
        </div>
      </div>
      <div className={styles.alertActions}>
        <button 
          className={styles.actionButton}
          onClick={onButtonClick}
        >
          {formattedButtonText}
        </button>
        {showCloseButton && (
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close alert"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomAlert;
