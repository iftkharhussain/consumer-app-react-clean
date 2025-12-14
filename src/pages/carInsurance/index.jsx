import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import InterestedModal from '../../components/interestedModal';
import InitialContent from '../../components/carInsurance/InitialContent';
import EstimateContent from '../../components/carInsurance/EstimateContent';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import LoadingModal from '../../components/loadingModal';
import styles from './CarInsurance.module.css';

const CarInsurance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(true);

  useEffect(() => {
    // Show loading modal on initial page load
    setShowLoadingModal(true);
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
      {/* Loading Modal */}
      <LoadingModal
        isOpen={showLoadingModal}
        onClose={() => setShowLoadingModal(false)}
        userName="Edward"
        steps={[
          'Création du compte Norga',
          'Analyse de vos réponses',
          'Connexion aux assureurs',
          'Application des rabais'
        ]}
        totalDuration={5000}
        autoClose={true}
      />

      {showCustomize ? (
        <CustomizeProtections onBack={handleBackToMain} />
      ) : !showEstimate ? (
        <InitialContent onInterestedClick={handleInterestedClick} onCustomize={handleCustomize} />
      ) : (
        <EstimateContent />
      )}

      {/* Interested Modal */}
      <InterestedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
      />
    </div>
  );
};

export default CarInsurance;
