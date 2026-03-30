import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button, message } from 'antd';
import { 
  WarningOutlined, 
  CheckOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './FallbackNoQuotes.module.css';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';
import { fortusService } from '../../services/api/fortusService';

/**
 * FallbackNoQuotes - Displayed when quote generation fails
 * 
 * Props:
 * - userProductId: string - User product ID from user_products collection
 * - productSlug: string - Product slug (e.g., 'car-insurance')
 */
const FallbackNoQuotes = ({ userProductId, productSlug = 'car-insurance' }) => {
  const navigate = useNavigate();
  const initialized = useRef(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Impossible de générer vos soumissions - Consumer App';
      initialized.current = true;
    }

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
    console.log('[FallbackNoQuotes] Sending ezLead and email notification');

    try {
      // Prepare params for fortusService - no selectedQuote since quotes failed
      const params = userProductId 
        ? { userProductId, selectedQuote: null, recalculatedQuote: null } 
        : { productSlug, selectedQuote: null, recalculatedQuote: null };
      
      console.log('[FallbackNoQuotes] Request params:', params);
      
      // Call Fortus API to send the lead and email
      const result = await fortusService.requestCall(params);
      
      if (result.success) {
        console.log('[FallbackNoQuotes] Request successful:', result);
        setIsLoading(false);
        setIsSubmitted(true);
        message.success('Votre demande a été envoyée avec succès!');
        
        // Stay on this page to show contact information
        // No redirect needed since quote generation failed
      } else {
        console.warn('[FallbackNoQuotes] Request failed:', result);
        setIsLoading(false);
        message.error(result.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('[FallbackNoQuotes] API error:', error);
      setIsLoading(false);
      message.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <PageContent pageType="overview">
      <div className={styles.fallbackContainer}>
      
        {!isSubmitted && (
          <div className={styles.headerSection}>
            <div className={styles.warningIconWrapper}>
              <WarningOutlined className={styles.warningIcon} />
            </div>
            <h1 className={styles.mainTitle}>Impossible de générer vos soumissions</h1>
            <p className={styles.subTitle}>
             Nous éprouvons actuellement des difficultés techniques pour traiter votre demande. Pas de souci! Votre progression a bien été enregistrée et un courtier chez Courtika peut vous aider rapidement à compléter votre démarche. Cliquez ci-dessous pour poursuivre avec eux par téléphone
            </p>
          </div>
        )}

        {/* Action Card */}
        <div 
          key={isSubmitted ? 'submitted' : 'prompt'} 
          className={`${styles.actionCard} ${isSubmitted ? styles.submitted : ''}`}
        >
          {!isSubmitted ? (
            <>
              <h2 className={styles.cardTitle}>Aimeriez-vous continuer avec Courtika?</h2>
              
              <div className={styles.statusSection}>
                <div className={styles.courtikaLogo}>
                  <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={`${styles.statusBadge} ${!isOpenNow() ? styles.statusBadgeClosed : ''}`}>
                    <div className={`${styles.statusDot} ${!isOpenNow() ? styles.statusDotClosed : ''}`}></div>
                    {isOpenNow() ? 'Disponible maintenant' : 'Fermé maintenant'}
                  </div>
                  <p className={styles.statusText}>Courtiers certifiés prêts à vous aider</p>
                </div>
              </div>

              <div className={styles.alertBox}>
                <img src="/images/CheckCircle.svg" alt="Check" className={styles.alertIcon} />
                <div className={styles.alertContent}>
                  <h3 className={styles.alertTitle}>Votre dossier est déjà prêt</h3>
                  <p className={styles.alertText}>Vous n'aurez pas à répéter vos informations. Tout sera déjà fourni à votre courtier.</p>
                </div>
              </div>

              <div className={styles.benefitsSection}>
                <p className={styles.benefitsTitle}>Pourquoi parler à un courtier maintenant:</p>
                <ul className={styles.benefitsList}>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Service 100% gratuit</strong> - Aucun frais, aucune obligation</span>
                  </li>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Accès à 30+ assureurs</strong> - Bien plus que ce que vous pourriez trouver seul</span>
                  </li>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Conseils d'experts</strong> - Adaptés à votre situation spécifique</span>
                  </li>
                  <li>
                    <CheckOutlined className={styles.checkIcon} />
                    <span><strong>Économisez votre temps</strong> - Un expert compare pour vous</span>
                  </li>
                </ul>
              </div>

              <Button type="primary" className={styles.primaryButton} size="large" onClick={handleSubmit} loading={isLoading}>
                {!isLoading && <CheckOutlined />} Oui, continuer avec Courtika
              </Button>
              
              <p className={styles.footerNote}>Aucune obligation • Vous gardez le contrôle</p>
            </>
          ) : (
            <>
              <div className={styles.successBanner}>
                <CheckOutlined className={styles.successIcon} />
                <div className={styles.successContent}>
                  <h3 className={styles.successTitle}>Vos informations ont été transmises à Courtika!</h3>
                  <p className={styles.successText}>Un courtier attend   <strong>votre appel</strong> au 1 (450) 762-9240</p>
                </div>
              </div>

              <h2 className={styles.submittedCardTitle}>Coordonnées de Courtika:</h2>
              
              <div className={styles.statusSectionLeft}>
                <div className={styles.courtikaLogo}>
                  <img src="/images/courtika-assurances-inc.png" alt="Courtika" className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={`${styles.statusBadge} ${!isOpenNow() ? styles.statusBadgeClosed : ''}`}>
                    <div className={`${styles.statusDot} ${!isOpenNow() ? styles.statusDotClosed : ''}`}></div>
                    {isOpenNow() ? 'Disponible maintenant' : 'Fermé maintenant'}
                  </div>
                  <p className={styles.statusText}>Courtiers certifiés prêts à vous aider</p>
                </div>
              </div>

              <ul className={styles.infoList}>
                <li>
                  <CalendarOutlined className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoText}>{getFormattedTodayHours()}</span>
                    <a href="#" className={styles.infoLink} onClick={(e) => { e.preventDefault(); setIsScheduleOpen(true); }}>Voir l'horaire complet</a>
                  </div>
                </li>
                <li>
                  <ClockCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Durée de l'appel: environ 15 min</span>
                </li>
                <li>
                  <InfoCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                </li>
                <li className={styles.desktopOnly}>
                  <PhoneOutlined className={styles.infoIcon} style={{ transform: 'scaleX(-1)' }} />
                  <div>
                    <span className={styles.infoText}>Ligne prioritaire : <a href="tel:+14507629240" className={styles.infoLink} style={{display: 'inline', marginTop: '0', color: '#1f01c8'}}>1 (450) 762-9240</a></span>
                  </div>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={`${styles.primaryButton} ${styles.mobileOnly}`} size="large" href="tel:+14507629240">
                  <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: 1 (450) 762-9240
                </Button>
                
                <Button 
                  className={styles.secondaryOutlineButton} 
                  size="large" 
                  onClick={() => navigate(userProductId ? `/schedule-call/${userProductId}` : '/schedule-call')}
                >
                  <CalendarOutlined /> Planifier l'appel plus tard
                </Button>
              </div>
            </>
          )}
        </div>

        {/* About Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>À propos de Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 30+ assureurs.
          </p>
          
          <div className={styles.certificationSection}>
            <div className={styles.amfLogoPlaceholder}>
              <img src="/images/logo-amf-header 1.png" alt="Autorité des marchés financiers" className={styles.amfImageLogo} />
            </div>
            <div className={styles.certText}>
              <h4 className={styles.certTitle}>Courtika est certifié par l'AMF</h4>
              <p className={styles.certSubtitle}>Autorité des marchés financiers du Québec</p>
            </div>
          </div>
        </div>
      </div>
      <ScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </PageContent>
  );
};

export default FallbackNoQuotes;
