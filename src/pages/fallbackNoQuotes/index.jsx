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
import { useSelector } from 'react-redux';
import styles from './FallbackNoQuotes.module.css';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';
import fortusService from '../../services/api/fortusService';
import { checkPendingOrder } from '../../services/api/productOrderService';
import { trackPixelEvent } from '../../utils/pixel';
import { getQuoteDetails } from '../../services/api/quoteService';
import LoadingModal from '../../components/loadingModal';
import { FallbackSkeleton } from '../../components/carInsurance/QuoteSkeletons';

const FallbackNoQuotes = () => {
  const navigate = useNavigate();
  const initialized = useRef(false);
  const timerRef = useRef(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [userProductId, setUserProductId] = useState(null);

  // Get user info from Redux to pass in URL
  const userProfile = useSelector(state => state.app?.user_profile);
  const authUser = useSelector(state => state.app?.auth);

  const userEmail = userProfile?.email || authUser?.email || '';
  const userName = userProfile?.firstName 
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : authUser?.firstName 
    ? `${authUser.firstName} ${authUser.lastName || ''}`.trim()
    : (userProfile?.fullName || authUser?.fullName || '');
  const userPhone = userProfile?.phone || authUser?.phone || '';

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Impossible de générer vos soumissions - Norga';
      initialized.current = true;
    }
  }, []);

  // Fetch userProductId on mount
  useEffect(() => {
    const fetchUserProductId = async () => {
      try {
        const response = await checkPendingOrder('car-insurance');
        if (response.success && response.userProductId) {
          setUserProductId(response.userProductId);
        }
      } catch (error) {
        console.error('[FallbackNoQuotes] Error fetching userProductId:', error);
      } finally {
        setHasLoadedOnce(true);
        setIsInitialLoading(false);
      }
    };
    fetchUserProductId();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
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

    try {
      // Fetch quote details to find lowest price carrier
      let carrierCode = null;
      if (userProductId) {
        try {
          const quoteResponse = await getQuoteDetails(userProductId);
          if (quoteResponse.success && quoteResponse.quote?.carriers) {
            // Find carrier with lowest annual premium
            const availableCarriers = quoteResponse.quote.carriers.filter(c => c.available !== false);
            if (availableCarriers.length > 0) {
              const lowestPriceCarrier = availableCarriers.reduce((lowest, current) => {
                const lowestPrice = lowest.annualPremium || lowest.premium || 999999;
                const currentPrice = current.annualPremium || current.premium || 999999;
                return currentPrice < lowestPrice ? current : lowest;
              });
              carrierCode = lowestPriceCarrier.carrierCode;
              console.log('\n🔍 [FallbackNoQuotes DEBUG] ===================');
              console.log('🏆 Selected lowest price carrier:', {
                carrierCode: carrierCode,
                name: lowestPriceCarrier.carrierName || lowestPriceCarrier.name,
                premium: lowestPriceCarrier.annualPremium || lowestPriceCarrier.premium
              });
              console.log('📤 This carrier will be sent to ezLeads');
              console.log('=========================================\n');
            }
          }
        } catch (quoteError) {
          console.warn('[FallbackNoQuotes] Could not fetch quote details:', quoteError);
          // Continue without carrierCode - backend will use default
        }
      }

      console.log('\n🚀 [FallbackNoQuotes] SENDING REQUEST:', {
        carrierCode: carrierCode || 'not specified (backend will use cheapest)',
        userProductId: userProductId,
        productSlug: 'car-insurance'
      });
      
      // Call Fortus API to send the lead and email
      const result = await fortusService.requestCall({
        userProductId,
        productSlug: 'car-insurance',
        carrierCode, // Pass the lowest price carrier
        position: 'Fallback Page',
        buttonName: 'Oui, continuer avec Courtika'
      });

      if (result.success) {
        console.log('[FallbackNoQuotes] Fortus request successful:', result);
        message.success('Votre demande a été envoyée avec succès!');
        
        // Track successful conversion using standard 'Schedule' event
        trackPixelEvent('Schedule', {
          userProductId,
          source: 'fallback_no_quotes'
        });

        // Trigger the phone call dialer on mobile only
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          fortusService.trackEvent(userProductId, 'call', {
            buttonName: 'Auto-dial (Mobile)',
            position: 'Fallback No Quotes Page',
            insurerName: 'Courtika'
          }).catch(err => console.error('Error tracking call event:', err));
          window.location.href = 'tel:+14507629240';
        }

        // Show success state after 2 seconds
        timerRef.current = setTimeout(() => {
          setIsLoading(false);
          setIsSubmitted(true);
        }, 2000);
      } else {
        console.warn('[FallbackNoQuotes] Fortus request failed:', result);
        message.error(result.message || 'Une erreur est survenue. Veuillez réessayer.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[FallbackNoQuotes] Error:', error);
      message.error('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const isRealLoading = isLoading || isInitialLoading;

  return (
    <PageContent pageType="overview">
        {/* Infinite Spinner Overlay - Always shows during any loading state */}
        {isRealLoading && <LoadingModal isOpen={true} />}

        {/* Show Once Logic: First load uses Skeleton behind the spinner */}
        {isInitialLoading && !hasLoadedOnce && <FallbackSkeleton />}

        {!isInitialLoading && (
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
                        <span><strong>Accès à 10+ assureurs</strong> - Bien plus que ce que vous pourriez trouver seul</span>
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
                      <span className={styles.infoText}>Durée de l'appel : environ 15 min</span>
                    </li>
                    <li>
                      <InfoCircleOutlined className={styles.infoIcon} />
                      <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                    </li>
                    <li className={styles.desktopOnly}>
                      <PhoneOutlined className={styles.infoIcon} style={{ transform: 'scaleX(-1)' }} />
                      <div>
                        <span className={styles.infoText}>Ligne prioritaire : <a href="tel:+14507629240" className={styles.infoLink} style={{display: 'inline', marginTop: '0', color: '#1f01c8'}} onClick={() => {
                          if (userProductId) {
                            fortusService.trackEvent(userProductId, 'call', { buttonName: 'Ligne prioritaire', position: 'Fallback No Quotes Page', insurerName: 'Courtika' }).catch(console.error);
                          }
                        }}>1 (450) 762-9240</a></span>
                      </div>
                    </li>
                  </ul>

                  <div className={styles.actionButtons}>
                    <Button type="primary" className={`${styles.primaryButton} ${styles.mobileOnly}`} size="large" href="tel:+14507629240" onClick={() => {
                      if (userProductId) {
                        fortusService.trackEvent(userProductId, 'call', { buttonName: 'Appeler maintenant (Mobile Button)', position: 'Fallback No Quotes Page', insurerName: 'Courtika' }).catch(console.error);
                      }
                    }}>
                      <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: 1 (450) 762-9240
                    </Button>
                    
                    <Button className={styles.secondaryOutlineButton} size="large" onClick={() => {
                        localStorage.setItem('lead_source_page', 'Fallback Page');
                        localStorage.setItem('lead_source_button', "Planifier l'appel plus tard");
                        const params = new URLSearchParams();
                        if (userName) params.append('name', userName);
                        if (userEmail) params.append('email', userEmail);
                        if (userPhone) params.append('phone', userPhone);
                        
                        navigate(`/schedule-call?${params.toString()}`, { state: { userProductId } });
                    }}>
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
                Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 10+ assureurs.
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
        )}
      <ScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </PageContent>
  );
};

export default FallbackNoQuotes;
