/* eslint-disable */
import { Modal } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/HelpModal.css';

const HelpModal = ({ visible, onClose }) => {
    return (
        <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
            open={visible}
            onCancel={onClose}
            footer={null}
            className="help-modal"
            closeIcon={
                <img
                    src={getAssetPath('/images/cross.svg')}
                    alt="Close"
                    className="help-modal__close-icon"
                />
            }
            centered
            width={520}
        >
            <div>
                {/* Title */}
                <h2 className="help-modal__title">
                    Besoin d'assistance?
                </h2>

                {/* Description */}
                <p className="help-modal__description" style={{ fontSize: '16px', lineHeight: '24px', color: '#000', marginBottom: '16px' }}>
                    Appelez notre partenaire Courtika pour obtenir de l'aide 
                 
                    rapidement et finaliser votre démarche en toute simplicité.
                </p>

                {/* Phone Number Section */}
                <div className="help-modal__phone-section" style={{ marginTop: '16px' }}>
                    <a href="tel:14507629240" className="help-modal__phone-link" style={{ fontSize: '20px', fontWeight: '600', color: '#1A1ABA' }}>
                        1 (450) 762-9240
                    </a>
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;
