import React, { useState } from 'react';
import InterestedModal from '../../components/interestedModal';
import InitialContent from '../../components/carInsurance/InitialContent';
import EstimateContent from '../../components/carInsurance/EstimateContent';
import styles from './CarInsurance.module.css';

const CarInsurance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);

  const handleInterestedClick = () => {
    setIsModalOpen(true);
  };

  const handleAccept = () => {
    setShowEstimate(true);
  };

  return (
    <div className={styles.carInsurancePage}>
      {!showEstimate ? (
        <InitialContent onInterestedClick={handleInterestedClick} />
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
