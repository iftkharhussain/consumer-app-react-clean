import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RequestAdvisorConfirmationPopup.module.css';

// SVG Icons
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 11.875L3.125 7.5L7.5 3.125" stroke="#717680" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.875 7.5H3.125" stroke="#717680" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" className={styles.confirmationClipboardIcon}>
    <path d="M20.0001 2.66797H12.0001C11.2637 2.66797 10.6667 3.26492 10.6667 4.0013V6.66797C10.6667 7.40435 11.2637 8.0013 12.0001 8.0013H20.0001C20.7365 8.0013 21.3334 7.40435 21.3334 6.66797V4.0013C21.3334 3.26492 20.7365 2.66797 20.0001 2.66797Z" stroke="#2121DD" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.3333 5.33203H23.9999C24.7072 5.33203 25.3854 5.61298 25.8855 6.11308C26.3856 6.61318 26.6666 7.29145 26.6666 7.9987V26.6654C26.6666 27.3726 26.3856 28.0509 25.8855 28.551C25.3854 29.0511 24.7072 29.332 23.9999 29.332H7.99992C7.29267 29.332 6.6144 29.0511 6.1143 28.551C5.6142 28.0509 5.33325 27.3726 5.33325 26.6654V7.9987C5.33325 7.29145 5.6142 6.61318 6.1143 6.11308C6.6144 5.61298 7.29267 5.33203 7.99992 5.33203H10.6666" stroke="#2121DD" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 14.668H21.3333" stroke="#2121DD" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 21.332H21.3333" stroke="#2121DD" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.6667 14.668H10.6801" stroke="#2121DD" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.6667 21.332H10.6801" stroke="#2121DD" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RightArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M3.33325 8H12.6666" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 3.33203L12.6667 7.9987L8 12.6654" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
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
    <div className={styles.confirmationOverlay} onClick={onClose}>
      <div className={styles.confirmationCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmationContent}>
          {/* Header with Back Button */}
          <div className={styles.confirmationHeader}>
            <button type="button" className={styles.confirmationBackButton} onClick={onBack}>
              <BackArrowIcon />
              <span className={styles.backButtonText}>Retour</span>
            </button>
          </div>

          {/* Top Circle Icon Section */}
          <div className={styles.iconSection}>
            <div className={styles.confirmationIconCircle}>
              <ClipboardIcon />
            </div>
          </div>

          {/* Title */}
          <h2 className={styles.confirmationTitle}>Complète ta demande</h2>

          {/* Description */}
          <p className={styles.confirmationDescription}>
            Réponds à quelques questions afin qu'un{' '}
            <span className={styles.confirmationAdvisorHighlight}>{advisorTypeTitle}</span> puisse mieux
            comprendre ta situation et te contacter rapidement.
          </p>

          {/* Selected Product Pill */}
          {selectedProduct && (
            <div className={styles.pillSection}>
              <div className={styles.confirmationProductPill}>
                {selectedProduct.icon && (
                  <img
                    src={selectedProduct.icon}
                    alt={selectedProduct.title}
                    className={styles.confirmationProductPillIcon}
                  />
                )}
                <span className={styles.confirmationProductPillText}>{selectedProduct.title}</span>
              </div>
            </div>
          )}

          {/* Divider Line Section */}
          <div className={styles.dividerSection}>
            <div className={styles.confirmationDivider} />
          </div>

          {/* Primary Action Button Wrapper */}
          <div className={styles.buttonWrapper}>
            <button
              type="button"
              className={styles.confirmationPrimaryBtn}
              onClick={handleCompleteQuestionnaire}
            >
              <span className={styles.primaryBtnText}>Compléter le questionnaire</span>
              <RightArrowIcon />
            </button>
          </div>

          {/* Secondary Link */}
          <button type="button" className={styles.confirmationSecondaryBtn} onClick={onClose}>
            Peut-être plus tard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestAdvisorConfirmationPopup;
