import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { Button, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import styles from './CallConfirmation.module.css';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';
import { getOrderDetails, checkPendingOrder } from '../../services/api/productOrderService';

const CallConfirmation = () => {
  const navigate = useNavigate();
  const { userProductId: urlUserProductId } = useParams();
  const initialized = useRef(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Appelez Courtika - Consumer App';
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
          console.log('[CallConfirmation] No userProductId in URL, checking for pending order...');
          const pendingOrderResponse = await checkPendingOrder('car-insurance');
          
          if (pendingOrderResponse.success && pendingOrderResponse.hasPendingOrder && pendingOrderResponse.userProductId) {
            productIdToFetch = pendingOrderResponse.userProductId;
            console.log('[CallConfirmation] Found pending order:', productIdToFetch);
          }
        }
        
        // If we have a productId, fetch order details
        if (productIdToFetch) {
          const response = await getOrderDetails(productIdToFetch);
          
          if (response.success) {
            setOrderData(response.data);
          } else {
            console.warn('[CallConfirmation] Failed to load order:', response.message);
            setError(response.message || 'Failed to load order details');
          }
        } else {
          // No order found, show page with defaults
          console.log('[CallConfirmation] No pending order found, showing defaults');
        }
      } catch (err) {
        console.error('[CallConfirmation] Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [urlUserProductId]);

  // Loading state
  if (loading) {
    return (
      <PageContent pageType="overview">
        <div className={styles.fallbackContainer}>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>Chargement de votre demande...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  // Extract data from orderData (or use defaults if no data)
  const selectedQuote = orderData?.selectedQuote || {};
  const advisorInfo = orderData?.advisorInfo || {};
  
  // Check if we have actual quote data (not just fallback)
  const hasQuoteData = orderData && orderData.selectedQuote && orderData.selectedQuote.insurerName;
  
  const insurerName = selectedQuote.insurerName || 'Intact Insurance';
  const isCourtikaSearch = selectedQuote.isCourtikaSearch || (insurerName && insurerName.toLowerCase().includes('courtika') && insurerName.toLowerCase().includes('magasiner'));
  const insurerLogo = selectedQuote.logo || '/images/intact-insurance.svg';
  
  // Only show price if it's not a general Courtika search (quote comparison)
  // Removed the hardcoded '90' default to avoid showing fake prices when data is missing
  const monthlyPrice = !isCourtikaSearch ? (selectedQuote.monthlyPrice || null) : null;
  const yearlyPrice = !isCourtikaSearch ? (selectedQuote.yearlyPrice || null) : null;
  const isIntactDiscount = selectedQuote.isIntactDiscount || false;
  
  // Advisor details
  const companyName = 'Courtika'; // Hardcoded
  const companyLogo = advisorInfo.logo || '/images/courtika-assurances-inc.png';
  const phone = '1 (450) 762-9240';
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneLink = `tel:+${phoneDigits}`;
  const isOpen = isOpenNow();
  const openStatus = isOpen ? 'Ouvert' : 'Fermé';
  const formattedHours = getFormattedTodayHours();
  const callDuration = advisorInfo.callDuration || 15;
    // Coverages
  const coverages = orderData?.coverages || [];

  // Format currency in French format (10 000$ instead of $10,000)
  const formatFrenchCurrency = (value) => {
    if (!value) return null;
    let numStr = String(value).replace(/[$,\s]/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return value;
    const formatted = num.toLocaleString('fr-CA', {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace(/,/g, ' ');
    return `${formatted}$`;
  };

  // Extract limit value from string like "$2,000,000/-$1"
  const extractLimitValue = (limit) => {
    if (!limit) return null;
    const parts = limit.split('/-');
    return parts[0].trim();
  };

  // Process coverages into display protections (same logic as results page)
  const protections = coverages.map(coverage => {
    // Handle both formats: order API uses 'id', quote API uses 'code'
    const code = String(coverage.id || coverage.code || '').toUpperCase();
    let title = code;
    let type = null;
    let coverageValue = null;

    // Coverage code mapping to French names
    const coverageInfo = {
      'TP': 'Responsabilité civile',
      'TPL': 'Responsabilité civile',
      'COL': 'Collision et renversement (B2)',
      'COLL': 'Collision et renversement (B2)',
      'CMP': 'Accidents sans collision ni renversement (B3)',
      'COMP': 'Accidents sans collision ni renversement (B3)',
      '34': 'Protection supplémentaire (FAQ 34)',
      '33': 'Assistance routière (FAQ 33)',
      '20': 'Assistance routière (FAQ 20)',
      '27': 'Assurance des personnes (FAQ 27)',
      'AB': 'Indemnités d\'accident',
      'DCPD': 'Indemnisation directe',
      'UA': 'Automobile non assurée',
      'SEF44': 'Protection de la famille',
    };

    // Check for PAK codes (pak12, pak7, etc.)
    const isPakCode = code.includes('PAK') || /PAK\d+/i.test(code);

    if (isPakCode) {
      title = 'Protections bonifiées';
      type = 'couverture';
      coverageValue = 'Inclus';
    } else if (coverageInfo[code]) {
      title = coverageInfo[code];
    }

    // Extract limit value — handle both formats:
    // Order API: limit1 = 2000000 (numeric)
    // Quote API: limit = "$2,000,000/-$1" (string)
    const getLimitValue = () => {
      if (coverage.limit1 && coverage.limit1 > 1) {
        return formatFrenchCurrency(coverage.limit1);
      }
      if (coverage.limit && coverage.limit !== '-$1/-$1') {
        const rawValue = extractLimitValue(coverage.limit);
        return formatFrenchCurrency(rawValue);
      }
      return null;
    };

    // Determine coverage value and type
    if (!isPakCode) {
      if (code === 'TP' || code === 'TPL') {
        type = 'couverture';
        coverageValue = getLimitValue();
      } else if (['CMP', 'COMP', 'COL', 'COLL'].includes(code)) {
        if (coverage.deductible && coverage.deductible !== -1) {
          type = 'franchise';
          coverageValue = formatFrenchCurrency(coverage.deductible);
        }
      } else if (['34', '33', '20', '27'].includes(code)) {
        type = 'couverture';
        coverageValue = getLimitValue();
      } else {
        // Default: try limit first, then deductible
        const limitVal = getLimitValue();
        if (limitVal) {
          type = 'couverture';
          coverageValue = limitVal;
        } else if (coverage.deductible && coverage.deductible !== -1) {
          type = 'franchise';
          coverageValue = formatFrenchCurrency(coverage.deductible);
        }
      }
    }

    return { title, type, coverageValue };
  }).filter(p => p.coverageValue); // Only show protections that have a value

  return (
    <PageContent pageType="overview">
      <div className={styles.fallbackContainer}>
        {/* Action Card */}
        <div className={styles.actionCard}>
          <div className={styles.successBanner}>
            <CheckOutlined className={styles.successIcon} />
          </div>
          
          <h1 className={styles.mainTitle}>Génial! Appelez {companyName} au <a href={phoneLink} className={styles.phoneNumberHighlight}>{phone}</a></h1>
          
          <p className={styles.subTitle}>
          Appelez {companyName} dès que possible. Nous leur avons transmis votre demande afin qu'un courtier en assurance de dommages puisse répondre à vos questions et finaliser les détails avec vous.
          </p>

          <div className={styles.cardLayout}>
            {/* Left Card: Votre sélection - Only show if we have actual quote data */}
            {hasQuoteData && (
            <div className={styles.selectionCard}>
              <h2 className={styles.cardHeading}>Votre sélection</h2>
              
              <div className={styles.insurerRow}>
                <div className={styles.insurerLeft}>
                  <div className={styles.insurerLogoBox}>
                    <img src={insurerLogo} alt={insurerName} className={styles.insurerLogo} />
                  </div>
                  <span className={styles.insurerName}>{insurerName}</span>
                </div>
                {monthlyPrice && (
                  <div className={styles.priceContainer}>
                    <span className={styles.priceMain}>{monthlyPrice}$/mois</span>
                    {yearlyPrice && <span className={styles.priceOld}>{yearlyPrice}$/an</span>}
                  </div>
                )}
              </div>
              
              {isIntactDiscount && (
                <div className={styles.discountBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.discountIcon}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Rabais Courtika appliqué
                </div>
              )}

              {protections.length > 0 && (
                <div className={styles.protectionsSection}>
                  <h3 className={styles.protectionsTitle}>Vos protections</h3>
                  <ul className={styles.protectionsList}>
                    {protections.map((protection, index) => (
                      <li key={index}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <div>
                          <span>{protection.title}</span>
                          {protection.coverageValue && (
                            <div className={styles.coverageDetail}>
                              {protection.type === 'franchise' ? 'Franchise' : 'Couverture'}:{'  '}
                              <strong>{protection.coverageValue}</strong>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            )}


            {/* Right Card: Broker Information */}
            <div className={styles.brokerCard}>
              <h2 className={styles.cardHeading}>Votre cabinet en assurance de dommages:</h2>
              
              <div className={styles.statusSectionLeft}>
                <div className={styles.courtikaLogo}>
                  <img src={companyLogo} alt={companyName} className={styles.courtikaImageLogo} />
                </div>
                <div className={styles.statusInfo}>
                  <div className={`${styles.statusBadge} ${!isOpen ? styles.statusBadgeClosed : ''}`}>
                    <div className={`${styles.statusDot} ${!isOpen ? styles.statusDotClosed : ''}`}></div>
                    {openStatus}
                  </div>
                </div>
              </div>

              <ul className={styles.infoList}>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <div>
                    <span className={styles.infoText}>{formattedHours}</span>
                    <a href="#" className={styles.infoLink} onClick={(e) => { e.preventDefault(); setIsScheduleOpen(true); }}>Voir l'horaire complet</a>
                  </div>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span className={styles.infoText}>Durée de l'appel : environ {callDuration} min</span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span className={styles.infoText}>Ayez votre permis de conduire et les papiers d'immatriculation du véhicule à portée de main.</span>
                </li>
                <li className={styles.desktopOnly}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div>
                     <span className={styles.infoText}>Ligne prioritaire : <a href={phoneLink} className={styles.infoLink} style={{display: 'inline', marginTop: '0', color: '#1f01c8'}}>{phone}</a></span>
                  </div>
                </li>
              </ul>

              <div className={styles.actionButtons}>
                <Button type="primary" className={`${styles.primaryButton} ${styles.mobileOnly}`} size="large" href={phoneLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIconLeft}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Appeler maintenant
                </Button>
                
                <Button className={styles.secondaryOutlineButton} size="large" onClick={() => navigate(`/schedule-call/${urlUserProductId || ''}`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.buttonIconLeft}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Planifier l'appel plus tard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Why clients choose Courtika Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>Pourquoi nos clients choisissent Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 30+ assureurs.
          </p>
          
          <a href="https://www.courtika.com" target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.globeIcon}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            www.courtika.com
          </a>

          <hr className={styles.separator} />

          <div className={styles.benefitsBox}>
            <h3 className={styles.benefitsBoxTitle}>Il vous facilite la vie! Le service chez Courtika, c'est :</h3>
            <ul className={styles.benefitsBoxList}>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <circle cx="12" cy="8" r="7"></circle>
                   <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                 </svg>
                 <span><strong>Plus de 50 ans d'expérience</strong> et 7 bureaux établis au Québec</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
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
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                   <circle cx="9" cy="7" r="4"></circle>
                   <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                   <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                 </svg>
                 <span><strong>90+ courtiers qualifiés</strong> : toujours à l'avant-garde du service et de l'expertise</span>
              </li>
              <li>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.benefitsBoxIcon}>
                   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                 </svg>
                 <span><strong>Disponible du lundi au vendredi par téléphone</strong> : 100% gratuit, aucun frais</span>
              </li>
            </ul>
          </div>
          
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

export default CallConfirmation;
