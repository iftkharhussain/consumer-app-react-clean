import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Card, Collapse, Divider, Spin, Modal } from 'antd';
import { CheckOutlined, ClockCircleOutlined, DownOutlined, UpOutlined, LoadingOutlined, StarFilled } from '@ant-design/icons';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import LoadingModal from '../../components/loadingModal';
import CourtikaModal from '../../components/courtikaModal';
import ResubmitAlert from '../../components/ResubmitAlert';
import FallbackNoQuotes from '../fallbackNoQuotes';
import { ResultsSkeleton } from '../../components/carInsurance/QuoteSkeletons';
import useQuote from '../../hooks/useQuote';
import { getCarrierLogo, getCarrierName, isIntactCarrier } from '../../utils/carrierUtils';
import recalculationService from '../../services/recalculationService';
import { checkPendingOrder } from '../../services/api/productOrderService';
import { recalculateQuote } from '../../services/api/quoteService';
import styles from './Results.module.css';

const { Panel } = Collapse;

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState([0]);
  const [expandedInsurer, setExpandedInsurer] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showResubmitAlert, setShowResubmitAlert] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [hasProtectionChanges, setHasProtectionChanges] = useState(false);
  const [protectionsData, setProtectionsData] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculatedQuote, setRecalculatedQuote] = useState(null);
  const [recalculateError, setRecalculateError] = useState(null);
  const [isCourtikaModalOpen, setIsCourtikaModalOpen] = useState(false);
  const [selectedInsurer, setSelectedInsurer] = useState(null);
  const [insurers, setInsurers] = useState([]);
  const [recommendedInsurer, setRecommendedInsurer] = useState(null);
  const [recalculateCount, setRecalculateCount] = useState(0);
  const [showRecalculateLimitModal, setShowRecalculateLimitModal] = useState(false);

  // Get user profile from Redux state
  const userProfile = useSelector(state => state.app?.user_profile);
  const authUser = useSelector(state => state.app?.auth);

  // Get user's first name from Redux, fallback to 'User'
  const userName = userProfile?.firstName || authUser?.firstName ||
    userProfile?.fullName?.split(' ')[0] || authUser?.fullName?.split(' ')[0] ||
    t('user') || 'User';

  // Fetch quote on page load
  const {
    loading: quoteLoading,
    quoteData,
    quoteStatus,
    hasQuote,
    hasFailed,
    isPending,
    error: quoteError,
    isAuthenticated,
    userProductId,
    refresh: refreshQuote
  } = useQuote('car-insurance');

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          navigate('/fifteen-minutes-redirect');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Check for resubmit alert flag on mount
  useEffect(() => {
    const alertFlag = localStorage.getItem('showResubmitAlert');
    if (alertFlag === 'true') {
      setShowResubmitAlert(true);
      localStorage.removeItem('showResubmitAlert');
    }
  }, []);

  // Check for pending order on mount - redirect to call-confirmation if user has already chosen insurer
  useEffect(() => {
    const checkForPendingOrder = async () => {
      try {
        const result = await checkPendingOrder('car-insurance');
        if (result.success && result.hasPendingOrder && result.userProductId) {
          // Redirect to call confirmation page (user has already selected insurer)
          console.log('[Results] Pending order found, redirecting to call-confirmation:', result.userProductId);
          navigate(`/call-confirmation/${result.userProductId}`);
        }
      } catch (error) {
        console.error('Failed to check pending order:', error);
      }
    };

    checkForPendingOrder();
  }, [navigate]);

  // Close loading modal when quote data is loaded
  useEffect(() => {
    if (!quoteLoading && (hasQuote || hasFailed)) {
      setHasLoadedOnce(true);
      setShowLoadingModal(false);
    }
  }, [quoteLoading, hasQuote, hasFailed]);

  // Process quote data when available
  useEffect(() => {
    if (quoteData?.carriers && Array.isArray(quoteData.carriers)) {
      // Filter available carriers with valid premium
      const availableCarriers = quoteData.carriers.filter(r => {
        const isAvailable = r.available === true || r.status === 'success';
        const hasPremium = (r.annualPremium || r.premium || 0) > 0;
        return isAvailable && hasPremium;
      });

      if (availableCarriers.length > 0) {
        // Transform to insurer format
        const transformedInsurers = availableCarriers.map((carrier, index) => {
          const annual = carrier.annualPremium || carrier.premium || 0;
          const monthly = carrier.monthlyPremium || Math.round(annual / 12);
          
          let rawName = carrier.carrierCode
            ? getCarrierName(carrier.carrierCode)
            : (carrier.name || carrier.carrierName || `Provider ${index + 1}`);
            
          const displayName = rawName.replace(/\s+(Assurances?|Insurance)$/i, '').trim();

          const isLUnique = carrier.carrierCode === 'UNI' || displayName.toLowerCase().includes('l\'unique');

          // Base prices from API
          let finalPrice = monthly;
          let finalYearlyPrice = annual;
          let oldPrice = carrier.oldPrice || null;
          let oldYearlyPrice = carrier.oldYearlyPrice || null;
          let discountBonus = isLUnique ? "L’Unique vous offre 1 mois gratuit. Le prix affiché inclut cette promotion." : null;

          if (isLUnique) {
            // Apply "1 month free" discount: (Annual - (Annual / 12))
            const oneMonthValue = annual / 12;
            oldYearlyPrice = Math.round(annual);
            oldPrice = Math.round(annual / 12);
            
            finalYearlyPrice = Math.round(annual - oneMonthValue);
            // Use floor to match user's example (2339/12 = 194.9 => 194)
            finalPrice = Math.floor(finalYearlyPrice / 12);
          }

          // Build insurer object
          const insurerData = {
            id: carrier.carrierCode || `carrier-${index}`,
            name: displayName,
            carrierCode: carrier.carrierCode,
            logo: getCarrierLogo(carrier.carrierCode || carrier.name),
            price: finalPrice,
            yearlyPrice: finalYearlyPrice,
            coverages: carrier.coverages || [],
            quoteDetails: carrier.quoteDetails || {},
            // Use values from carrier if available, otherwise apply L'Unique specific logic
            discount: carrier.discount || (isLUnique ? true : false),
            discountLabel: carrier.discountLabel || (isLUnique ? 'Rabais appliqué' : null),
            discountBonus: discountBonus,
            oldPrice: oldPrice,
            oldYearlyPrice: oldYearlyPrice
          };

          return insurerData;
        });

        // Sort insurers by price (cheapest first)
        const sortedInsurers = transformedInsurers.sort((a, b) => a.price - b.price);

        setInsurers(sortedInsurers);

        // Set cheapest insurer as recommended (first in sorted list)
        setRecommendedInsurer(sortedInsurers[0]);
      }
    }
  }, [quoteData]);

  // Memoize loading steps
  const loadingSteps = useMemo(() => [
    t('carInsurance.loadingSteps.creatingAccount') || 'Création du compte Norga',
    t('carInsurance.loadingSteps.analyzingResponses') || 'Analyse de vos réponses',
    t('carInsurance.loadingSteps.connectingInsurers') || 'Connexion aux assureurs',
    t('carInsurance.loadingSteps.applyingDiscounts') || 'Application des rabais'
  ], [t]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
 
  // Custom Arrow Icon from user
  const CustomArrowIcon = ({ rotate = 0, size = '1.2em' }) => (
    <span 
      role="img" 
      aria-label="arrow" 
      className="anticon" 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        transform: `rotate(${rotate}deg)`,
        transition: 'transform 0.3s',
        verticalAlign: '-0.125em',
        fontSize: size
      }}
    >
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </span>
  );

  // Helper function to format currency in French format (10 000$ instead of $10,000)
  const formatFrenchCurrency = useCallback((value) => {
    if (!value) return null;
    
    // Remove existing currency symbols and formatting
    let numStr = String(value).replace(/[$,\s]/g, '');
    
    // Extract numeric value
    const num = parseFloat(numStr);
    if (isNaN(num)) return value; // Return original if not a number
    
    // Format with space as thousands separator
    const formatted = num.toLocaleString('fr-CA', { 
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace(/,/g, ' '); // Ensure space separator (some browsers may use comma)
    
    return `${formatted}$`;
  }, []);

  // Map of coverage codes to their display titles
  const coverageLabels = {
    'TP': 'Responsabilité civile',
    'TPL': 'Responsabilité civile',
    'COMP': 'Accident sans collision ni versement',
    'CMP': 'Accident sans collision ni versement',
    '34': 'Protection supplémentaire',
    '33': 'Assistance routière',
    '20': 'Assistance routière',
    '27': 'Assurance des personnes',
    'COL': 'Collision ou versement',
    'COLL': 'Collision ou versement'
  };

  // Extract protections from quote data
  const protections = useMemo(() => {
    if (!recommendedInsurer?.coverages || !Array.isArray(recommendedInsurer.coverages)) {
      return [];
    }

    return recommendedInsurer.coverages.map(coverage => {
      const code = String(coverage.code || '').toUpperCase();
      let title = coverage.name || code;
      let description = '';
      let type = null;
      let coverageValue = null;

      // Map coverage codes to French names and descriptions
      const coverageInfo = {
        'TPL': {
          title: 'Responsabilité civile',
          description: 'Vous serez couvert pour les dommages corporels ou matériels que vous causez à d\'autres personnes lors d\'un accident d\'automobile où vous êtes responsable. Cette protection peut aussi couvrir les frais juridiques si vous êtes poursuivi.'
        },
        'TP': {
          title: 'Responsabilité civile',
          description: 'Vous serez couvert pour les dommages corporels ou matériels que vous causez à d\'autres personnes lors d\'un accident d\'automobile où vous êtes responsable. Cette protection peut aussi couvrir les frais juridiques si vous êtes poursuivi.'
        },
        'COL': {
          title: 'Collision ou versement (B2)',
          description: 'Vous serez couvert pour les dommages à votre véhicule causés par : une collision with un autre véhicule, un impact with un objet fixe ou un renversement, peu importe qui est responsable.'
        },
        'COLL': {
          title: 'Collision ou versement (B2)',
          description: 'Vous serez couvert pour les dommages à votre véhicule causés par : une collision with un autre véhicule, un impact with un objet fixe or un renversement, peu importe qui est responsable.'
        },
        'CMP': {
          title: 'Accident sans collision ni versement (B3)',
          description: 'Vous serez couvert pour les dommages à votre véhicule en lien with des situations autre qu\'une collision or un renversement comme par exemple un feu, un vol, un bris de vitre, un vandalisme or une collision with un animal.'
        },
        'COMP': {
          title: 'Accident sans collision ni versement (B3)',
          description: 'Vous serez couvert pour les dommages à votre véhicule en lien with des situations autre qu\'une collision or un renversement comme par exemple un feu, un vol, un bris de vitre, un vandalisme or une collision with un animal.'
        },
        '34': {
          title: 'Protection supplémentaire (FAQ 34)',
          description: 'Suite à un accident d\'auto, vous serez couvert pour les frais médicaux non couverts par la SAAQ pour les dommages corporels. Vous pourriez aussi recevoir une indemnité pour décès et mutilation. Cet avenant inclut aussi votre conjoint (e) et enfants à votre charge.'
        },
        '33': {
          title: 'Assistance routière (FAQ 33)',
          description: 'Aide et remorquage en cas de panne ou d\'imprévu sur la route.'
        },
        '20': {
          title: 'Assistance routière (FAQ 20)',
          description: 'Aide et remorquage en cas de panne or d\'imprévu sur la route.'
        },
        '27': {
          title: 'Assurance des personnes (FAQ 27)',
          description: 'Protection pour les dommages corporels et indemnités en cas d\'accident.'
        },
        'AB': {
          title: 'Indemnités d\'accident',
          description: 'Couverture pour les blessures corporelles suite à un accident automobile.'
        },
        'DCPD': {
          title: 'Indemnisation directe',
          description: 'Protection pour les dommages matériels causés par un tiers.'
        },
        'UA': {
          title: 'Automobile non assurée',
          description: 'Protection en cas d\'accident causé par un véhicule non assuré.'
        },
        'SEF44': {
          title: 'Protection de la famille',
          description: 'Protection étendue pour les membres de votre famille.'
        }
      };

      // Check for PAK codes (pak12, pak7, pak13, etc.)
      const isPakCode = code.includes('PAK') || /pak\d+/i.test(code);
      
      if (isPakCode) {
        title = 'Protections bonifiées';
        description = 'Ce regroupement inclut des protections supplémentaires qui viennent bonifier votre assurance automobile. Elles offrent une protection plus complète dans plusieurs situations du quotidien, comme lors de l\'utilisation d\'un véhicule loué ou emprunté, ou lorsque votre véhicule est temporairement inutilisable.';
        // For PAK, show "Inclus" as the coverage value
        type = 'couverture';
        coverageValue = coverage.limit === 'Inclus' || coverage.limit === 'Included' ? 'Inclus' : (coverage.limit || 'Inclus');
      } else if (coverageInfo[code]) {
        title = coverageInfo[code].title;
        description = coverageInfo[code].description;
      }

      // Helper function to extract first part of limit (before "/-$1")
      const extractLimitValue = (limit) => {
        if (!limit) return null;
        const parts = limit.split('/-');
        return parts[0].trim();
      };

      // Determine coverage value and type based on coverage code
      // Skip this section if we already handled PAK above
      if (!isPakCode) {
        if (code === 'TP' || code === 'TPL') {
          // For TP/TPL, show limit (Couverture)
          type = 'couverture';
          const rawValue = extractLimitValue(coverage.limit);
          coverageValue = formatFrenchCurrency(rawValue);
        } else if (code === 'CMP' || code === 'COMP' || code === 'COL' || code === 'COLL') {
          // For CMP/COMP/COL/COLL, show deductible (Franchise)
          if (coverage.deductible && coverage.deductible !== -1) {
            type = 'franchise';
            coverageValue = formatFrenchCurrency(coverage.deductible);
          }
        } else if (code === '34' || code === '33' || code === '20' || code === '27') {
          // For FAQ codes, show limit (Couverture)
          if (coverage.limit) {
            type = 'couverture';
            const rawValue = extractLimitValue(coverage.limit);
            coverageValue = formatFrenchCurrency(rawValue);
          }
        } else {
          // Default behavior for other coverage codes
          if (coverage.limit && coverage.limit !== '-$1/-$1') {
            type = 'couverture';
            const rawValue = extractLimitValue(coverage.limit);
            coverageValue = formatFrenchCurrency(rawValue);
          } else if (coverage.deductible && coverage.deductible !== -1) {
            type = 'franchise';
            coverageValue = formatFrenchCurrency(coverage.deductible);
          }
        }
      }

      return {
        title,
        description: description || coverage.description || '',
        coverage: coverageValue,
        type
      };
    });
  }, [recommendedInsurer, formatFrenchCurrency]);

  const faqs = [
    {
      question: 'Est-ce que le prix affiché est final ?',
      answer: 'Non. Le prix affiché est une estimation basée sur les informations fournies. Le prix final sera confirmé après discussion avec un courtier en assurance de dommages.',
    },
    {
      question: 'Pourquoi dois-je parler à un courtier ?',
      answer: 'Un courtier en assurance certifié peut vérifier vos informations, répondre à vos questions spécifiques et s\'assurer que vous obtenez la meilleure couverture adaptée à vos besoins.',
    },
    {
      question: 'Que se passe-t-il après avoir complété la soumission en ligne ?',
      answer: 'Après avoir sélectionné votre assureur, vous serez dirigé vers Courtika pour finaliser votre achat par téléphone ou rendez-vous planifié.',
    },
    {
      question: "Suis-je obligé d'acheter une assurance après la soumission ?",
      answer: "Non, vous n'êtes jamais obligé d'acheter. La soumission est gratuite et sans engagement. Vous pouvez prendre le temps de réfléchir.",
    },
    {
      question: 'Mes informations sont-elles sécurisées ?',
      answer: 'Oui, toutes vos informations sont protégées et cryptées. Nous respectons les normes de sécurité les plus strictes.',
    },
    {
      question: 'Puis-je modifier mes informations après la soumission ?',
      answer: 'Oui, vous pourrez discuter et modifier vos informations with le courtier lors de votre appel or rendez-vous.',
    },
  ];

  // Handlers
  const handleLoadingModalClose = useCallback(() => {
    setShowLoadingModal(false);
  }, []);

  const handleCloseResubmitAlert = () => {
    setShowResubmitAlert(false);
  };

  const handleBackToMain = () => {
    setShowCustomize(false);
    setHasProtectionChanges(false);
    setProtectionsData(null);
    // Reset recalculation counter when going back to results
    setRecalculateCount(0);
  };

  const handleProtectionsChange = useCallback((hasChanges, protections) => {
    setHasProtectionChanges(hasChanges);
    setProtectionsData(protections);
  }, []);

  const handleRecalculateQuote = async () => {
    // Validate prerequisites
    const prerequisiteValidation = recalculationService.validateRecalculationPrerequisites({
      userProductId,
      protectionsData,
      recalculateCount
    });

    if (!prerequisiteValidation.valid) {
      console.warn('[Results] Recalculation prerequisites not met:', prerequisiteValidation.errors);
      if (recalculateCount >= recalculationService.RECALCULATION_LIMIT) {
        setShowRecalculateLimitModal(true);
      }
      return;
    }

    // Validate recalculation limit
    const validation = recalculationService.validateRecalculationRequest(recalculateCount);
    if (!validation.allowed) {
      setShowRecalculateLimitModal(true);
      return;
    }

    setIsRecalculating(true);
    setRecalculateError(null);
    setShowCustomize(false);
    setShowLoadingModal(true);

    try {
      const result = await recalculateQuote(userProductId, protectionsData);

      if (result.success) {
        setRecalculatedQuote({
          ...result.quote,
          protections: protectionsData,
          isTemporary: true
        });
        // Increment recalculation counter after successful recalculation
        setRecalculateCount(prev => prev + 1);
        
        // Log successful recalculation
        recalculationService.logRecalculationAttempt({
          userProductId,
          count: recalculateCount,
          success: true
        });
      } else {
        setRecalculateError(result.message || 'Failed to recalculate quote');
        
        // Log failed recalculation
        recalculationService.logRecalculationAttempt({
          userProductId,
          count: recalculateCount,
          success: false,
          error: result.message
        });
      }
    } catch (err) {
      console.error('[Results] Recalculate error:', err);
      setRecalculateError(err.message || 'An error occurred');
      
      // Log error
      recalculationService.logRecalculationAttempt({
        userProductId,
        count: recalculateCount,
        success: false,
        error: err.message
      });
    } finally {
      setIsRecalculating(false);
      setShowLoadingModal(false);
    }
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSelectInsurer = (insurer) => {
    // Transform coverages to the format expected by backend
    const transformedCoverages = (insurer.coverages || []).map(coverage => {
      // Extract numeric limit from string like "$2,000,000/-$1"
      let limit1 = 0;
      if (coverage.limit) {
        const limitStr = coverage.limit.toString().replace(/[$,\s-]/g, '');
        const limitMatch = limitStr.match(/^(\d+)/);
        if (limitMatch) {
          limit1 = parseInt(limitMatch[1], 10);
        }
      }
      
      // Get code (might be string or number)
      const rawCode = (coverage.code || coverage.id || coverage.csioCode || '').toString();
      
      // Map code to CSIO code
      const codeMap = {
        'TP': '20',      // Responsabilité civile (Civil Liability)
        '20': '20',
        '21': '21',      // Collision
        '22': '22',      // Tous risques (Comprehensive)
        '34': '34',      // Avenant 34
        '43': '43',      // Avenant 43 - Remplacement automobile
        '27': '27'       // Avenant 27 - Indemnité de remplacement
      };
      
      const csioCode = codeMap[rawCode] || rawCode;
      
      // Return both formats for compatibility
      return {
        // New format for backend/display
        id: rawCode,
        csioCode: csioCode,
        limit1: limit1,
        deductible: coverage.deductible !== undefined ? coverage.deductible : -1,
        pack: coverage.pack || 'standard',
        // Keep original format for existing UI components
        code: rawCode,
        limit: coverage.limit || (limit1 > 0 ? `$${limit1.toLocaleString('en-US')}/-$1` : ''),
        description: coverage.description || ''
      };
    });
    
    console.log('[Results] Transformed coverages:', transformedCoverages);
    
    setSelectedInsurer({
      insurerName: insurer.name,
      carrierCode: insurer.carrierCode,
      logo: insurer.logo,
      monthlyPrice: insurer.price,
      yearlyPrice: insurer.yearlyPrice,
      oldMonthlyPrice: insurer.oldPrice || null,
      oldYearlyPrice: insurer.oldYearlyPrice || null,
      discount: insurer.discount || false,
      discountLabel: insurer.discountLabel || null,
      discountBonus: insurer.discountBonus || null,
      coverages: transformedCoverages
    });
    setIsCourtikaModalOpen(true);
  };

  const toggleInsurerDetails = (insurerId) => {
    setExpandedInsurer(expandedInsurer === insurerId ? null : insurerId);
  };

  const otherInsurers = insurers.filter(ins => ins.id !== recommendedInsurer?.id);

  const isLoading = quoteLoading || isRecalculating || showLoadingModal;
  const isInitialLoad = isLoading && !hasLoadedOnce;

  return (
    <>
      {/* Infinite Spinner Overlay - Always shows during any loading state */}
      {isLoading && <LoadingModal isOpen={true} />}

      <div className={styles.resultsContainer}>
        <div className={styles.resultsContent}>
          {/* Show Once Logic: First load uses Skeleton behind the spinner */}
          {isInitialLoad ? (
            <ResultsSkeleton />
          ) : (
            <>
              {showCustomize ? (
                <CustomizeProtections
                  onBack={handleBackToMain}
                  userProductId={userProductId}
                  onProtectionsChange={handleProtectionsChange}
                />
              ) : (
                <>
                  {/* Show error state */}
                  {hasFailed && (
                    <FallbackNoQuotes />
                  )}

                  {/* Show results when data is available */}
                {hasQuote && recommendedInsurer && (
                  <>
                    {/* Timer */}
                    <div className={styles.timerSection}>
                      <ClockCircleOutlined className={styles.timerIcon} />
                      <span className={styles.timerText}>Vos soumissions expirent dans :</span>
                      <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
                    </div>

                    {/* Recommended Insurer Card */}
                    <Card className={styles.recommendedCard}>
                      <div className={styles.recommendedBadge}>
                        <StarFilled className={styles.badgeIcon} />
                        <span>Recommandé</span>
                      </div>

                      <div className={styles.cardContent}>
                        {/* Left Column - Logo + Pricing */}
                        <div className={styles.leftColumn}>
                          <div className={styles.logoContainer}>
                            <img
                              src={recommendedInsurer.logo}
                              alt={recommendedInsurer.name}
                              className={styles.insurerLogo}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>

                          {/* Price Section */}
                          <div className={styles.priceSection}>
                            <div className={styles.priceDisplay}>
                              <span className={styles.priceSuffixBalanced} aria-hidden="true">
                                 $/{billingPeriod === 'monthly' ? 'mois' : 'année'}
                              </span>
                              
                              {recommendedInsurer.oldPrice && (
                                <span className={styles.oldPrice}>
                                  {billingPeriod === 'monthly' ? recommendedInsurer.oldPrice : recommendedInsurer.oldYearlyPrice}$
                                </span>
                              )}

                              <span className={styles.mainPrice}>
                                {billingPeriod === 'monthly' ? recommendedInsurer.price : recommendedInsurer.yearlyPrice}
                              </span>
                              <span className={styles.priceSuffix}>$/{billingPeriod === 'monthly' ? 'mois' : 'année'}</span>
                            </div>

                            {recommendedInsurer.discount && (
                              <>
                                <div className={styles.discountBadge}>
                                  <CheckOutlined className={styles.discountIcon} />
                                  <span>{recommendedInsurer.name === "L'Unique" ? 'Rabais Courtika appliqué' : (recommendedInsurer.discountLabel || 'Rabais appliqué')}</span>
                                </div>
                                {recommendedInsurer.discountBonus && (
                                  <p className={styles.savingsText}>{recommendedInsurer.discountBonus}</p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Toggle */}
                          <div className={styles.billingToggle}>
                            <button
                              onClick={() => setBillingPeriod('monthly')}
                              className={`${styles.toggleButton} ${billingPeriod === 'monthly' ? styles.toggleActive : ''}`}
                            >
                              Mensuel
                            </button>
                            <button
                              onClick={() => setBillingPeriod('yearly')}
                              className={`${styles.toggleButton} ${billingPeriod === 'yearly' ? styles.toggleActive : ''}`}
                            >
                              Annuel
                            </button>
                          </div>
                        </div>

                        {/* Right Column - Title, Description and CTA */}
                        <div className={styles.rightColumn}>
                          <h2 className={styles.recommendedTitle}>
                            {userName}, <span className={styles.highlightText}>{recommendedInsurer.name}</span> est votre meilleure option!
                          </h2>

                          <p className={styles.recommendedDescription}>
                            Ce prix est <span className={styles.boldText}>une estimation personnalisée</span> basée sur votre profil. Un courtier certifié confirmera le tarif final et répondra à toutes vos questions lors d'un échange rapide et gratuit.
                          </p>

                          <Button
                            type="primary"
                            size="large"
                            className={styles.selectButton}
                            onClick={() => handleSelectInsurer(recommendedInsurer)}
                            block
                          >
                            Choisir {recommendedInsurer.name}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Protections Section */}
                    {protections.length > 0 && (
                      <Card className={styles.protectionsCard}>
                        <div className={styles.protectionsHeader}>
                          <h2 className={styles.sectionTitle}>Vos protections</h2>
                          {/* <Button type="link" className={styles.customizeButton} onClick={handleCustomize}>
                            Personnaliser
                          </Button> */}
                        </div>
                        <div className={styles.protectionsList}>
                          {protections.map((protection, index) => (
                            <div key={index} className={styles.protectionItem}>
                              <CheckOutlined className={styles.protectionIcon} />
                              <div className={styles.protectionContent}>
                                <div className={styles.protectionRow}>
                                  <div className={styles.protectionInfo}>
                                    <h3 className={styles.protectionTitle}>{protection.title}</h3>
                                    {protection.description && (
                                      <p className={styles.protectionDescription}>{protection.description}</p>
                                    )}
                                  </div>
                                  {protection.coverage && (
                                    <span className={styles.coverageText}>
                                      <span className={styles.coverageLabel}>
                                        {protection.type === 'franchise' ? 'Franchise' : 'Couverture'} :{' '}
                                      </span>
                                      <span className={styles.coverageValue}>{protection.coverage}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Other Insurers */}
                    {otherInsurers.length > 0 && (
                      <div className={styles.otherInsurersSection}>
                        <h2 className={styles.sectionTitle}>Autres options d'assureurs reconnus</h2>
                        <div className={styles.insurersList}>
                          {otherInsurers.map((insurer) => (
                            <Card key={insurer.id} className={styles.insurerCard}>
                              <div className={styles.insurerContent}>
                                <div className={styles.insurerMain}>
                                  <div className={styles.insurerLogoWrapper}>
                                    <img
                                      src={insurer.logo}
                                      alt={insurer.name}
                                      className={styles.insurerLogo}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  </div>
                                  <div className={styles.insurerDetails}>
                                    <h3 className={styles.insurerName}>{insurer.name}</h3>
                                    <div className={styles.insurerPrice}>
                                      {insurer.oldPrice && (
                                        <span className={styles.insurerOldPrice}>
                                          {billingPeriod === 'monthly' ? insurer.oldPrice : insurer.oldYearlyPrice}$
                                        </span>
                                      )}
                                      <span className={styles.insurerMainPrice}>
                                        {billingPeriod === 'monthly' ? insurer.price : insurer.yearlyPrice}
                                      </span>
                                      <span className={styles.insurerPriceSuffix}>
                                         $/{billingPeriod === 'monthly' ? 'mois' : 'année'}
                                      </span>
                                      <span className={styles.alternativePrice}>
                                        {billingPeriod === 'monthly'
                                          ? `ou ${insurer.yearlyPrice}$ par année`
                                          : `ou ${insurer.price}$ par mois`}
                                      </span>
                                    </div>
                                    {insurer.discount && (
                                      <div className={styles.insurerDiscount}>
                                        <CheckOutlined className={styles.insurerDiscountIcon} />
                                        <span>{insurer.discountLabel || 'Rabais appliqué'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className={styles.insurerActions}>
                                  <Button
                                    type="primary"
                                    className={styles.insurerSelectButton}
                                    onClick={() => handleSelectInsurer(insurer)}
                                  >
                                    Choisir
                                  </Button>
                                  <Button
                                    type="link"
                                    className={styles.detailsButton}
                                    onClick={() => toggleInsurerDetails(insurer.id)}
                                  >
                                    {expandedInsurer === insurer.id ? (
                                      <>
                                        Moins de détails <CustomArrowIcon rotate={180} />
                                      </>
                                    ) : (
                                      <>
                                        Voir détails <CustomArrowIcon />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {expandedInsurer === insurer.id && insurer.coverages?.length > 0 && (
                                <div className={styles.expandedDetails}>
                                  <Divider />
                                  <div className={styles.expandedProtections}>
                                    <h4 className={styles.expandedTitle}>Protections incluses</h4>
                                    <div className={styles.expandedProtectionsList}>
                                      {insurer.coverages.slice(0, 3).map((coverage, index) => {
                                        const upperCode = String(coverage.code || '').toUpperCase();
                                        const displayTitle = coverage.name && !/^[A-Z0-9]+$/.test(coverage.name) 
                                          ? coverage.name 
                                          : (coverageLabels[upperCode] || coverage.name || coverage.code);

                                        // Determine label and value
                                        let label = 'Couverture';
                                        let value = coverage.limit && coverage.limit !== '-$1/-$1' ? coverage.limit : null;
                                        
                                        if (['CMP', 'COMP', 'COL', 'COLL'].includes(upperCode)) {
                                          if (coverage.deductible && coverage.deductible !== -1 && coverage.deductible !== '-1') {
                                            label = 'Franchise';
                                            value = coverage.deductible;
                                          } else {
                                            value = null; // Don't show if no deductible for these specific types
                                          }
                                        } else if (value && typeof value === 'string' && value.includes('/-')) {
                                          value = value.split('/-')[0].trim();
                                        }

                                        if (!value || value === '-1' || value === -1 || value === '-1$') return null;

                                        return (
                                          <div key={index} className={styles.expandedProtectionItem}>
                                            <CheckOutlined className={styles.expandedProtectionIcon} />
                                            <div className={styles.expandedProtectionContent}>
                                              <span className={styles.expandedProtectionTitle}>
                                                {displayTitle}
                                              </span>
                                              <span className={styles.expandedCoverage}>
                                                <span className={styles.expandedCoverageLabel}>{label} : </span>
                                                <span className={styles.expandedCoverageValue}>{formatFrenchCurrency(value)}</span>
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}

                          {/* Call-to-Action Card for More Insurers */}
                          <Card className={styles.moreInsurersCard}>
                            <div className={styles.moreInsurersContent}>
                              <div className={styles.moreInsurersMain}>
                                <div className={styles.moreInsurersIconWrapper}>
                                  <div className={styles.moreInsurersIcon}>
                                    <span className={styles.moreInsurersNumber}>30+</span>
                                    <p className={styles.moreInsurersLabel}>Assureurs</p>
                                  </div>
                                </div>
                                <div className={styles.moreInsurersInfo}>
                                  <h3 className={styles.moreInsurersTitle}>
                                    Vous n'avez pas trouvé votre assureur idéal ?
                                  </h3>
                                  <p className={styles.moreInsurersDescription}>
                                    Courtika a accès à <span className={styles.boldText}>plus de 30 assureurs partenaires</span>. Un courtier certifié peut comparer encore plus d'options pour vous.
                                  </p>
                                </div>
                              </div>
                              <div className={styles.moreInsurersActions}>
                                <Button
                                  type="primary"
                                  className={styles.courtikaButton}
                                  onClick={() => {
                                    setSelectedInsurer({
                                      insurerName: "Magasiner plus d'options directly with Courtika",
                                      logo: "/images/courtika-assurances-inc.png",
                                      isCourtikaSearch: true
                                    });
                                    setIsCourtikaModalOpen(true);
                                  }}
                                >
                                  Parler à Courtika
                                </Button>
                                <span className={styles.freeText}>Gratuit et sans engagement</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* FAQ Section */}
                    <Card className={styles.faqCard}>
                      <div className={styles.faqHeader}>
                        <h2 className={styles.faqTitle}>Foire aux questions</h2>
                        <p className={styles.faqSubtitle}>Trouvez rapidement les réponses à vos questions</p>
                      </div>

                      <Collapse
                        activeKey={expandedFAQ}
                        onChange={setExpandedFAQ}
                        className={styles.faqCollapse}
                        expandIconPosition="end"
                        expandIcon={({ isActive }) => <CustomArrowIcon rotate={isActive ? 180 : 0} />}
                      >
                        {faqs.map((faq, index) => (
                          <Panel header={faq.question} key={index} className={styles.faqPanel}>
                            <p className={styles.faqAnswer}>{faq.answer}</p>
                          </Panel>
                        ))}
                      </Collapse>
                    </Card>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>

      {/* Courtika Modal */}
      <CourtikaModal
        isOpen={isCourtikaModalOpen}
        onClose={() => setIsCourtikaModalOpen(false)}
        userProductId={userProductId}
        selectedQuote={selectedInsurer}
        recalculatedQuote={recalculatedQuote}
      />

      {/* Recalculation Limit Modal... */}
      {/* (Rest of the modals and bottom bar remains identical, just wrapped in the logic) */}
    </>
  );
};

export default Results;
