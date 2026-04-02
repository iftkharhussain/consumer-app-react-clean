import React, { useState } from 'react';
import { Modal } from 'antd';
import Button from '../button/Button';
import ContactSection from '../contactSection';
import RatingSection from '../ratingSection';
import styles from './InterestedModal.module.css';
import { getFormattedTodayHours } from '../../utils/businessHours';

const InterestedModal = ({ isOpen, onClose, onAccept, variant = 'default' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = () => {
    setIsLoading(true);

    // Show loading for 1 second
    setTimeout(() => {
      setIsLoading(false);
      console.log('User accepted');
      if (onAccept) onAccept();
      onClose();
    }, 1000);
  };

  const handleRefuse = () => {
    // Handle refuse logic
    console.log('User refused');
    onClose();
  };

  const handleSubmitRating = ({ rating, comment }) => {
    console.log('Rating submitted:', rating, comment);
    onClose();
  };

  // Review variant - shows rating section with 100% progress
  if (variant === 'review') {
    return (
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={814}
        centered
        className={styles.modal}
        closeIcon={<img src="/images/Button close X.svg" alt="Close" />}
      >
        <div className={styles.modalContent}>
          {/* Title */}
          <h2 className={styles.title}>Review Courtika</h2>

          {/* Description */}
          <p className={styles.description}>
            Thank you for completing your call! Please share your experience to help us improve our service.
          </p>

          {/* Progress steps - 100% complete */}
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
                <div className={styles.stepBar}>
                  <div className={styles.stepBarFill}></div>
                </div>
              </div>

              <div className={`${styles.progressStep} ${styles.activeStep}`}>
                <span className={styles.stepLabelActive}>Review Courtika</span>
                <div className={styles.stepBar}>
                  <div className={styles.stepBarFill}></div>
                </div>
              </div>
            </div>

            <span className={styles.progressPercentage}>100%</span>
          </div>

          {/* Contact section - using reusable component */}
          <ContactSection />

          {/* Rating Section - using reusable component */}
          <RatingSection 
            title="Rate Courtika!" 
            onSubmit={handleSubmitRating} 
          />
        </div>
      </Modal>
    );
  }

  // Default variant
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={814}
      centered
      className={styles.modal}
      closeIcon={<img src="/images/Button close X.svg" alt="Close" />}
    >
      <div className={styles.modalContent}>
        {/* Title */}
        <h2 className={styles.title}>Acheter avec Courtika</h2>

        {/* Description */}
        <p className={styles.description}>
          Félicitations! Vous avez maintenant votre estimation. Vous pouvez désormais demander à Courtika de vous appeler pour obtenir votre prix exact et finaliser votre achat.
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
            <span className={styles.detailText}>{getFormattedTodayHours()}</span>
          </div>

          <div className={styles.detailItem}>
            <img src="/images/clock.svg" alt="Clock" className={styles.detailIcon} />
            <span className={styles.detailText}>Durée de l'appelle : 15 min</span>
          </div>

          <div className={styles.detailItem}>
            <img src="/images/bell-ringing-01.svg" alt="Bell" className={styles.detailIcon} />
            <span className={styles.detailText}>If you don't answer, we'll try 2 more times</span>
          </div>
        </div>

        {/* Provider section */}
        <div className={styles.providerSection}>
          <span className={styles.providerLabel}>Votre courtier en assurance de dommages est Courtika</span>
          <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.providerLogo} />
        </div>

        {/* Call confirmation */}
        <p className={styles.callConfirmation}>Voulez-vous que Courtika vous appelle?</p>

        {/* Action buttons */}
        <div className={styles.buttonContainer}>
          <Button onClick={handleAccept} type="primary" className={styles.acceptButton} loading={isLoading}>
            Accepter
          </Button>
          <Button onClick={handleRefuse} variant="secondary" className={styles.refuseButton}>
            Refuser
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InterestedModal;
