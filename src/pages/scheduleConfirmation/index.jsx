import React, { useEffect, useRef, useState } from 'react';
import { PageContent } from 'components';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Spin, Button, message } from 'antd';
import styles from './ScheduleConfirmation.module.css';
import ScheduleModal from '../../components/fallbackquote/ScheduleModal';
import { getFormattedTodayHours } from '../../utils/businessHours';
import { getOrderDetails, checkPendingOrder, sendConfirmationEmail } from '../../services/api/productOrderService';
import fortusService from '../../services/api/fortusService';
import { trackPixelEventOnce } from '../../utils/pixel';
import { trackTikTokEventOnce } from '../../utils/tiktokPixel';
import { getQuoteDetails } from '../../services/api/quoteService';
import { buildProtections } from '../../utils/quoteProtections';

const sentEmailCache = new Set();

const ScheduleConfirmation = () => {
  const navigate = useNavigate();
  const { userProductId: urlUserProductId } = useParams();
  const initialized = useRef(false);
  const ezLeadSent = useRef(false);
  const meetingTracked = useRef(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const [searchParams] = useSearchParams();
  
  // Extract Calendly details from URL
  const eventStartTime = searchParams.get('event_start_time');
  const eventEndTime = searchParams.get('event_end_time');
  const eventType = searchParams.get('event_type_name');

  useEffect(() => {
    // If the page is loaded inside an iframe (e.g. within Calendly widget),
    // redirect the parent window to this URL to escape the iframe.
    if (window.self !== window.top) {
      try {
        window.parent.location.href = window.location.href;
      } catch (e) {
        console.error('Failed to redirect parent window:', e);
      }
    }

    if (!initialized.current) {
      document.title = 'Rendez-vous confirmé - Norga';
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        let productIdToFetch = urlUserProductId;
        
        // Check localStorage first as a fallback
        if (!productIdToFetch) {
          productIdToFetch = localStorage.getItem('pending_user_product_id');
          if (productIdToFetch) {
            console.log('[ScheduleConfirmation] Found productId in localStorage:', productIdToFetch);
          }
        }
        
        // If still no userProductId, check for pending order via API
        if (!productIdToFetch) {
          console.log('[ScheduleConfirmation] No ID found, checking for pending order API...');
          const pendingOrderResponse = await checkPendingOrder('car-insurance');
          
          if (pendingOrderResponse.success && pendingOrderResponse.hasPendingOrder && pendingOrderResponse.userProductId) {
            productIdToFetch = pendingOrderResponse.userProductId;
            console.log('[ScheduleConfirmation] Found pending order from API:', productIdToFetch);
          }
        }
        
        // If we have a productId, fetch order details
        if (productIdToFetch) {
          const response = await getOrderDetails(productIdToFetch);
          
          if (response.success) {
            setOrderData(response.data);
            localStorage.removeItem('pending_user_product_id');
          } else {
            console.warn('[ScheduleConfirmation] Failed to load order:', response.message);
            setError(response.message || 'Failed to load order details');
          }
        } else {
          // No order found, show page with defaults
          console.log('[ScheduleConfirmation] No pending order found, showing defaults');
        }
      } catch (err) {
        console.error('[ScheduleConfirmation] Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [urlUserProductId]);

  // Auto-send ezLead on mount (after Calendly booking)
  useEffect(() => {
    const sendEzLead = async () => {
      // Prevent duplicate sends
      if (ezLeadSent.current) return;
      
      // Wait for orderData to be loaded
      if (loading || !orderData) return;
      
      const userProductId = urlUserProductId || orderData?.userProductId;
      if (!userProductId) {
        console.warn('[ScheduleConfirmation] No userProductId available to send ezLead');
        return;
      }
      
      try {
        ezLeadSent.current = true; // Mark as sent to prevent duplicates
        setIsLoading(true);
        
        console.log('[ScheduleConfirmation] Auto-sending ezLead for userProductId:', userProductId);
        
        // Fetch quote details to find lowest price carrier
        let carrierCode = null;
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
              console.log('\n🔍 [ScheduleConfirmation DEBUG] ===================');
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
          console.warn('[ScheduleConfirmation] Could not fetch quote details:', quoteError);
          // Continue without carrierCode - backend will use default
        }
        
        console.log('\n🚀 [ScheduleConfirmation] SENDING REQUEST:', {
          carrierCode: carrierCode || 'not specified (backend will use cheapest)',
          userProductId: userProductId,
          productSlug: 'car-insurance'
        });
        
        // Human-readable meeting date from the Calendly start time
        let meetingDate = null;
        if (eventStartTime) {
          try {
            const date = new Date(eventStartTime);
            const datePart = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long' }).format(date);
            const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
            meetingDate = `${datePart} • ${timePart}`;
          } catch {
            meetingDate = null;
          }
        }
        
        const result = await fortusService.requestCall({
          userProductId,
          productSlug: 'car-insurance',
          carrierCode, // Pass the lowest price carrier
          emailType: 'meeting',
          meetingDate
        });
        
        if (result.success) {
          console.log('[ScheduleConfirmation] ezLead sent successfully');
          message.success('Vos informations ont été transmises au courtier!');
          
          // Track successful conversion using standard 'Schedule' event
          trackPixelEventOnce('Schedule', {
            insurer: orderData?.selectedQuote?.insurerName,
            carrierCode: orderData?.selectedQuote?.carrierCode,
            eventType: eventType,
            userProductId: userProductId
          });
          trackTikTokEventOnce('Schedule', {
            insurer: orderData?.selectedQuote?.insurerName,
            carrierCode: orderData?.selectedQuote?.carrierCode,
            eventType: eventType,
            userProductId: userProductId
          });
          
          // Track meeting event for analytics (only once, prevents duplicates)
          if (!meetingTracked.current) {
            meetingTracked.current = true;
            console.log('[ScheduleConfirmation] Tracking meeting event for userProductId:', userProductId);
            
            const trackResult = await fortusService.trackEvent(userProductId, 'meeting', {
              buttonName: 'Planifier un appel plus tard',
              position: 'Schedule Confirmation Page',
              insurerName: orderData?.selectedQuote?.insurerName || orderData?.selectedQuote?.carrierName
            });
            
            if (trackResult.success) {
              if (trackResult.alreadyExists) {
                console.log('[ScheduleConfirmation] Meeting event already tracked');
              } else {
                console.log('[ScheduleConfirmation] Meeting event tracked successfully');
              }
            } else {
              console.warn('[ScheduleConfirmation] Failed to track meeting event:', trackResult.message);
            }
          }
        } else {
          console.error('[ScheduleConfirmation] Failed to send ezLead:', result.message);
        }
      } catch (error) {
        console.error('[ScheduleConfirmation] Error sending ezLead:', error);
      } finally {
        // Hide loading modal after 2 seconds
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };
    
    sendEzLead();
  }, [loading, orderData, urlUserProductId]);


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

  // Error state
  if (error && orderData === null) {
    return (
      <PageContent pageType="overview">
        <div className={styles.fallbackContainer}>
          <div className={styles.actionCard}>
            <h1 className={styles.mainTitle} style={{ color: '#dc2626' }}>Erreur</h1>
            <p className={styles.subTitle}>{error}</p>
            <Button type="primary" onClick={() => navigate('/result')} style={{ marginTop: '20px' }}>
              Retour aux résultats
            </Button>
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
  
  const isCourtikaSearch =
    selectedQuote.selectionType === 'courtika'
    || selectedQuote.selectionType === 'personalize'
    || selectedQuote.isCourtikaSearch
    || (selectedQuote.insurerName
        && selectedQuote.insurerName.toLowerCase().includes('courtika')
        && selectedQuote.insurerName.toLowerCase().includes('magasiner'));
  const insurerName = isCourtikaSearch
    ? "Magasiner plus d'options avec Courtika"
    : (selectedQuote.insurerName || 'Intact Insurance');
  const insurerLogo = isCourtikaSearch
    ? '/images/courtika-assurances-inc.png'
    : (selectedQuote.logo || '/images/intact-insurance.svg');

  const monthlyPrice = !isCourtikaSearch ? (selectedQuote.monthlyPrice || null) : null;
  const yearlyPrice = !isCourtikaSearch ? (selectedQuote.yearlyPrice || null) : null;
  const oldMonthlyPrice = !isCourtikaSearch ? (selectedQuote.oldMonthlyPrice || null) : null;
  const hasDiscount = !isCourtikaSearch && (selectedQuote.discount || false);
  const discountLabel = selectedQuote.discountLabel || 'Rabais 1 mois gratuit';
  const discountBonus = selectedQuote.discountBonus || null;
  // Advisor details
  const companyName = 'Courtika'; // Hardcoded
  const companyLogo = advisorInfo.logo || '/images/courtika-assurances-inc.png';
  const phone = '1 (450) 762-9240';
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneLink = `tel:+${phoneDigits}`;
  const formattedHours = getFormattedTodayHours();
  const callDuration = 15; // Set to 15 as requested
  
  // Coverages — hidden for Courtika flow (cheapest carrier still in orderData for email/analytics)
  const coverages = isCourtikaSearch ? [] : (orderData?.coverages || []);

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
      '34': 'Assurance de personnes (FAQ 34)',
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
      type = null;
      coverageValue = null;
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

    return { title, type, coverageValue, code, isPak: isPakCode };
  }).filter(p => p.coverageValue || p.isPak);

  // Deduplicate protections based on code, coverage value, and type
  // When there are multiple vehicles, same coverages appear multiple times
  const uniqueProtections = [];
  const seen = new Set();

  protections.forEach(protection => {
    // Create a unique key based on code, coverage value, and type
    const key = `${protection.code}-${protection.coverageValue || 'none'}-${protection.type || 'none'}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueProtections.push(protection);
    }
  });

  // Sort unique protections
  const sortedProtections = uniqueProtections.sort((a, b) => {
    // Sort order: TP, COL, CMP, other coverages, PAK at the end
    const sortOrder = ['TP', 'TPL', 'COL', 'COLL', 'CMP', 'COMP'];

    // PAK always goes to the end
    if (a.isPak && !b.isPak) return 1;
    if (!a.isPak && b.isPak) return -1;

    // Both are PAK or both are not PAK
    const aIndex = sortOrder.indexOf(a.code);
    const bIndex = sortOrder.indexOf(b.code);

    // If both are in sortOrder, use that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only a is in sortOrder, it comes first
    if (aIndex !== -1) return -1;

    // If only b is in sortOrder, it comes first
    if (bIndex !== -1) return 1;

    // Neither in sortOrder, maintain original order
    return 0;
  });

  // Function to format meeting details from Calendly params
  const formatMeetingDetails = () => {
    if (!eventStartTime) return "Le courtier vous appellera à l'heure sélectionnée";

    try {
      const date = new Date(eventStartTime);
      
      // Calculate duration if end time is available
      let displayDuration = callDuration;
      if (eventEndTime) {
        const endDate = new Date(eventEndTime);
        const diffMs = endDate - date;
        const diffMins = Math.round(diffMs / 60000);
        if (diffMins > 0) displayDuration = diffMins;
      }
      
      // French format: "23 mars"
      const dateFormatter = new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long' });
      const datePart = dateFormatter.format(date);
      
      // Time format: "9:00 AM" (using en-US for AM/PM style but could be fr-CA for "09:00")
      const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const timePart = timeFormatter.format(date);
      
      return `${datePart} • ${timePart} • ${displayDuration} min`;
    } catch (e) {
      console.error('Error formatting meeting date:', e);
      return "Détails à confirmer";
    }
  };

  return (
    <PageContent pageType="overview">
      <div className={styles.fallbackContainer}>
        {/* Action Card */}
        <div className={styles.actionCard}>
          <div className={styles.successBanner}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.successIcon}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h1 className={styles.mainTitle}>Génial! Votre rendez-vous téléphonique est confirmé.</h1>
          
          <p className={styles.subTitle}>
            Nous avons envoyé votre demande à un courtier en assurance de dommages chez {companyName}. Celui-ci vous appellera au moment prévu pour répondre à vos questions et finaliser les détails.
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
                    {/* {hasDiscount && oldMonthlyPrice && (
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '16px', fontWeight: 600, marginRight: '4px' }}>
                        {oldMonthlyPrice}$/mois
                      </span>
                    )} */}
                    <span className={styles.priceMain}>{monthlyPrice}$/mois</span>
                    {yearlyPrice && <span className={styles.priceOld}>{yearlyPrice}$/an</span>}
                  </div>
                )}
              </div>
              
              {hasDiscount && (
                <>
                  <div className={styles.discountBadge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.discountIcon}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {discountLabel}
                  </div>
                  {discountBonus && (
                    <p style={{ fontSize: '12px', color: '#697586', marginTop: '6px', lineHeight: 1.5 }}>{discountBonus}</p>
                  )}
                </>
              )}

              {sortedProtections.length > 0 && (
                <div className={styles.protectionsSection}>
                  <h3 className={styles.protectionsTitle}>Vos protections</h3>
                  <ul className={styles.protectionsList}>
                    {sortedProtections.map((protection, index) => (
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
              <h2 className={styles.cardHeading}>Détails de votre rendez-vous:</h2>
              
              <div className={styles.brokerBox}>
                <div className={styles.brokerBoxLogo}>
                  <img src="/images/courtika-assurances-inc.png" alt="Courtika" />
                </div>
                <div>
                  <div className={styles.brokerBoxTitle}>Courtika</div>
                  <div className={styles.brokerBoxSubtitle}>Cabinet en assurance de dommages</div>
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
                    <span className={styles.infoText}>{formatMeetingDetails()}</span>
                    <div className={styles.infoSubtext}>Le courtier vous appellera à ce moment</div>
                  </div>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div>
                    <span className={styles.infoText}>{getFormattedTodayHours()}</span>
                    <a href="#" className={styles.infoLink} onClick={(e) => { e.preventDefault(); setIsScheduleOpen(true); }}>Voir l'horaire complet</a>
                  </div>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div>
                     <span className={styles.infoText}>Ligne prioritaire : <a href="tel:+14507629240" className={styles.infoLink} style={{display: 'inline', marginTop: '0', color: '#1f01c8'}}>1 (450) 762-9240</a></span>
                  </div>
                </li>
              </ul>

              <div className={styles.prepBox}>
                <h4 className={styles.prepBoxTitle}>Avant l'appel, ayez à portée de main:</h4>
                <ul className={styles.prepBoxList}>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.prepBoxIcon}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Votre permis de conduire</span>
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.prepBoxIcon}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Les papiers d'immatriculation du véhicule</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Why clients choose Courtika Card */}
        <div className={styles.aboutCard}>
          <h2 className={styles.aboutTitle}>Pourquoi nos clients choisissent Courtika</h2>
          <p className={styles.aboutText}>
            Un cabinet de courtage en assurance de dommages avec plus de 50 ans d'expérience et 90+ courtiers qui comparent pour vous auprès de 10+ assureurs.
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
                 <span><strong>Accès à 10+ assureurs</strong> : incluant des marchés spécialisés difficiles à trouver</span>
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
      
      {/* Loading Modal Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay} style={{ background: '#ffffff' }}>
          <div className={styles.loadingContent} style={{ background: '#ffffff' }}>
            <h3 className={styles.loadingText}>Nous transmettons vos informations au courtier..</h3>
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

export default ScheduleConfirmation;
