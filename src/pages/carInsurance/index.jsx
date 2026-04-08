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
import { ConfirmationSkeleton } from '../../components/carInsurance/QuoteSkeletons';
import useQuote from '../../hooks/useQuote';
import { checkPendingOrder } from '../../services/api/productOrderService';
import { recalculateQuote } from '../../services/api/quoteService';
import styles from './CarInsurance.module.css';

const CarInsurance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [showResubmitAlert, setShowResubmitAlert] = useState(false);
  const [hasProtectionChanges, setHasProtectionChanges] = useState(false);
  const [protectionsData, setProtectionsData] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculatedQuote, setRecalculatedQuote] = useState(null);
  const [recalculateError, setRecalculateError] = useState(null);

  const userProfile = useSelector(state => state.app?.user_profile);
  const authUser = useSelector(state => state.app?.auth);

  useEffect(() => {
    const alertFlag = localStorage.getItem('showResubmitAlert');
    if (alertFlag === 'true') {
      setShowResubmitAlert(true);
      localStorage.removeItem('showResubmitAlert');
    }
  }, []);

  useEffect(() => {
    const checkForPendingOrder = async () => {
      try {
        const result = await checkPendingOrder('car-insurance');
        if (result.success && result.hasPendingOrder && result.userProductId) {
          navigate(`/call-confirmation/${result.userProductId}`);
        }
      } catch (error) {
        console.error('Failed to check pending order:', error);
      }
    };
    checkForPendingOrder();
  }, [navigate]);

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

  useEffect(() => {
    if (!quoteLoading && (hasQuote || hasFailed)) {
      setHasLoadedOnce(true);
      setShowLoadingModal(false);
    }
  }, [quoteLoading, hasQuote, hasFailed]);

  const userName = userProfile?.firstName || authUser?.firstName || 'User';

  const handleLoadingModalClose = useCallback(() => {
    setShowLoadingModal(false);
  }, []);

  const isLoading = quoteLoading || isRecalculating || showLoadingModal;
  const isInitialLoad = isLoading && !hasLoadedOnce;

  return (
    <>
      <div className={styles.carInsurancePage}>
        {showResubmitAlert && <ResubmitAlert onClose={() => setShowResubmitAlert(false)} />}
        
        {/* Infinite Spinner Overlay - Always shows during any loading state */}
        {isLoading && <LoadingModal isOpen={true} />}

        {isInitialLoad && <ConfirmationSkeleton />}

        {!isInitialLoad && (
          <>
            {showCustomize ? (
              <CustomizeProtections onBack={() => setShowCustomize(false)} userProductId={userProductId} onProtectionsChange={(hc, p) => { setHasProtectionChanges(hc); setProtectionsData(p); }} />
            ) : !showEstimate ? (
              <InitialContent
                onInterestedClick={() => setIsModalOpen(true)}
                onCustomize={() => setShowCustomize(true)}
                quoteData={recalculatedQuote || quoteData}
                quoteLoading={isLoading}
                quoteStatus={quoteStatus}
                hasQuote={hasQuote || !!recalculatedQuote}
                hasFailed={hasFailed}
                isPending={isPending}
                quoteError={recalculateError || quoteError}
                isAuthenticated={isAuthenticated}
                onRetryQuote={refreshQuote}
                userName={userName}
                userProductId={userProductId}
                recalculatedQuote={recalculatedQuote}
              />
            ) : (
              <EstimateContent quoteData={quoteData} />
            )}

            <InterestedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAccept={() => setShowEstimate(true)} />
          </>
        )}
      </div>
    </>
  );
};

export default CarInsurance;
