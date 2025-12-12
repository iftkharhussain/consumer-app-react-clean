import React, { useState } from 'react';
import { Spin } from 'antd';
import InterestedModal from '../../components/interestedModal';
import InitialContent from '../../components/carInsurance/InitialContent';
import EstimateContent from '../../components/carInsurance/EstimateContent';
import CustomizeProtections from '../../components/carInsurance/CustomizeProtections';
import styles from './CarInsurance.module.css';

const CarInsurance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInterestedClick = () => {
    setIsModalOpen(true);
  };

  const handleAccept = () => {
    setShowEstimate(true);
  };

  const handleCustomize = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowCustomize(true);
    }, 2000);
  };

  const handleBackToMain = () => {
    setShowCustomize(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.carInsurancePage}>
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
