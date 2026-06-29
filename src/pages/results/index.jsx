import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Card, Collapse, Divider, Spin, Modal } from 'antd';
import { CheckOutlined, ClockCircleOutlined, DownOutlined, UpOutlined, LoadingOutlined, StarFilled } from '@ant-design/icons';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import LoadingModal from '../../components/loadingModal';
import CourtikaModal from '../../components/courtikaModal';
import PersonalizeModal from '../../components/personalizeModal/PersonalizeModal';
import ResubmitAlert from '../../components/ResubmitAlert';
import FallbackNoQuotes from '../fallbackNoQuotes';
import { ResultsSkeleton } from '../../components/carInsurance/QuoteSkeletons';
import useQuote from '../../hooks/useQuote';
import { getCarrierLogo, getCarrierName, isIntactCarrier } from '../../utils/carrierUtils';
import recalculationService from '../../services/recalculationService';
import { checkPendingOrder } from '../../services/api/productOrderService';
import { recalculateQuote } from '../../services/api/quoteService';
import { trackTikTokEventOnce } from '../../utils/tiktokPixel';
import styles from './Results.module.css';

const { Panel } = Collapse;

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState([0]);
  const [expandedInsurer, setExpandedInsurer] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); 
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showResubmitAlert, setShowResubmitAlert] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [hasProtectionChanges, setHasProtectionChanges] = useState(false);
  const [protectionsData, setProtectionsData] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculatedQuote, setRecalculatedQuote] = useState(null);
  const [recalculateError, setRecalculateError] = useState(null);
  const [isCourtikaModalOpen, setIsCourtikaModalOpen] = useState(false);
  const [isPersonalizeModalOpen, setIsPersonalizeModalOpen] = useState(false);
  const [selectedInsurer, setSelectedInsurer] = useState(null);
  const [insurers, setInsurers] = useState([]);
  const [recommendedInsurer, setRecommendedInsurer] = useState(null);
  const [recalculateCount, setRecalculateCount] = useState(0);
  const [showRecalculateLimitModal, setShowRecalculateLimitModal] = useState(false);
  const shouldOpenModalRef = React.useRef(false);

  // Fire TikTok 'Lead' event once per session when the results page loads.
  // sessionStorage-based guard so a page refresh does NOT re-fire the event.
  useEffect(() => {
    trackTikTokEventOnce('Lead');
  }, []);

  // Open CourtikaModal after selectedInsurer state updates
  React.useEffect(() => {
    if (shouldOpenModalRef.current && selectedInsurer) {
      setIsCourtikaModalOpen(true);
      shouldOpenModalRef.current = false;
    }
  }, [selectedInsurer]);

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

  // Sync timer and check expiry BEFORE hiding loading state
  useEffect(() => {
    if (!quoteLoading && hasQuote && quoteData?.createdAt) {
      const createdTime = new Date(quoteData.createdAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - createdTime) / 1000);
      const totalAllowedSeconds = 1800 ; // 30 minutes
      const remaining = totalAllowedSeconds - elapsedSeconds;
      
      if (remaining <= 0) {
        // Expired! Redirect without ever showing the results
        navigate('/result-expired');
      } else {
        // Not expired, set time and ONLY THEN allow the UI to show
        setTimeLeft(remaining);
      }
    }
  }, [quoteData, quoteLoading, hasQuote, navigate]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          navigate('/result-expired');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

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
        if (result.success && result.hasPendingOrder && result.userProductId && result.fortusDeliveryId) {
          // Redirect to call confirmation page (user has already selected insurer AND lead was sent)
          console.log('[Results] Sent order found, redirecting to confirmation-call:', result.userProductId);
          navigate(`/confirmation-call/${result.userProductId}`);
        }
      } catch (error) {
        console.error('Failed to check pending order:', error);
      }
    };

    checkForPendingOrder();
  }, [navigate]);

  useEffect(() => {
    document.title = 'Vos soumissions auto - Norga';
  }, []);

  // Close loading modal when quote data is ready AND time is synced (to avoid flash)
  useEffect(() => {
    // Only hide loading if we have a failed quote OR a successful one with a valid timer
    const isReadyToShowSuccess = !quoteLoading && hasQuote && timeLeft !== null;
    const isReadyToShowFailed = !quoteLoading && hasFailed;

    if (isReadyToShowSuccess || isReadyToShowFailed) {
      setHasLoadedOnce(true);
      setShowLoadingModal(false);
    }
  }, [quoteLoading, hasQuote, hasFailed, timeLeft]);

  // Process quote data when available
  useEffect(() => {
    if (quoteData) {
      console.log('📦 [DEBUG] quoteData received:', quoteData);
      if (quoteData.carriers?.[0]?.coverages?.[0]) {
        console.log('🛡️ [DEBUG] First Coverage Object Full:', JSON.parse(JSON.stringify(quoteData.carriers[0].coverages[0])));
      }
    }
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

          // Base prices from API (no discount calculation for L'Unique, just show badge)
          let finalPrice = monthly;
          let finalYearlyPrice = annual;
          let oldPrice = carrier.oldPrice || null;
          let oldYearlyPrice = carrier.oldYearlyPrice || null;
          let discountBonus = isLUnique ? "L'Unique offre actuellement 1 mois gratuit sur cette assurance." : null;

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
            discountLabel: carrier.discountLabel || (isLUnique ? 'Rabais 1 mois gratuit' : null),
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
        
        // 🔍 DEBUG: Log all insurers and the cheapest one
        console.log('\n🔍 [Results Page DEBUG] ===================');
        console.log('📊 All Insurers (sorted by price):');
        sortedInsurers.forEach((ins, index) => {
          console.log(`  ${index + 1}. ${ins.name} (${ins.carrierCode}) - $${ins.price}/month ${index === 0 ? '⭐ CHEAPEST' : ''}`);
        });
        console.log('🏆 Recommended Insurer (will be sent to API):', {
          name: sortedInsurers[0]?.name,
          carrierCode: sortedInsurers[0]?.carrierCode,
          price: sortedInsurers[0]?.price
        });
        console.log('=========================================\n');
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
    if (seconds === null) return '--:--';
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
    'COMP': 'Accident sans collision ni versement (B3)',
    'CMP': 'Accident sans collision ni versement (B3)',
    '34': 'Assurance de personnes (FAQ 34)',
    '33': 'Assistance routière (FAQ 33)',
    '20': 'Assistance routière (FAQ 20)',
    '27': 'Assurance des personnes (FAQ 27)',
    'COL': 'Collision ou versement (B2)',
    'COLL': 'Collision ou versement (B2)',
    'PAK': 'Protections bonifiées',
    'PAK7': 'Protections bonifiées',
    'PAK12': 'Protections bonifiées',
    'PAK13': 'Protections bonifiées'
  };

  // Extract protections from quote data
  const protections = useMemo(() => {
    if (!recommendedInsurer?.coverages || !Array.isArray(recommendedInsurer.coverages)) {
      return [];
    }

    const protectionsList = recommendedInsurer.coverages.map(coverage => {
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
          title: 'Assurance de personnes (FAQ 34)',
          description: 'Suite à un accident d\'auto, vous serez couvert pour les frais médicaux non couverts par la SAAQ pour les dommages corporels. Vous pourriez aussi recevoir une indemnité pour décès et mutilation. Cet avenant inclut aussi votre conjoint (e) et enfants à votre charge.'
        },
        '41': {
          title: 'Assurance de personnes (FAQ 34)',
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
        // For PAK, don't show any coverage value
        type = null;
        coverageValue = null;
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
        } else if (code === '34' || code === '41' || code === '33' || code === '20' || code === '27') {
          // For FAQ codes (including 41 which displays as 34), show limit (Couverture)
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
        type,
        code,
        isPak: isPakCode,
        vehicleIndex: coverage.vehicleIndex ?? 0
      };
    });

    // Filter protections by selected vehicle
    const vehicleProtections = protectionsList.filter(p => p.vehicleIndex === selectedCarIndex);

    // Deduplicate coverages based on code, limit, and deductible
    // When there are multiple vehicles, same coverages appear multiple times
    const uniqueProtections = [];
    const seen = new Set();
    
    vehicleProtections.forEach(protection => {
      // Create a unique key based on code, coverage value, and type
      const key = `${protection.code}-${protection.coverage || 'none'}-${protection.type || 'none'}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueProtections.push(protection);
      }
    });

    // Check if coverage '34' exists
    const has34 = uniqueProtections.some(p => p.code === '34');
    
    // Filter out coverage code '41' only if coverage '34' exists
    const filteredProtections = uniqueProtections.filter(protection => {
      if (protection.code === '41') {
        return !has34; // Hide '41' only if '34' exists
      }
      return true; // Keep all other coverages
    });

    // Special handling for Wawanesa: ensure FAQ 34 is always shown separately
    let finalProtections = filteredProtections;
    const isWawanesa = recommendedInsurer?.name?.toLowerCase().includes('wawanesa');
    
    if (isWawanesa) {
      const hasFaq34 = finalProtections.some(p => p.code === '34');
      
      if (!hasFaq34) {
        // Inject FAQ 34 with 15,000$ coverage
        const faq34Protection = {
          title: 'Assurance de personnes (FAQ 34)',
          description: 'Suite à un accident d\'auto, vous serez couvert pour les frais médicaux non couverts par la SAAQ pour les dommages corporels. Vous pourriez aussi recevoir une indemnité pour décès et mutilation. Cet avenant inclut aussi votre conjoint (e) et enfants à votre charge.',
          coverage: '15 000$',
          type: 'couverture',
          code: '34',
          isPak: false
        };
        
        finalProtections = [...finalProtections, faq34Protection];
      }
    }

    // Sort protections in desired order:
    // 1. TP (Responsabilité civile)
    // 2. COL (Collision)
    // 3. CMP (Comprehensive)
    // 4. Other coverages (FAQ 34, etc.)
    // 5. PAK (Protections bonifiées) at the end
    const sortOrder = ['TP', 'TPL', 'COL', 'COLL', 'CMP', 'COMP'];
    
    return finalProtections.sort((a, b) => {
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
  }, [recommendedInsurer, formatFrenchCurrency, selectedCarIndex]);

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
      answer: 'Oui, vous pourrez discuter et modifier vos informations avec le courtier lors de votre appel ou rendez-vous.',
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
    // Set the selected insurer to recommended one if not already set
    if (!selectedInsurer && recommendedInsurer) {
      setSelectedInsurer({
        insurerName: recommendedInsurer.name,
        carrierCode: recommendedInsurer.carrierCode,
        logo: recommendedInsurer.logo,
        monthlyPrice: recommendedInsurer.price,
        yearlyPrice: recommendedInsurer.yearlyPrice,
        coverages: recommendedInsurer.coverages,
        billingPeriod: billingPeriod
      });
    }
    setIsPersonalizeModalOpen(true);
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
    
    const selectedInsurerData = {
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
      coverages: transformedCoverages,
      billingPeriod: billingPeriod
    };
    
    // Flag that we want to open the modal after state updates
    shouldOpenModalRef.current = true;
    setSelectedInsurer(selectedInsurerData);
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
        <div className={`${styles.resultsContent} ${showCustomize ? styles.resultsContentCustomize : ''}`}>
          {/* Show Once Logic: First load uses Skeleton behind the spinner */}
          {isInitialLoad ? (
            <ResultsSkeleton />
          ) : (
            <>
              {showCustomize ? (
                <CustomizeProtections
                  onBack={handleBackToMain}
                  onRecalculate={handleRecalculateQuote}
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
                {timeLeft !== null && timeLeft > 0 && hasQuote && recommendedInsurer && (
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
                              {recommendedInsurer.oldPrice && (
                                <span className={styles.priceSuffixBalanced} aria-hidden="true">
                                   $/{billingPeriod === 'monthly' ? 'mois' : 'année'}
                                </span>
                              )}
                              
                              {recommendedInsurer.oldPrice && (
                                <span className={styles.oldPrice}>
                                  {billingPeriod === 'monthly' ? recommendedInsurer.oldPrice : recommendedInsurer.oldYearlyPrice}$
                                </span>
                              )}

                              <span className={styles.mainPrice}>
                                {billingPeriod === 'monthly' ? recommendedInsurer.price : recommendedInsurer.yearlyPrice}
                              </span>
                              <span className={styles.priceSuffix}>$/{billingPeriod === 'monthly' ? 'mois' : 'année'}</span>
                              {(billingPeriod === 'monthly' || billingPeriod === 'yearly') && (
                                <span className={styles.taxLabel} style={{ marginLeft: '4px', color: '#667085', fontSize: '11px', fontWeight: '400' }}>
                                  (+9% taxes)
                                </span>
                              )}
                            </div>

                            {recommendedInsurer.discount && (
                              <>
                                <div className={styles.discountBadge}>
                                  <CheckOutlined className={styles.discountIcon} />
                                  <span>{recommendedInsurer.name === "L'Unique" ? 'Rabais 1 mois gratuit' : (recommendedInsurer.discountLabel || 'Rabais 1 mois gratuit')}</span>
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
                            Acheter {recommendedInsurer.name}
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Protections Section */}
                    {protections.length > 0 && (
                      <Card className={styles.protectionsCard}>
                        <div className={styles.protectionsHeader}>
                          <h2 className={styles.sectionTitle}>Vos protections</h2>
                          <Button type="link" className={styles.customizeButton} onClick={handleCustomize}>
                            Personnaliser
                          </Button>
                        </div>

                        {quoteData?.cars && quoteData.cars.length > 1 && (
                          <div className={styles.carTabs}>
                            {quoteData.cars.map((car, idx) => {
                              const carInfo = car.vehicleDetails || {};
                              const carMake = carInfo.make || car.manufacturer || '';
                              const carYear = carInfo.year || car.year || '';
                              const carModel = carInfo.modelFr || carInfo.model || car.model || '';
                              
                              return (
                                <button
                                  key={idx}
                                  className={`${styles.carTab} ${selectedCarIndex === idx ? styles.carTabActive : ''}`}
                                  onClick={() => setSelectedCarIndex(idx)}
                                >
                                  <div className={styles.carTabMain}>
                                    {carMake}, {carYear}
                                  </div>
                                  <div className={styles.carTabSub}>
                                    {carModel}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
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
                    {insurers.length > 0 && (
                      <div className={styles.otherInsurersSection}>
                        <h2 className={styles.sectionTitle}>Autres options d'assureurs reconnus</h2>
                        <div className={styles.insurersList}>
                          {insurers.map((insurer) => (
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
                                      {(billingPeriod === 'monthly' || billingPeriod === 'yearly') && (
                                        <span className={styles.insurerTaxLabel} style={{ marginLeft: '4px', color: '#667085', fontSize: '11px', fontWeight: '400' }}>
                                          (+9% taxes)
                                        </span>
                                      )}
                                      <span className={styles.alternativePrice}>
                                        {billingPeriod === 'monthly'
                                          ? `ou ${insurer.yearlyPrice}$ par année`
                                          : `ou ${insurer.price}$ par mois`}
                                      </span>
                                    </div>
                                    {insurer.discount && (
                                      <div className={styles.insurerDiscount}>
                                        <CheckOutlined className={styles.insurerDiscountIcon} />
                                        <span>{insurer.discountLabel || 'Rabais 1 mois gratuit'}</span>
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
                                    Acheter
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
                                  {insurer.name?.toLowerCase().includes('unique') && (
                                    <div className={styles.uniquePromoText}>
                                    L'Unique offre actuellement 1 mois gratuit sur cette assurance.
                                    </div>
                                  )}
                                  <Divider className={styles.expandedDivider} />
                                  <div className={styles.expandedProtections}>
                                    <h4 className={styles.expandedTitle}>Protections incluses</h4>

                                    {/* Car tabs - only show if multiple cars */}
                                    {quoteData?.cars && quoteData.cars.length > 1 && (
                                      <div className={styles.carTabs}>
                                        {quoteData.cars.map((car, idx) => {
                                          const carInfo = car.vehicleDetails || {};
                                          const carMake = carInfo.make || car.manufacturer || '';
                                          const carYear = carInfo.year || car.year || '';
                                          const carModel = carInfo.modelFr || carInfo.model || car.model || '';

                                          return (
                                            <button
                                              key={idx}
                                              className={`${styles.carTab} ${selectedCarIndex === idx ? styles.carTabActive : ''}`}
                                              onClick={() => setSelectedCarIndex(idx)}
                                            >
                                              <div className={styles.carTabMain}>
                                                {carMake}, {carYear}
                                              </div>
                                              <div className={styles.carTabSub}>
                                                {carModel}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}

                                    <div className={styles.expandedProtectionsList}>
                                      {(() => {
                                        // Filter coverages by selected vehicle (only when multi-car AND coverages carry vehicleIndex)
                                        const hasMultipleCars = quoteData?.cars && quoteData.cars.length > 1;
                                        const coveragesHaveVehicleIndex = (insurer.coverages || []).some(c => c.vehicleIndex !== undefined && c.vehicleIndex !== null);
                                        const vehicleFilteredCoverages = (hasMultipleCars && coveragesHaveVehicleIndex)
                                          ? (insurer.coverages || []).filter(c => (c.vehicleIndex ?? 0) === selectedCarIndex)
                                          : (insurer.coverages || []);

                                        // Sort coverages before displaying (same order as main protections section)
                                        const sortedCoverages = vehicleFilteredCoverages.slice().sort((a, b) => {
                                          const sortOrder = ['TP', 'TPL', 'COL', 'COLL', 'CMP', 'COMP'];
                                          const codeA = String(a.code || '').toUpperCase();
                                          const codeB = String(b.code || '').toUpperCase();
                                          const isPakA = codeA.includes('PAK');
                                          const isPakB = codeB.includes('PAK');
                                          
                                          // PAK always goes to the end
                                          if (isPakA && !isPakB) return 1;
                                          if (!isPakA && isPakB) return -1;
                                          
                                          // Both are PAK or both are not PAK
                                          const aIndex = sortOrder.indexOf(codeA);
                                          const bIndex = sortOrder.indexOf(codeB);
                                          
                                          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                          if (aIndex !== -1) return -1;
                                          if (bIndex !== -1) return 1;
                                          
                                          return 0;
                                        });

                                        // Filter out specific coverages for PAFCO
                                        const isPafco = insurer.name?.toLowerCase().includes('pafco');
                                        const filteredCoverages = isPafco 
                                          ? sortedCoverages.filter(coverage => {
                                              const code = String(coverage.code || '').toUpperCase();
                                              return code !== '34' && code !== '27';
                                            })
                                          : sortedCoverages;

                                        // Special handling for Wawanesa: ensure FAQ 34 is always shown separately
                                        const isWawanesa = insurer.name?.toLowerCase().includes('wawanesa');
                                        let finalCoverages = filteredCoverages;
                                        
                                        if (isWawanesa) {
                                          const hasFaq34 = filteredCoverages.some(c => String(c.code || '').toUpperCase() === '34');
                                          
                                          if (!hasFaq34) {
                                            // Inject FAQ 34 with 15,000$ coverage before PAK
                                            const pakIndex = filteredCoverages.findIndex(c => 
                                              String(c.code || '').toUpperCase().includes('PAK')
                                            );
                                            
                                            const faq34Coverage = {
                                              code: '34',
                                              name: 'Assurance de personnes (FAQ 34)',
                                              limit: '15 000$',
                                              deductible: null
                                            };
                                            
                                            if (pakIndex !== -1) {
                                              // Insert before PAK
                                              finalCoverages = [
                                                ...filteredCoverages.slice(0, pakIndex),
                                                faq34Coverage,
                                                ...filteredCoverages.slice(pakIndex)
                                              ];
                                            } else {
                                              // No PAK found, add at the end
                                              finalCoverages = [...filteredCoverages, faq34Coverage];
                                            }
                                          }
                                        }

                                        return finalCoverages.map((coverage, index) => {
                                          const upperCode = String(coverage.code || '').toUpperCase();
                                          const isPak = upperCode.includes('PAK');
                                          
                                          // Determine display title
                                          let displayTitle;
                                          if (isPak) {
                                            displayTitle = 'Protections bonifiées';
                                          } else if (coverage.name && !/^[A-Z0-9]+$/.test(coverage.name)) {
                                            displayTitle = coverage.name;
                                          } else {
                                            displayTitle = coverageLabels[upperCode] || coverage.name || coverage.code;
                                          }

                                          // Determine label and value
                                          let label = 'Couverture';
                                          let value = coverage.limit && coverage.limit !== '-$1/-$1' ? coverage.limit : null;
                                          
                                          // PAK should not show coverage value
                                          if (isPak) {
                                            label = null;
                                            value = null;
                                          } else if (['CMP', 'COMP', 'COL', 'COLL'].includes(upperCode)) {
                                            if (coverage.deductible && coverage.deductible !== -1 && coverage.deductible !== '-1') {
                                              label = 'Franchise';
                                              value = coverage.deductible;
                                            } else {
                                              value = null; // Don't show if no deductible for these specific types
                                            }
                                          } else if (value && typeof value === 'string' && value.includes('/-')) {
                                            value = value.split('/-')[0].trim();
                                          }

                                          // For PAK, always show (even without value), for others skip if no value
                                          if (!isPak && (!value || value === '-1' || value === -1 || value === '-1$')) return null;

                                          return (
                                            <div key={index} className={styles.expandedProtectionItem}>
                                              <CheckOutlined className={styles.expandedProtectionIcon} />
                                              <div className={styles.expandedProtectionContent}>
                                                <span className={styles.expandedProtectionTitle}>
                                                  {displayTitle}
                                                </span>
                                                {label && value && (
                                                  <span className={styles.expandedCoverage}>
                                                    <span className={styles.expandedCoverageLabel}>{label} : </span>
                                                    <span className={styles.expandedCoverageValue}>{formatFrenchCurrency(value)}</span>
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        });
                                      })()}
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
                                    <span className={styles.moreInsurersNumber}>10+</span>
                                    <p className={styles.moreInsurersLabel}>Assureurs</p>
                                  </div>
                                </div>
                                <div className={styles.moreInsurersInfo}>
                                  <h3 className={styles.moreInsurersTitle}>
                                    Vous n'avez pas trouvé votre assureur idéal ?
                                  </h3>
                                  <p className={styles.moreInsurersDescription}>
                                    Courtika a accès à <span className={styles.boldText}>plus de 10 assureurs partenaires</span>. Un courtier certifié peut comparer encore plus d'options pour vous.
                                  </p>
                                </div>
                              </div>
                              <div className={styles.moreInsurersActions}>
                                <Button
                                  type="primary"
                                  className={styles.courtikaButton}
                                  onClick={() => {
                                    shouldOpenModalRef.current = true;
                                    setSelectedInsurer({
                                      insurerName: "Magasiner plus d'options avec Courtika",
                                      logo: "/images/courtika-assurances-inc.png",
                                      isCourtikaSearch: true
                                    });
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
        recommendedInsurer={recommendedInsurer}
        recalculatedQuote={recalculatedQuote}
      />

      {/* Recalculation Limit Modal */}
      <Modal
        open={showRecalculateLimitModal}
        onCancel={() => setShowRecalculateLimitModal(false)}
        footer={[
          <Button 
            key="call" 
            type="primary" 
            href={`tel:${recalculationService.getRecalculationLimitModalConfig().brokerPhoneLink}`}
          >
            {recalculationService.getRecalculationLimitModalConfig().callButtonText}
          </Button>,
          <Button 
            key="close" 
            onClick={() => setShowRecalculateLimitModal(false)}
          >
            {recalculationService.getRecalculationLimitModalConfig().closeButtonText}
          </Button>
        ]}
        centered
      >
        <h3>{recalculationService.getRecalculationLimitModalConfig().title}</h3>
        <p>{recalculationService.getRecalculationLimitModalConfig().message}</p>
        <p style={{ marginTop: '16px' }}>
          <strong>Téléphone: {recalculationService.getRecalculationLimitModalConfig().brokerPhone}</strong>
        </p>
      </Modal>

      {/* (Rest of the modals and bottom bar remains identical, just wrapped in the logic) */}
      <PersonalizeModal
        isOpen={isPersonalizeModalOpen}
        onClose={() => setIsPersonalizeModalOpen(false)}
        userProductId={userProductId}
        selectedQuote={{
          insurerName: "Magasiner plus d'options avec Courtika",
          logo: "/images/courtika-assurances-inc.png",
          isCourtikaSearch: true,
          billingPeriod: billingPeriod
        }}
        recommendedInsurer={recommendedInsurer}
        recalculatedQuote={recalculatedQuote}
      />
    </>
  );
};

export default Results;
