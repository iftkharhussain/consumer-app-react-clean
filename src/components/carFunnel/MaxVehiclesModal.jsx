/* eslint-disable */
import { Modal } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/MaxVehiclesModal.css';

const MaxVehiclesModal = ({ visible, onClose }) => {
  return (
    <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
      open={visible}
      onCancel={onClose}
      footer={null}
      className="max-vehicles-modal"
      closeIcon={
        <img
          src={getAssetPath('/images/cross.svg')}
          alt="Close"
          className="max-vehicles-modal__close-icon"
        />
      }
      centered
      width={520}
    >
      <div className="max-vehicles-modal__content" style={{ textAlign: 'center', padding: '32px 16px' }}>
        {/* Image with Tooltip */}
        <div className="max-vehicles-modal__image-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              position: 'absolute',
              top: '-13%',
              right: '0%',
              backgroundColor: '#EDEFFF',
              border: '1px solid #1A1ABA',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#1A1ABA',
              fontSize: '13px',
              fontWeight: '500',
              zIndex: 10
            }}>
              2 voitures maximum
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                left: '20px',
                width: '8px',
                height: '8px',
                backgroundColor: '#EDEFFF',
                borderBottom: '1px solid #1A1ABA',
                borderRight: '1px solid #1A1ABA',
                transform: 'rotate(45deg)'
              }} />
            </div>
            <img
              src={getAssetPath('/images/max-two-cars.png')}
              alt="Max two cars"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Text descriptions */}
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#000', marginBottom: '8px', lineHeight: '24px' }}>
          Seulement deux véhicules peuvent être soumis en ligne.
        </p>
        <p style={{ fontSize: '16px', fontWeight: '500', color: '#000', marginBottom: '24px', lineHeight: '24px', padding: '0 16px' }}>
          Pour trois véhicules ou plus, contactez notre partenaire Courtika pour comparer et obtenir vos soumissions rapidement.
        </p>

        {/* Phone number */}
        <a href="tel:14507629240" style={{ fontSize: '20px', fontWeight: '700', color: '#1A1ABA', display: 'block', marginBottom: '8px' }}>
          1 (450) 762-9240
        </a>
      </div>
    </Modal>
  );
};

export default MaxVehiclesModal;
