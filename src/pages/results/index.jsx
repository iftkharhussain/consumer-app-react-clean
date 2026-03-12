import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, Card, Collapse, Divider, Spin } from 'antd';
import { CheckOutlined, ClockCircleOutlined, DownOutlined, UpOutlined, LoadingOutlined } from '@ant-design/icons';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import LoadingModal from '../../components/loadingModal';
import CourtikaModal from '../../components/courtikaModal';
import ResubmitAlert from '../../components/ResubmitAlert';
import FallbackNoQuotes from '../fallbackNoQuotes';
import useQuote from '../../hooks/useQuote';
import { checkPendingOrder } from '../../services/api/productOrderService';
import { recalculateQuote } from '../../services/api/quoteService';
import { getCarrierLogo, getCarrierName, isIntactCarrier } from '../../utils/carrierUtils';
import styles from './Results.module.css';

const { Panel } = Collapse;

const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState([0]);
  const [expandedInsurer, setExpandedInsurer] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
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
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check for resubmit alert flag on mount
  useEffect(() => {
    const alertFlag = localStorage.getItem('showResubmitAlert');
    if (alertFlag === 'true') {
      setShowResubmitAlert(true);
      localStorage.removeItem('showResubmitAlert');
    }
  }, []);

  // Check for pending order on mount
  useEffect(() => {
    const checkForPendingOrder = async () => {
      try {
        const result = await checkPendingOrder('car-insurance');
        if (result.success && result.hasPendingOrder && result.userProductId) {
          navigate(`/car-insurance/product-order/${result.userProductId}`);
        }
      } catch (error) {
        console.error('Failed to check pending order:', error);
      }
    };

    checkForPendingOrder();
  }, [navigate]);

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
          const displayName = carrier.carrierCode
            ? getCarrierName(carrier.carrierCode)
            : (carrier.name || carrier.carrierName || `Provider ${index + 1}`);

          return {
            id: carrier.carrierCode || `carrier-${index}`,
            name: displayName,
            carrierCode: carrier.carrierCode,
            logo: getCarrierLogo(carrier.carrierCode || carrier.name),
            price: monthly,
            yearlyPrice: annual,
            coverages: carrier.coverages || [],
            quoteDetails: carrier.quoteDetails || {}
          };
        });

        setInsurers(transformedInsurers);

        // Find Intact as recommended or use first
        const intactInsurer = transformedInsurers.find(ins => isIntactCarrier(ins.carrierCode));
        setRecommendedInsurer(intactInsurer || transformedInsurers[0]);
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

  // Extract protections from quote data
  const protections = useMemo(() => {
    if (!recommendedInsurer?.coverages || !Array.isArray(recommendedInsurer.coverages)) {
      return [];
    }

    return recommendedInsurer.coverages.map(coverage => {
      const code = String(coverage.code || '').toUpperCase();
      let title = coverage.name || code;
      let type = null;
      let coverageValue = null;

      // Map common coverage codes to French names
      const coverageNames = {
        'TPL': 'Responsabilité civile',
        'TP': 'Responsabilité civile',
        'COL': 'Collision et renversement (B2)',
        'COLL': 'Collision et renversement (B2)',
        'CMP': 'Accidents sans collision ni renversement (B3)',
        'COMP': 'Accidents sans collision ni renversement (B3)',
        'AB': 'Indemnités d\'accident',
        'DCPD': 'Indemnisation directe',
        'UA': 'Automobile non assurée',
        'SEF44': 'Protection de la famille',
        '20': 'Assistance routière (FAQ 20)',
        '33': 'Assistance routière (FAQ 33)',
        '27': 'Assurance des personnes (FAQ 27)',
      };

      if (coverageNames[code]) {
        title = coverageNames[code];
      }

      if (coverage.limit) {
        type = 'couverture';
        coverageValue = coverage.limit;
      } else if (coverage.deductible) {
        type = 'franchise';
        coverageValue = `${coverage.deductible} $`;
      }

      return {
        title,
        description: coverage.description || '',
        coverage: coverageValue,
        type
      };
    });
  }, [recommendedInsurer]);

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
      question: 'Suis-je obligé d\'acheter une assurance après la soumission ?',
      answer: 'Non, vous n\'êtes jamais obligé d\'acheter. La soumission est gratuite et sans engagement. Vous pouvez prendre le temps de réfléchir.',
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
  };

  const handleProtectionsChange = useCallback((hasChanges, protections) => {
    setHasProtectionChanges(hasChanges);
    setProtectionsData(protections);
  }, []);

  const handleRecalculateQuote = async () => {
    if (!protectionsData || !userProductId) return;
    
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
      } else {
        setRecalculateError(result.message || 'Failed to recalculate quote');
      }
    } catch (err) {
      console.error('[Results] Recalculate error:', err);
      setRecalculateError(err.message || 'An error occurred');
    } finally {
      setIsRecalculating(false);
      setShowLoadingModal(false);
    }
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSelectInsurer = (insurer) => {
    setSelectedInsurer({
      insurerName: insurer.name,
      carrierCode: insurer.carrierCode,
      logo: insurer.logo,
      monthlyPrice: insurer.price,
      yearlyPrice: insurer.yearlyPrice
    });
    setIsCourtikaModalOpen(true);
  };

  const toggleInsurerDetails = (insurerId) => {
    setExpandedInsurer(expandedInsurer === insurerId ? null : insurerId);
  };

  const otherInsurers = insurers.filter(ins => ins.id !== recommendedInsurer?.id);

  return (
    <>
      {/* Resubmit Alert */}
      {showResubmitAlert && (
        <ResubmitAlert onClose={handleCloseResubmitAlert} />
      )}

      {/* Initial Loading Modal */}
      <LoadingModal
        isOpen={showLoadingModal}
        onClose={handleLoadingModalClose}
        userName={userName}
        steps={loadingSteps}
        totalDuration={5000}
        autoClose={true}
      />

      {/* Main Content */}
      {!showLoadingModal && (
        <>
          {showCustomize ? (
            <CustomizeProtections 
              onBack={handleBackToMain} 
              userProductId={userProductId}
              onProtectionsChange={handleProtectionsChange}
            />
          ) : (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsContent}>
                {/* Show loading state while fetching quote */}
                {(quoteLoading || isRecalculating) && !hasQuote && (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                    <p style={{ marginTop: 20 }}>Chargement de vos soumissions...</p>
                  </div>
                )}

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
                        <CheckOutlined className={styles.badgeIcon} />
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
                              <span className={styles.mainPrice}>
                                {billingPeriod === 'monthly' ? recommendedInsurer.price : recommendedInsurer.yearlyPrice}
                              </span>
                              <span className={styles.priceSuffix}>$ / {billingPeriod === 'monthly' ? 'mois' : 'année'}</span>
                            </div>
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
                          <Button type="link" className={styles.customizeButton} onClick={handleCustomize}>
                            Personnaliser
                          </Button>
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
                                      <span className={styles.insurerMainPrice}>
                                        {billingPeriod === 'monthly' ? insurer.price : insurer.yearlyPrice}
                                      </span>
                                      <span className={styles.insurerPriceSuffix}>
                                        $ / {billingPeriod === 'monthly' ? 'mois' : 'année'}
                                      </span>
                                      <span className={styles.alternativePrice}>
                                        {billingPeriod === 'monthly'
                                          ? `ou ${insurer.yearlyPrice}$ par année`
                                          : `ou ${insurer.price}$ par mois`}
                                      </span>
                                    </div>
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
                                        Moins de détails <UpOutlined />
                                      </>
                                    ) : (
                                      <>
                                        Voir détails <DownOutlined />
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
                                      {insurer.coverages.slice(0, 3).map((coverage, index) => (
                                        <div key={index} className={styles.expandedProtectionItem}>
                                          <CheckOutlined className={styles.expandedProtectionIcon} />
                                          <div className={styles.expandedProtectionContent}>
                                            <span className={styles.expandedProtectionTitle}>
                                              {coverage.name || coverage.code}
                                            </span>
                                            {coverage.limit && (
                                              <span className={styles.expandedCoverage}>
                                                <span className={styles.expandedCoverageLabel}>Couverture : </span>
                                                <span className={styles.expandedCoverageValue}>{coverage.limit}</span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
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
                                  onClick={() => setIsCourtikaModalOpen(true)}
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
              </div>
            </div>
          )}
        </>
      )}

      {/* Courtika Modal */}
      <CourtikaModal
        isOpen={isCourtikaModalOpen}
        onClose={() => setIsCourtikaModalOpen(false)}
        userProductId={userProductId}
        selectedQuote={selectedInsurer}
        recalculatedQuote={recalculatedQuote}
      />

      {/* Fixed Bottom Bar - Shows only on customize page */}
      {!showLoadingModal && showCustomize && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '20px', 
          backgroundColor: 'white', 
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)', 
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <Button 
            type="primary"
            size="large"
            disabled={!hasProtectionChanges || isRecalculating}
            onClick={handleRecalculateQuote}
          >
            {isRecalculating ? 'Chargement...' : 'Recalculer mon prix'}
          </Button>
          <Button size="large" onClick={handleBackToMain}>
            Retour
          </Button>
        </div>
      )}
    </>
  );
};

export default Results;
