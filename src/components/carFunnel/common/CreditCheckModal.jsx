/* eslint-disable */
import React from 'react';
import { Modal } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/CreditCheckModal.css';

const CreditCheckModal = ({ visible, onClose, onYes, onNo }) => {
    const handleYes = () => {
        if (onYes) {
            onYes();
        }
        onClose();
    };

    const handleNo = () => {
        if (onNo) {
            onNo();
        }
        onClose();
    };

    return (
        <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
            open={visible}
            onCancel={onClose}
            footer={null}
            className="credit-check-modal"
            closeIcon={
                <img
                    src={getAssetPath('/images/cross.svg')}
                    alt="Close"
                    className="credit-check-modal__close-icon"
                />
            }
            centered
            width={520}
        >
            <div>
                {/* Title */}
                <h2 className="credit-check-modal__title">
                    Payez moins, sans impact sur votre cote
                </h2>

                {/* Description */}
                <p className="credit-check-modal__description">
                    <span className="credit-check-modal__description--muted">
                        L'information contenue dans votre dossier de crédit pourrait vous permettre{' '}
                    </span>
                    <span className="credit-check-modal__description--emphasis">
                        d'économiser sur votre assurance auto sans affecter votre cote de crédit.
                    </span>
                </p>

                {/* Question */}
                <p className="credit-check-modal__question">
                    Consentez-vous à une vérification de votre dossier de crédit sans impact?
                </p>

                {/* Buttons */}
                <div className="credit-check-modal__buttons">
                    <button
                        onClick={handleYes}
                        className="credit-check-modal__btn credit-check-modal__btn--yes"
                    >
                        Oui
                    </button>
                    <button
                        onClick={handleNo}
                        className="credit-check-modal__btn credit-check-modal__btn--no"
                    >
                        Non
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreditCheckModal;
