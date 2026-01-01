import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import InterestedModal from '../../components/interestedModal';
import InitialContent from '../../components/carInsurance/InitialContent';
import EstimateContent from '../../components/carInsurance/EstimateContent';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import LoadingModal from '../../components/loadingModal';
import useQuote from '../../hooks/useQuote';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(true);

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
    refresh: refreshQuote
  } = useQuote('car-insurance');

  // Get user info from localStorage or context
  const getUserName = () => {
    try {
      const sessionData = localStorage.getItem('user');
      if (sessionData) {
        const user = JSON.parse(sessionData);
        return user.firstName || user.fullName?.split(' ')[0] || user.email?.split('@')[0] || t('user') || 'User';
      }
    } catch (e) {
      console.log('Error getting user name:', e);
    }
    return t('user') || 'User';
  };

  const userName = getUserName();

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
    <div className={styles.carInsurancePage}>
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
  );
};

export default CarInsurance;
