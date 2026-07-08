/* eslint-disable */
import React from 'react';
import { Modal } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/InfoModal.css';

const InfoModal = ({ visible, onClose, image, text, children, imageStyle }) => {
    // Default image style
    const defaultImageStyle = { width: '228px', height: '158px' };
    const appliedImageStyle = imageStyle || defaultImageStyle;

    return (
        <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
            open={visible}
            onCancel={onClose}
            footer={null}
            className="info-modal"
            closeIcon={
                <img
                    src={getAssetPath('/images/cross.svg')}
                    alt="Close"
                    className="info-modal__close-icon"
                />
            }
            centered
            width={520}
        >
            <div className="info-modal__content">
                {/* Modal Image */}
                {image && (
                    <div className="info-modal__image-wrapper" style={{ width: appliedImageStyle.width }}>
                        <img
                            src={getAssetPath(image)}
                            alt="Info"
                            className="info-modal__image"
                            style={appliedImageStyle}
                        />
                    </div>
                )}

                {/* Message Text */}
                <p className="info-modal__text">
                    {text}
                </p>

                {children}
            </div>
        </Modal>
    );
};

export default InfoModal;
