import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import InterestedModal from '../../components/interestedModal';
import InitialContent from '../../components/carInsurance/InitialContent';
import EstimateContent from '../../components/carInsurance/EstimateContent';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import LoadingModal from '../../components/loadingModal';
import ResubmitAlert from '../../components/ResubmitAlert';
import useQuote from '../../hooks/useQuote';
import { checkPendingOrder } from '../../services/api/productOrderService';
import styles from './CarInsurance.module.css';

/**
 * CarInsurance Page
 * 
 * This page handles the car insurance quote flow:
 * 1. Shows initial loading modal (5 seconds) while quote fetch starts in background
 * 2. After loading modal closes, shows the page content
 * 3. InitialContent shows skeletons on insurer cards while quote is loading
 */
const CarInsurance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showResubmitAlert, setShowResubmitAlert] = useState(false);

  // Get user profile from Redux state
  const userProfile = useSelector(state => state.app?.user_profile);
  const authUser = useSelector(state => state.app?.auth);

  // Check for resubmit alert flag on mount
  useEffect(() => {
    const alertFlag = localStorage.getItem('showResubmitAlert');
    if (alertFlag === 'true') {
      setShowResubmitAlert(true);
      // Clear the flag after showing
      localStorage.removeItem('showResubmitAlert');
    }
  }, []);

  // Check for pending order on mount
  useEffect(() => {
    const checkForPendingOrder = async () => {
      try {
        const result = await checkPendingOrder('car-insurance');
        if (result.success && result.hasPendingOrder && result.userProductId) {
          // Redirect to product order page
          navigate(`/car-insurance/product-order/${result.userProductId}`);
        }
      } catch (error) {
        // Silently fail - don't block page load if check fails
        console.error('Failed to check pending order:', error);
      }
    };

    checkForPendingOrder();
  }, [navigate]);

  const handleCloseResubmitAlert = () => {
    setShowResubmitAlert(false);
  };

  // Fetch quote on page load - autoFetch is true by default
  // Hook will poll every 3 seconds when status is 'fetching'
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

  // Get user's first name from Redux (user_profile or auth), fallback to 'User'
  const userName = userProfile?.firstName || authUser?.firstName || 
                   userProfile?.fullName?.split(' ')[0] || authUser?.fullName?.split(' ')[0] || 
                   t('user') || 'User';

  // Memoize loading steps to prevent re-creating array on every render
  // This prevents the LoadingModal from resetting when polling causes re-renders
  const loadingSteps = useMemo(() => [
    t('carInsurance.loadingSteps.creatingAccount') || 'Création du compte Norga',
    t('carInsurance.loadingSteps.analyzingResponses') || 'Analyse de vos réponses',
    t('carInsurance.loadingSteps.connectingInsurers') || 'Connexion aux assureurs',
    t('carInsurance.loadingSteps.applyingDiscounts') || 'Application des rabais'
  ], [t]);

  // Memoize callback to prevent re-creating on every render
  const handleLoadingModalClose = useCallback(() => {
    setShowLoadingModal(false);
  }, []);

  const handleInterestedClick = () => {
    setIsModalOpen(true);
  };

  const handleAccept = () => {
    setShowEstimate(true);
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleBackToMain = () => {
    setShowCustomize(false);
  };

  return (
    <>
      <div className={styles.carInsurancePage}>
        {/* Resubmit Alert - Shows if user resubmitted form with different info */}
        {showResubmitAlert && (
          <ResubmitAlert onClose={handleCloseResubmitAlert} />
        )}

        {/* Initial Loading Modal - Shows for ~5 seconds */}
        <LoadingModal
          isOpen={showLoadingModal}
          onClose={handleLoadingModalClose}
          userName={userName}
          steps={loadingSteps}
          totalDuration={5000}
          autoClose={true}
        />

        {/* Main Content - Shows after loading modal closes */}
        {!showLoadingModal && (
          <>
            {showCustomize ? (
              <CustomizeProtections onBack={handleBackToMain} />
            ) : !showEstimate ? (
              <InitialContent
                onInterestedClick={handleInterestedClick}
                onCustomize={handleCustomize}
                quoteData={quoteData}
                quoteLoading={quoteLoading}
                quoteStatus={quoteStatus}
                hasQuote={hasQuote}
                hasFailed={hasFailed}
                isPending={isPending}
                quoteError={quoteError}
                isAuthenticated={isAuthenticated}
                onRetryQuote={refreshQuote}
                userName={userName}
                userProductId={userProductId}
              />
            ) : (
              <EstimateContent quoteData={quoteData} />
            )}

            {/* Interested Modal */}
            <InterestedModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAccept={handleAccept}
            />
          </>
        )}
      </div>

      {/* Fixed Bottom Bar - Shows only on customize page - Outside carInsurancePage */}
      {!showLoadingModal && showCustomize && (
        <div className={styles.fixedBottomContainer}>
          <button className={styles.primaryButton}>
            Recalculer mon prix
          </button>
          <button className={styles.secondaryButton} onClick={handleBackToMain}>
            Retour
          </button>
        </div>
      )}
    </>
  );
};

export default CarInsurance;
