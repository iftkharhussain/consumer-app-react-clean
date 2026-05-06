import React from 'react';
import styles from './ExploreModal.module.css';

const ExploreModal = ({ 
  isOpen, 
  onClose, 
  onStart,
  productName = 'ASSURANCE AUTO', 
  advisorName = 'Courtika',
  advisorLogo = null,
  isCourtika = true,
  advisorDescription = 'un conseiller en sécurité financière'
}) => {
  if (!isOpen) return null;

  const displayLogo = advisorLogo || (isCourtika ? '/images/courtika-assurances-inc.png' : null);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className={styles.topSection}>
          <div className={styles.header}>
            <div className={styles.logoBox}>
              <img src="/images/norga-blue-logo.png" alt="Norga" className={styles.logo} />
            </div>
            {displayLogo && (
              <>
                <div className={styles.dots}>
                  <div className={styles.dot} style={{ animationDelay: '0ms' }}></div>
                  <div className={styles.dot} style={{ animationDelay: '300ms' }}></div>
                  <div className={styles.dot} style={{ animationDelay: '600ms' }}></div>
                </div>
                <div className={styles.logoBox}>
                  <img src={displayLogo} alt={advisorName} className={styles.logo} />
                </div>
              </>
            )}
          </div>

          <h1 className={styles.title}>
            Vous aimeriez magasiner une {productName}?
          </h1>
          <p className={styles.description}>
            {isCourtika ? (
              <>
                Comparez facilement les offres de plusieurs assureurs et obtenez une estimation du prix de votre assurance en quelques minutes, directement en ligne. Ensuite, <strong>{advisorName}</strong> vous contactera pour valider les détails et vous aider à trouver la meilleure option pour vous, gratuitement et sans aucune obligation.
              </>
            ) : (
              <>
                Comparez facilement les offres de plusieurs assureurs et obtenez une estimation du prix de votre assurance vie en quelques minutes, directement en ligne. Ensuite, <strong>{advisorDescription}</strong> vous contacte pour valider les détails et vous aider à trouver la meilleure option pour vous, gratuitement et sans aucune obligation.
              </>
            )}
          </p>
        </div>

        <div className={styles.body}>
          <div className={styles.selectionBox}>
            {displayLogo && (
              <div className={styles.selectionIconBox}>
                <img src={displayLogo} alt={advisorName} className={styles.logo} />
              </div>
            )}
            <div>
              <p className={styles.selectionLabel}>Votre sélection</p>
              <p className={styles.selectionValue}>Magasiner une {productName}</p>
            </div>
          </div>

          <button className={styles.ctaButton} onClick={onStart}>
            Débuter maintenant
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <div className={styles.footer}>
            <div className={styles.footerItem}>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Certifié AMF</span>
            </div>
            <div className={styles.footerItem}>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>100% gratuit</span>
            </div>
            <div className={styles.footerItem}>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Sans engagement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreModal;
