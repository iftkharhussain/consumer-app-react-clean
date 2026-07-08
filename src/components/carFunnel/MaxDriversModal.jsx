/* eslint-disable */
import React from 'react';
import { Modal } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/MaxModal.css';

const MaxDriversModal = ({ visible, onClose }) => {
  return (
    <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
      open={visible}
      onCancel={onClose}
      footer={null}
      className="max-modal"
      closeIcon={
        <img
          src={getAssetPath('/images/cross.svg')}
          alt="Close"
          className="max-modal__close-icon"
        />
      }
      centered
      width={520}
    >
      <div className="max-modal__content" style={{ textAlign: 'center', padding: '32px 16px' }}>
        {/* Drivers Image */}
        <div className="max-modal__image-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <img
            src={getAssetPath('/images/max-drivers.svg')}
            alt="Maximum 3 drivers"
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Message Text */}
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#000', marginBottom: '8px', lineHeight: '24px' }}>
          Seulement trois conducteurs peuvent être soumis en ligne.
        </p>
        <p style={{ fontSize: '16px', fontWeight: '500', color: '#000', marginBottom: '24px', lineHeight: '24px', padding: '0 16px' }}>
          Pour plus de trois conducteurs, contactez notre partenaire Courtika pour comparer et obtenir vos soumissions rapidement.
        </p>

        {/* Phone Number */}
        <a href="tel:14507629240" style={{ fontSize: '20px', fontWeight: '700', color: '#1A1ABA', display: 'block', marginBottom: '8px' }}>
          1 (450) 762-9240
        </a>
      </div>
    </Modal>
  );
};

export default MaxDriversModal;
