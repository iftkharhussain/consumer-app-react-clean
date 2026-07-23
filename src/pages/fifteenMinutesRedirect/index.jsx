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
import { fetchQuote } from '../../services/api/quoteService';
import useQuote from '../../hooks/useQuote';

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
  const [selectedOption, setSelectedOption] = useState('call');

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
      document.title = 'Vos soumissions ont expiré - Norga';
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        let productIdToFetch = effectiveUserProductId;

        // If still no userProductId, check for pending order (last resort)
        if (!productIdToFetch) {
          const pendingOrderResponse = await checkPendingOrder('car-insurance');

          if (pendingOrderResponse.success && pendingOrderResponse.hasPendingOrder && pendingOrderResponse.userProductId) {
            productIdToFetch = pendingOrderResponse.userProductId;
          }
        }

        // If we have a productId, fetch order details
        if (productIdToFetch) {
          const response = await getOrderDetails(productIdToFetch);

          if (response.success) {
            setOrderData(response.data);
          } else {
            setError(response.message || 'Failed to load order details');
          }
        }
      } catch (err) {
        console.error('[FifteenMinutesRedirect] Error fetching order details:', err);
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

      // Fetch quote details to find lowest price carrier
      let carrierCode = null;
      if (productId) {
        try {
          const quoteResponse = await fetchQuote('car-insurance');

          if (quoteResponse.success && quoteResponse.quote?.carriers) {
            // Filter available carriers with valid premium (same logic as Results page)
            const availableCarriers = quoteResponse.quote.carriers.filter(r => {
              const isAvailable = r.available === true || r.status === 'success';
              const hasPremium = (r.annualPremium || r.premium || 0) > 0;
              return isAvailable && hasPremium;
            });

            if (availableCarriers.length > 0) {
              // Transform carriers using EXACT same logic as Results page
              const transformedCarriers = availableCarriers.map((carrier, index) => {
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

              // Sort by monthly price (same as Results page)
              const sortedCarriers = transformedCarriers.sort((a, b) => a.monthlyPrice - b.monthlyPrice);

              // Select cheapest (first in sorted list)
              const cheapest = sortedCarriers[0];
              carrierCode = cheapest.carrierCode;
            }
          }
        } catch (quoteError) {
          console.error('[FifteenMinutesRedirect] Error fetching quote:', quoteError.message);
          // Continue without carrierCode - backend will use default
        }
      }

      // Send ezLead request
      const result = await fortusService.requestCall({
        userProductId: productId,
        productSlug: 'car-insurance',
        carrierCode // Pass the lowest price carrier
      });

      if (result.success) {
        message.success('Votre demande a été envoyée avec succès!');

        // On mobile, trigger phone dialer
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          fortusService.trackEvent(productId, 'call', {
            buttonName: 'Auto-dial (Mobile)',
            position: '15 Minutes Redirect Page',
            insurerName: 'Courtika'
          }).catch(err => console.error('Error tracking call event:', err));
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
              <SearchOutlined /> {companyName} a accès à 10+ assureurs et pourrait peut-être vous trouver un meilleur prix
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

              {/* How do you want to proceed — 2 selectable options */}
              <h3 className={styles.proceedTitle}>Comment voulez-vous procéder ?</h3>

              <div className={styles.optionsContainer}>
                {/* Option 1 — Call Now */}
                <div
                  key="opt-call"
                  className={`${styles.optionCard} ${selectedOption === 'call' ? styles.optionCardSelected : ''}`}
                  onClick={() => setSelectedOption('call')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.optionLeftGroup}>
                    <div className={styles.optionRadio}>
                      <div className={`${styles.optionRadioDot} ${selectedOption === 'call' ? styles.optionRadioDotSelected : ''}`} />
                    </div>
                    <div className={`${styles.optionIcon} ${selectedOption === 'call' ? styles.optionIconSelected : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 19 19" fill="none">
                        <path d="M17.4064 13.2694V15.7694C17.4074 16.0014 17.3598 16.2312 17.2669 16.4438C17.1739 16.6565 17.0375 16.8473 16.8665 17.0042C16.6955 17.1611 16.4936 17.2806 16.2737 17.3549C16.0539 17.4293 15.8209 17.4569 15.5898 17.436C13.0255 17.1574 10.5623 16.2811 8.3981 14.8777C6.38463 13.5982 4.67755 11.8912 3.39811 9.87769C1.98975 7.70369 1.11331 5.22851 0.839772 2.65268C0.818947 2.42224 0.846334 2.18999 0.920189 1.97071C0.994043 1.75143 1.11275 1.54993 1.26874 1.37904C1.42474 1.20815 1.61461 1.07161 1.82626 0.97812C2.03792 0.88463 2.26672 0.836236 2.49811 0.836018H4.99811C5.40253 0.832038 5.7946 0.97525 6.10124 1.23896C6.40788 1.50267 6.60817 1.86889 6.66477 2.26935C6.77029 3.06941 6.96598 3.85496 7.24811 4.61102C7.36022 4.90929 7.38449 5.23345 7.31803 5.54508C7.25156 5.85672 7.09716 6.14278 6.8731 6.36935L5.81477 7.42768C7.00107 9.51397 8.72848 11.2414 10.8148 12.4277L11.8731 11.3694C12.0997 11.1453 12.3857 10.9909 12.6974 10.9244C13.009 10.858 13.3332 10.8822 13.6314 10.9944C14.3875 11.2765 15.1731 11.4722 15.9731 11.5777C16.3779 11.6348 16.7476 11.8387 17.0119 12.1506C17.2762 12.4625 17.4166 12.8607 17.4064 13.2694Z" stroke={selectedOption === 'call' ? 'white' : '#6b7280'} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.optionText}>
                      <span className={styles.optionLabel}>Appeler maintenant</span>
                      <span className={styles.optionSubLabel}>Ligne d'appel prioritaire</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div className={styles.optionBadge}>
                      <span className={styles.optionBadgeDot} />
                      Disponible maintenant
                    </div>
                  )}
                </div>

                {/* Option 2 — Schedule */}
                <div
                  key="opt-schedule"
                  className={`${styles.optionCard} ${selectedOption === 'schedule' ? styles.optionCardSelected : ''}`}
                  onClick={() => setSelectedOption('schedule')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.optionLeftGroup}>
                    <div className={styles.optionRadio}>
                      <div className={`${styles.optionRadioDot} ${selectedOption === 'schedule' ? styles.optionRadioDotSelected : ''}`} />
                    </div>
                    <div className={`${styles.optionIcon} ${selectedOption === 'schedule' ? styles.optionIconSelected : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6.66406 1.66406V4.9974" stroke={selectedOption === 'schedule' ? 'white' : '#697586'} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.3359 1.66406V4.9974" stroke={selectedOption === 'schedule' ? 'white' : '#697586'} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15.8333 3.33594H4.16667C3.24619 3.33594 2.5 4.08213 2.5 5.0026V16.6693C2.5 17.5897 3.24619 18.3359 4.16667 18.3359H15.8333C16.7538 18.3359 17.5 17.5897 17.5 16.6693V5.0026C17.5 4.08213 16.7538 3.33594 15.8333 3.33594Z" stroke={selectedOption === 'schedule' ? 'white' : '#697586'} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.5 8.33594H17.5" stroke={selectedOption === 'schedule' ? 'white' : '#697586'} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles.optionText}>
                      <span className={styles.optionLabel}>Planifier un appel plus tard</span>
                      <span className={styles.optionSubLabel}>Choisissez votre créneau</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="primary"
                className={styles.primaryButton}
                size="large"
                loading={isLoading}
                onClick={() => {
                  if (selectedOption === 'call') {
                    handleSubmit();
                  } else {
                    navigate(`/schedule-call/${effectiveUserProductId || ''}`);
                  }
                }}
              >
                {!isLoading && selectedOption === 'call' && (
                  <span key="call-btn-text" className={styles.primaryButtonText}>
                    Appeler Maintenant
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4.16406 10H15.8307" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 4.16406L15.8333 9.9974L10 15.8307" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
                {!isLoading && selectedOption === 'schedule' && (
                  <span key="sched-btn-text" className={styles.primaryButtonText}>
                    Planifier l'appel
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4.16406 10H15.8307" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 4.16406L15.8333 9.9974L10 15.8307" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
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
                    <span className={styles.infoText}>Ligne prioritaire : <a href={phoneLink} className={styles.infoLink} style={{ display: 'inline', marginTop: '0', color: '#1f01c8' }} onClick={() => {
                      const productId = effectiveUserProductId || orderData?.userProductId;
                      if (productId) {
                        fortusService.trackEvent(productId, 'call', { buttonName: 'Ligne prioritaire', position: '15 Minutes Redirect Page', insurerName: 'Courtika' }).catch(console.error);
                      }
                    }}>{phone}</a></span>
                  </div>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={`${styles.primaryButton} ${styles.mobileOnly}`} size="large" href={phoneLink} onClick={() => {
                  const productId = effectiveUserProductId || orderData?.userProductId;
                  if (productId) {
                    fortusService.trackEvent(productId, 'call', { buttonName: 'Appeler maintenant (Mobile Button)', position: '15 Minutes Redirect Page', insurerName: 'Courtika' }).catch(console.error);
                  }
                }}>
                  <PhoneOutlined className={styles.phoneIcon} /> Appeler maintenant: {phone}
                </Button>

                <Button className={styles.secondaryOutlineButton} size="large" onClick={() => navigate(`/schedule-call/${effectiveUserProductId || ''}`)}>
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
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 10+ assureurs.
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
