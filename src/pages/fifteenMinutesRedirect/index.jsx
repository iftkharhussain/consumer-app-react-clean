import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button, message, Spin } from 'antd';
import { ClockCircleOutlined, SearchOutlined, CheckOutlined, CalendarOutlined, InfoCircleOutlined, PhoneOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import { fortusService } from '../../services/api/fortusService';
import { getOrderDetails, checkPendingOrder } from '../../services/api/productOrderService';
import styles from './FifteenMinutesRedirect.module.css';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';

const FifteenMinutesRedirect = () => {
  const initialized = useRef(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { userProductId } = useParams();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  
  // API data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Vos soumissions ont expiré - Consumer App';
      initialized.current = true;
    }

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Fetch order details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let productId = userProductId;

        // If no userProductId in URL, check for pending order
        if (!productId) {
          console.log('[FifteenMinutesRedirect] No userProductId, checking for pending order...');
          const pendingResult = await checkPendingOrder('car-insurance');
          
          if (pendingResult.success && pendingResult.hasPendingOrder) {
            productId = pendingResult.userProductId;
            console.log('[FifteenMinutesRedirect] Found pending order:', productId);
          }
        }

        // Fetch order details if we have a productId
        if (productId) {
          console.log('[FifteenMinutesRedirect] Fetching order details for:', productId);
          const result = await getOrderDetails(productId);
          
          if (result.success) {
            setOrderData(result.data);
            console.log('[FifteenMinutesRedirect] Order data loaded:', result.data);
          } else {
            console.warn('[FifteenMinutesRedirect] Failed to fetch order:', result.message);
            setError(result.message);
          }
        } else {
          console.log('[FifteenMinutesRedirect] No productId available, using defaults');
        }
      } catch (err) {
        console.error('[FifteenMinutesRedirect] Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProductId]);

  const handleSubmit = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLoading(true);
    console.log('[FifteenMinutesRedirect] Sending ezLead and email notification');

    try {
      // Prepare params for fortusService
      const params = userProductId 
        ? { userProductId, selectedQuote: orderData?.selectedQuote || null, recalculatedQuote: null } 
        : { productSlug: 'car-insurance', selectedQuote: orderData?.selectedQuote || null, recalculatedQuote: null };
      
      console.log('[FifteenMinutesRedirect] Request params:', params);
      
      // Call Fortus API to send the lead and email
      const result = await fortusService.requestCall(params);
      
      if (result.success) {
        console.log('[FifteenMinutesRedirect] Request successful:', result);
        setIsLoading(false);
        setIsSubmitted(true);
        message.success('Votre demande a été envoyée avec succès!');
        
        // Stay on this page to show contact information
        // No redirect needed
      } else {
        console.warn('[FifteenMinutesRedirect] Request failed:', result);
        setIsLoading(false);
        message.error(result.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('[FifteenMinutesRedirect] API error:', error);
      setIsLoading(false);
      message.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Extract dynamic data from API response
  const selectedQuote = orderData?.selectedQuote || {};
  const advisorInfo = orderData?.advisorInfo || {};
  
  // Insurer info
  const insurerLogo = selectedQuote.logo || '/images/courtika-assurances-inc.png';
  const insurerName = selectedQuote.insurerName || 'Courtika';
  
  // Company info
  const companyName = advisorInfo.companyName || 'Courtika Assurances Inc.';
  const companyLogo = advisorInfo.companyLogo || '/images/courtika-assurances-inc.png';
  const companyPhone = advisorInfo.phone || '1 (450) 762-9240';
  
  // Office hours
  const officeHours = advisorInfo.officeHours || {};
  const isOpen = officeHours.isOpen || false;
  const openStatus = isOpen ? 'Disponible maintenant' : 'Fermé actuellement';
  const formattedHours = officeHours.formattedToday || 'Ouvert aujourd\'hui de 8:30 - 16:30';
  const callDuration = advisorInfo.estimatedCallDuration || 'environ 15 min';
  
  // Generate phone link
  const phoneDigits = companyPhone.replace(/\D/g, '');
  const phoneLink = `tel:+${phoneDigits}`;

  // Show loading state
  if (loading) {
    return (
      <PageContent pageType="overview">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p style={{ marginTop: 20 }}>Chargement des informations...</p>
        </div>
      </PageContent>
    );
  }

  // Show error state (but continue with defaults)
  if (error) {
    console.warn('[FifteenMinutesRedirect] Error loading data, using defaults:', error);
  }

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        
        {/* Header Section */}
        <div className={styles.clockIconWrapper}>
          <ClockCircleOutlined className={styles.clockIcon} />
        </div>
        
        <h1 className={styles.mainTitle}>Vos soumissions ont expiré</h1>
        
        <p className={styles.subTitle}>
       Ne vous inquiétez pas! Vous n’avez pas perdu votre progression. Courtika peut continuer à magasiner avec vous et trouver encore plus d’options. Continuez avec eux en cliquant ci-dessous, et nous leur enverrons vos informations afin qu’un courtier puisse vous aider au téléphone.
        </p>

        <div className={styles.infoButton}>
          <SearchOutlined /> Courtika a accès à 30+ assureurs et pourrait peut-être vous trouver un meilleur prix
        </div>

        {/* Action Card */}
        <div className={styles.card}>
          {!isSubmitted ? (
            <>
              <h2 className={styles.cardTitleCenter}>Aimeriez-vous que Courtika continue à magasiner avec vous?</h2>
          
          <div className={styles.brokerHeader}>
            <div className={styles.courtikaLogoBox}>
              <img src={companyLogo} alt={companyName} className={styles.courtikaImageLogo} />
            </div>
            <div className={styles.statusInfo}>
              <div className={`${styles.statusBadge} ${!isOpenNow() ? styles.statusBadgeClosed : ''}`}>
                <div className={`${styles.statusDot} ${!isOpenNow() ? styles.statusDotClosed : ''}`}></div>
                {isOpenNow() ? 'Disponible maintenant' : 'Fermé maintenant'}
              </div>
              <div className={styles.statusSubtitle}>Courtiers certifiés prêts à vous aider</div>
            </div>
          </div>

          <div className={styles.reasonsBox}>
            <h3 className={styles.reasonsTitle}>Pourquoi parler à un courtier maintenant:</h3>
            <ul className={styles.reasonsList}>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Vos infos seront transmises</strong> - Pas besoin de tout répéter, le courtier aura votre dossier</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Service 100% gratuit</strong> - Aucun frais, aucune obligation</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Économisez votre temps</strong> - Un expert compare pour vous</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Conseils personnalisés</strong> - Adaptés à votre situation</span>
              </li>
              <li>
                <CheckOutlined className={styles.checkIcon} />
                <span><strong>Maximisez vos économies</strong> - Trouvez la meilleure couverture au meilleur prix</span>
              </li>
            </ul>
          </div>

              <Button type="primary" className={styles.primaryButton} size="large" onClick={handleSubmit} loading={isLoading}>
                {!isLoading && <CheckOutlined />}Oui, je veux magasiner avec Courtika
              </Button>
              <div className={styles.buttonSubtext}>
                Sans frais • Sans engagement • Vous gardez le contrôle
              </div>
            </>
          ) : (
            <>
              <div className={styles.successBanner}>
                <CheckOutlined className={styles.successIcon} />
                <div className={styles.successContent}>
                  <h3 className={styles.successTitle}>Vos informations ont été transmises à Courtika!</h3>
                  <p className={styles.successText}>Un courtier attend <strong>votre appel</strong> pour vous aider à trouver le meilleur prix</p>
                </div>
              </div>

              <h2 className={styles.submittedCardTitle}>Coordonnées de Courtika:</h2>
              
              <div className={styles.statusSectionLeft}>
                <div className={styles.courtikaLogoBoxLeft}>
                  <img src={companyLogo} alt={companyName} className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfoLeft}>
                  <div className={`${styles.statusBadge} ${!isOpenNow() ? styles.statusBadgeClosed : ''}`}>
                    <div className={`${styles.statusDot} ${!isOpenNow() ? styles.statusDotClosed : ''}`}></div>
                    {isOpenNow() ? 'Disponible maintenant' : 'Fermé maintenant'}
                  </div>
                  <div className={styles.statusSubtitleLeft}>Courtiers certifiés prêts à vous aider</div>
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
                  <span className={styles.infoText}>Durée de l'appel: {callDuration}</span>
                </li>
                <li>
                  <InfoCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={styles.primaryButton} size="large" href={phoneLink}>
                  <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: {companyPhone}
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

        {/* Why clients choose Courtika Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>Pourquoi continuer à magasiner avec Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 30+ assureurs.
          </p>

          <div className={styles.benefitsBox}>
            <h3 className={styles.benefitsBoxTitle}>Ce que Courtika peut faire pour vous:</h3>
            <ul className={styles.benefitsBoxList}>
              <li>
                 <SearchOutlined className={styles.benefitsBoxIcon} />
                 <span><strong>Continuer à magasiner</strong> : Les courtiers pourraient peut-être vous trouver un meilleur prix</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                   <path d="M9 22v-4h6v4"></path>
                   <path d="M8 6h.01"></path>
                   <path d="M16 6h.01"></path>
                   <path d="M12 6h.01"></path>
                   <path d="M12 10h.01"></path>
                   <path d="M12 14h.01"></path>
                   <path d="M16 10h.01"></path>
                   <path d="M16 14h.01"></path>
                   <path d="M8 10h.01"></path>
                   <path d="M8 14h.01"></path>
                 </svg>
                 <span><strong>Accès à 30+ assureurs</strong> : incluant des marchés spécialisés difficiles à trouver</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                   <circle cx="9" cy="7" r="4"></circle>
                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                 </svg>
                 <span><strong>90+ courtiers qualifiés</strong> : toujours à l'avant-garde du service et de l'expertise</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <circle cx="12" cy="8" r="7"></circle>
                   <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                 </svg>
                 <span><strong>Personnaliser vos protections</strong> : Ajustez votre couverture selon vos besoins réels</span>
              </li>
            </ul>
          </div>
          
          <div className={styles.certificationSection}>
            <div>
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

export default FifteenMinutesRedirect;
