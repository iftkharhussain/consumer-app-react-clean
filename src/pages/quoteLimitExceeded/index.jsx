import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button, Spin, message } from 'antd';
import { 
  ClockCircleOutlined, 
  SearchOutlined, 
  CheckOutlined, 
  CalendarOutlined, 
  InfoCircleOutlined, 
  PhoneOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import styles from './QuoteLimitExceeded.module.css';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';
import { getOrderDetails, checkPendingOrder } from '../../services/api/productOrderService';
import fortusService from '../../services/api/fortusService';
import { fetchQuote } from '../../services/api/quoteService';
import useQuote from '../../hooks/useQuote';

const QuoteLimitExceeded = () => {
  const initialized = useRef(false);
  const navigate = useNavigate();
  const { userProductId: urlUserProductId } = useParams();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Fetch user's quote to get userProductId if not in URL
  const {
    userProductId: quoteUserProductId,
    quoteData,
    hasQuote
  } = useQuote('car-insurance', { autoFetch: true });

  // Use URL param first, fallback to quote hook
  const effectiveUserProductId = urlUserProductId || quoteUserProductId;

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Limite de soumissions atteinte - Norga';
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        let productIdToFetch = effectiveUserProductId;
        if (!productIdToFetch) {
          const pendingOrderResponse = await checkPendingOrder('car-insurance');
          if (pendingOrderResponse.success && pendingOrderResponse.hasPendingOrder && pendingOrderResponse.userProductId) {
            productIdToFetch = pendingOrderResponse.userProductId;
          }
        }
        if (productIdToFetch) {
          const response = await getOrderDetails(productIdToFetch);
          if (response.success) {
            setOrderData(response.data);
          } else {
            setError(response.message || 'Failed to load order details');
          }
        }
      } catch (err) {
        console.error('[QuoteLimitExceeded] Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [effectiveUserProductId]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const productId = effectiveUserProductId || orderData?.userProductId;
      
      let carrierCode = null;
      if (productId) {
        try {
          const quoteResponse = await fetchQuote('car-insurance');
          if (quoteResponse.success && quoteResponse.quote?.carriers) {
            const availableCarriers = quoteResponse.quote.carriers.filter(r => {
              const isAvailable = r.available === true || r.status === 'success';
              const hasPremium = (r.annualPremium || r.premium || 0) > 0;
              return isAvailable && hasPremium;
            });
            if (availableCarriers.length > 0) {
              const transformedCarriers = availableCarriers.map((carrier) => {
                const annual = carrier.annualPremium || carrier.premium || 0;
                const monthly = carrier.monthlyPremium || Math.round(annual / 12);
                return {
                  carrierCode: carrier.carrierCode,
                  name: carrier.carrierName || carrier.name,
                  monthlyPrice: monthly,
                  annualPrice: annual,
                  originalData: carrier
                };
              });
              const sortedCarriers = transformedCarriers.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
              carrierCode = sortedCarriers[0].carrierCode;
            }
          }
        } catch (quoteError) {
          console.error('[QuoteLimitExceeded] Error fetching quote:', quoteError.message);
        }
      }
      
      const result = await fortusService.requestCall({
        userProductId: productId,
        productSlug: 'car-insurance',
        carrierCode,
        position: 'Quote Limit Exceeded Page',
        buttonName: 'Oui, je veux magasiner avec Courtika'
      });
      
      if (result.success) {
        message.success('Votre demande a été envoyée avec succès!');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          fortusService.trackEvent(productId, 'call', {
            buttonName: 'Auto-dial (Mobile)',
            position: 'Quote Limit Exceeded Page',
            insurerName: 'Courtika'
          }).catch(err => console.error('Error tracking call event:', err));
          window.location.href = 'tel:+14507629240';
        }
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

  const advisorInfo = orderData?.advisorInfo || {};
  const companyName = 'Courtika';
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
        
        {!isSubmitted && (
          <>
            <div className={styles.clockIconWrapper}>
              <ClockCircleOutlined className={styles.clockIcon} />
            </div>
            
            <h1 className={styles.mainTitle}>Limite de soumissions atteinte</h1>
            
            <p className={styles.subTitle}>
            Vous avez atteint votre limite de 3 soumissions en ligne. Pour obtenir des soumissions supplémentaires, Courtika peut recevoir vos informations et continuer à magasiner pour vous.
            </p>

            <div className={styles.infoButton}>
              <SearchOutlined /> Obtenez plus de soumissions avec l'aide d'un courtier certifié
            </div>
          </>
        )}

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
                    <span className={styles.infoText}>Ligne prioritaire : <a href={phoneLink} className={styles.infoLink} style={{display: 'inline', marginTop: '0', color: '#1f01c8'}} onClick={() => {
                      const productId = effectiveUserProductId || orderData?.userProductId;
                      if (productId) {
                        fortusService.trackEvent(productId, 'call', { buttonName: 'Ligne prioritaire', position: 'Quote Limit Exceeded Page', insurerName: 'Courtika' }).catch(console.error);
                      }
                    }}>{phone}</a></span>
                  </div>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={`${styles.primaryButton} ${styles.mobileOnly}`} size="large" href={phoneLink} onClick={() => {
                  const productId = effectiveUserProductId || orderData?.userProductId;
                  if (productId) {
                    fortusService.trackEvent(productId, 'call', { buttonName: 'Appeler maintenant (Mobile Button)', position: 'Quote Limit Exceeded Page', insurerName: 'Courtika' }).catch(console.error);
                  }
                }}>
                  <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: {phone}
                </Button>
                
                <Button className={styles.secondaryOutlineButton} size="large" onClick={() => {
                  localStorage.setItem('lead_source_page', 'Quote Limit Exceeded Page');
                  localStorage.setItem('lead_source_button', "Planifier l'appel plus tard");
                  navigate(`/schedule-call/${effectiveUserProductId || ''}`);
                }}>
                  <CalendarOutlined /> Planifier l'appel plus tard
                </Button>
              </div>
            </>
          )}
        </div>

        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>Pourquoi continuer à magasiner avec {companyName}</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 10+ assureurs.
          </p>

          <div className={styles.benefitsBox}>
            <h3 className={styles.benefitsBoxTitle}>Ce que {companyName} peut faire pour vous:</h3>
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
                 <span><strong>Accès à 10+ assureurs</strong> : incluant des marchés spécialisés difficiles à trouver</span>
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
              <h4 className={styles.certTitle}>{companyName} est certifié par l'AMF</h4>
              <p className={styles.certSubtitle}>Autorité des marchés financiers du Québec</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
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

export default QuoteLimitExceeded;
