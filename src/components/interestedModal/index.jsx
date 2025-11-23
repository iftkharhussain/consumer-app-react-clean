import React from 'react';
import Button from '../button/Button';
import styles from './InterestedModal.module.css';

const InterestedModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    // Handle accept logic
    console.log('User accepted');
    onClose();
  };

  const handleRefuse = () => {
    // Handle refuse logic
    console.log('User refused');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeButton} onClick={onClose}>
          <img src="/images/Button close X.svg" alt="Close" />
        </button>

        {/* Title */}
        <h2 className={styles.title}>Prochaine étape: Parler à Courtika</h2>

        {/* Description */}
        <p className={styles.description}>
          Félicitation! maintenant que vous avez votre estimer, vous avez accès à un conseiller qui va concrétiser votre demande pour vous.
        </p>

        {/* Progress steps */}
        <div className={styles.progressSection}>
          <div className={styles.progressSteps}>
            <div className={styles.progressStep}>
              <span className={styles.stepLabel}>Estimation du prix</span>
              <div className={styles.stepBar}>
                <div className={styles.stepBarFill}></div>
              </div>
            </div>
            
            <div className={styles.progressStep}>
              <span className={styles.stepLabel}>Achat au téléphone</span>
              <div className={styles.stepBar}></div>
            </div>
            
            <div className={styles.progressStep}>
              <span className={styles.stepLabel}>Review Courtika</span>
              <div className={styles.stepBar}></div>
            </div>
          </div>
          
          <span className={styles.progressPercentage}>33%</span>
        </div>

        {/* Details section */}
        <div className={styles.detailsSection}>
          <h3 className={styles.detailsTitle}>Détails</h3>
          
          <div className={styles.detailItem}>
            <img src="/images/calendar.svg" alt="Calendar" className={styles.detailIcon} />
            <span className={styles.detailText}>Ouvert de 8:30 à 16:30 du lundi au vendredi</span>
          </div>
          
          <div className={styles.detailItem}>
            <img src="/images/clock.svg" alt="Clock" className={styles.detailIcon} />
            <span className={styles.detailText}>Durée de l'appelle: 10 min</span>
          </div>
          
          <div className={styles.detailItem}>
            <img src="/images/bell-ringing-01.svg" alt="Bell" className={styles.detailIcon} />
            <span className={styles.detailText}>If you don't answer, we'll try 2 more times</span>
          </div>
        </div>

        {/* Provider section */}
        <div className={styles.providerSection}>
          <span className={styles.providerLabel}>Courtier d'assurance de dommage Courtika</span>
          <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.providerLogo} />
        </div>

        {/* Call confirmation */}
        <p className={styles.callConfirmation}>Voulez-vous que Courtika vous appelle?</p>

        {/* Action buttons */}
        <div className={styles.buttonContainer}>
          <Button onClick={handleAccept} type="primary" className={styles.acceptButton}>
            Accepter
          </Button>
          <Button onClick={handleRefuse} variant="secondary" className={styles.refuseButton}>
            Refuser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterestedModal;
