import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button, Spin, message } from 'antd';
import { ClockCircleOutlined, SearchOutlined, CheckOutlined, CalendarOutlined, InfoCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import styles from './FifteenMinutesRedirect.module.css';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';
import { getOrderDetails, checkPendingOrder } from '../../services/api/productOrderService';
import fortusService from '../../services/api/fortusService';

const FifteenMinutesRedirect = () => {
  const initialized = useRef(false);
  const navigate = useNavigate();
  const { userProductId: urlUserProductId } = useParams();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Vos soumissions ont expiré - Consumer App';
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        let productIdToFetch = urlUserProductId;
        
        // If no userProductId in URL, check for pending order
        if (!productIdToFetch) {
          console.log('[FifteenMinutesRedirect] No userProductId in URL, checking for pending order...');
          const pendingOrderResponse = await checkPendingOrder('car-insurance');
          
          if (pendingOrderResponse.success && pendingOrderResponse.hasPendingOrder && pendingOrderResponse.userProductId) {
            productIdToFetch = pendingOrderResponse.userProductId;
            console.log('[FifteenMinutesRedirect] Found pending order:', productIdToFetch);
          }
        }
        
        // If we have a productId, fetch order details
        if (productIdToFetch) {
          const response = await getOrderDetails(productIdToFetch);
          
          if (response.success) {
            setOrderData(response.data);
          } else {
            console.warn('[FifteenMinutesRedirect] Failed to load order:', response.message);
            setError(response.message || 'Failed to load order details');
          }
        } else {
          // No order found, show page with defaults
          console.log('[FifteenMinutesRedirect] No pending order found, showing defaults');
        }
      } catch (err) {
        console.error('[FifteenMinutesRedirect] Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [urlUserProductId]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Send ezLead request
      const result = await fortusService.requestCall({
        userProductId: urlUserProductId || orderData?.userProductId,
        productSlug: 'car-insurance'
      });
      
      if (result.success) {
        message.success('Votre demande a été envoyée avec succès!');
        
        // On mobile, trigger phone dialer
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = 'tel:+14507629240';
        }
        
        // Show success message
        setTimeout(() => {
          setIsLoading(false);
          setIsSubmitted(true);
        }, 2000);
      } else {
        message.error(result.message || 'Une erreur est survenue. Veuillez réessayer.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      message.error('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Loading state for initial data fetch
  if (loading) {
    return (
      <PageContent pageType="overview">
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>Chargement...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  // Extract data from orderData (or use defaults if no data)
  const advisorInfo = orderData?.advisorInfo || {};
  const companyName = 'Courtika'; // Hardcoded
  const companyLogo = advisorInfo.logo || '/images/courtika-assurances-inc.png';
  const phone = '1 (450) 762-9240';
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneLink = `tel:+${phoneDigits}`;
  const isOpen = isOpenNow();
  const openStatus = isOpen ? 'Disponible maintenant' : 'Fermé maintenant';
  const formattedHours = getFormattedTodayHours();
  const callDuration = advisorInfo.callDuration || 15;

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        
        {/* Header Section - Only show before submission */}
        {!isSubmitted && (
          <>
            <div className={styles.clockIconWrapper}>
              <ClockCircleOutlined className={styles.clockIcon} />
            </div>
            
            <h1 className={styles.mainTitle}>Vos soumissions ont expiré</h1>
            
            <p className={styles.subTitle}>
              Ne vous inquiétez pas! Vous n'avez pas perdu votre progression. {companyName} peut continuer à magasiner avec vous et trouver encore plus d'options. Continuez avec eux en cliquant ci-dessous, et nous leur enverrons vos informations afin qu'un courtier puisse vous aider au téléphone.
            </p>

            <div className={styles.infoButton}>
              <SearchOutlined /> {companyName} a accès à 30+ assureurs et pourrait peut-être vous trouver un meilleur prix
            </div>
          </>
        )}

        {/* Action Card */}
        <div className={styles.card}>
          {!isSubmitted ? (
            <>
              <h2 className={styles.cardTitleCenter}>Aimeriez-vous que {companyName} continue à magasiner avec vous?</h2>
          
          <div className={styles.brokerHeader}>
            <div className={styles.courtikaLogoBox}>
              <img src={companyLogo} alt={companyName} className={styles.courtikaImageLogo} />
            </div>
            <div className={styles.statusInfo}>
              <div className={`${styles.statusBadge} ${!isOpen ? styles.statusBadgeClosed : ''}`}>
                <div className={`${styles.statusDot} ${!isOpen ? styles.statusDotClosed : ''}`}></div>
                {openStatus}
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
                {!isLoading && <CheckOutlined />}Oui, je veux magasiner avec {companyName}
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
                  <h3 className={styles.successTitle}>Vos informations ont été transmises à {companyName}!</h3>
                  <p className={styles.successText}>Un courtier attend <strong>votre appel</strong> pour vous aider à trouver le meilleur prix</p>
                </div>
              </div>

              <h2 className={styles.submittedCardTitle}>Coordonnées de {companyName}:</h2>
              
              <div className={styles.statusSectionLeft}>
                <div className={styles.courtikaLogoBoxLeft}>
                  <img src={companyLogo} alt={companyName} className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfoLeft}>
                  <div className={`${styles.statusBadge} ${!isOpen ? styles.statusBadgeClosed : ''}`}>
                    <div className={`${styles.statusDot} ${!isOpen ? styles.statusDotClosed : ''}`}></div>
                    {openStatus}
                  </div>
                  <div className={styles.statusSubtitleLeft}>Courtiers certifiés prêts à vous aider</div>
                </div>
              </div>

              <ul className={styles.infoList}>
                <li>
                  <CalendarOutlined className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoText}>{formattedHours}</span>
                    <a href="#" className={styles.infoLink} onClick={(e) => { e.preventDefault(); setIsScheduleOpen(true); }}>Voir l'horaire complet</a>
                  </div>
                </li>
                <li>
                  <ClockCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Durée de l'appel : environ {callDuration} min</span>
                </li>
                <li>
                  <InfoCircleOutlined className={styles.infoIcon} />
                  <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                </li>
                <li className={styles.desktopOnly}>
                  <PhoneOutlined className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoText}>Ligne prioritaire : <a href={phoneLink} className={styles.infoLink} style={{display: 'inline', marginTop: '0', color: '#1f01c8'}}>{phone}</a></span>
                  </div>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={`${styles.primaryButton} ${styles.mobileOnly}`} size="large" href={phoneLink}>
                  <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: {phone}
                </Button>
                
                <Button className={styles.secondaryOutlineButton} size="large" onClick={() => navigate(`/schedule-call/${urlUserProductId || ''}`)}>
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
      
      {/* Loading Modal Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay} style={{ background: '#ffffff' }}>
          <div className={styles.loadingContent} style={{ background: '#ffffff' }}>
            <h3 className={styles.loadingText}>Nous vous connectons à un courtier..</h3>
            <img 
              src="/images/39259805852ef0453b2b0f98eee91406934e42f6.gif" 
              alt="Loading" 
              className={styles.loadingGif}
            />
          </div>
        </div>
      )}
      
      <ScheduleModal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
    </PageContent>
  );
};

export default FifteenMinutesRedirect;
