/* eslint-disable */
import React, { useState } from 'react';
import { Modal, Input, Form } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/SaveQuoteModal.css';

const SaveQuoteModal = ({ visible, onClose, onSave }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (onSave) {
                await onSave(values);
            }

            setLoading(false);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            className="save-quote-modal"
            closeIcon={
                <img
                    src={getAssetPath('/images/cross.svg')}
                    alt="Close"
                    className="save-quote-modal__close-icon"
                />
            }
            centered
            width={520}
        >
            <div>
                {/* Title */}
                <h2 className="save-quote-modal__title">
                    Vous souhaitez terminer plus tard?
                </h2>

                {/* Description */}
                <p className="save-quote-modal__description">
                    Nous vous enverrons la soumission par courriel. Elle sera conservée et valide pour les 30 prochains jours.
                </p>

                {/* Form */}
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="fullName"
                        rules={[{ required: true, message: 'Veuillez entrer votre nom complet' }]}
                        className="save-quote-modal__form-item"
                    >
                        <Input
                            placeholder="Nom complet"
                            className="save-quote-modal__input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Veuillez entrer votre courriel' },
                            { type: 'email', message: 'Veuillez entrer un courriel valide' }
                        ]}
                        className="save-quote-modal__form-item save-quote-modal__form-item--last"
                    >
                        <Input
                            placeholder="Courriel"
                            className="save-quote-modal__input"
                        />
                    </Form.Item>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="save-quote-modal__submit-btn"
                    >
                        {loading ? 'Sauvegarde...' : 'Sauvegarder ma soumission'}
                    </button>
                </Form>
            </div>
        </Modal>
    );
};

export default SaveQuoteModal;
