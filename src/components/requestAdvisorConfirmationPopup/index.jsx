import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RequestAdvisorConfirmationPopup.module.css';

// SVG Icons
const BackArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.6666 8H3.33325M3.33325 8L7.99992 12.6667M3.33325 8L7.99992 3.33334" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V5C18 3.89543 17.1046 3 16 3Z" stroke="#2121DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 7H13C13.5523 7 14 6.55228 14 6C14 5.44772 13.5523 5 13 5H11C10.4477 5 10 5.44772 10 6C10 6.55228 10.4477 7 11 7Z" stroke="#2121DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11H15" stroke="#2121DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 15H13" stroke="#2121DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RightArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.16663 10H15.8333M15.8333 10L10 4.16669M15.8333 10L10 15.8334" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RequestAdvisorConfirmationPopup = ({
  isOpen,
  onClose,
  onBack,
  advisorRecord,
  selectedProduct
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Format advisor title for lowercased grammar in description
  const advisorTypeTitle = (advisorRecord?.type || 'conseiller').toLowerCase();

  const handleCompleteQuestionnaire = () => {
    onClose();
    if (selectedProduct?.path) {
      navigate(selectedProduct.path);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmationContainer}>
          {/* Back Button */}
          <button type="button" className={styles.backButton} onClick={onBack}>
            <BackArrowIcon />
            <span>Retour</span>
          </button>

          {/* Top Circle Icon */}
          <div className={styles.iconCircle}>
            <ClipboardIcon />
          </div>

          {/* Title */}
          <h2 className={styles.title}>Complète ta demande</h2>

          {/* Description */}
          <p className={styles.description}>
            Réponds à quelques questions afin qu'un{' '}
            <span className={styles.advisorHighlight}>{advisorTypeTitle}</span> puisse mieux
            comprendre ta situation et te contacter rapidement.
          </p>

          {/* Selected Product Pill */}
          {selectedProduct && (
            <div className={styles.productPill}>
              {selectedProduct.icon && (
                <img
                  src={selectedProduct.icon}
                  alt={selectedProduct.title}
                  className={styles.productPillIcon}
                />
              )}
              <span className={styles.productPillText}>{selectedProduct.title}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleCompleteQuestionnaire}
          >
            <span>Compléter le questionnaire</span>
            <RightArrowIcon />
          </button>

          {/* Secondary Link */}
          <button type="button" className={styles.secondaryLink} onClick={onClose}>
            Peut-être plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestAdvisorConfirmationPopup;
