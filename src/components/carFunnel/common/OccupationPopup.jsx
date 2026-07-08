/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import PrimaryButton from './PrimaryButton';
import { FieldRenderer } from 'components/carFunnel/DynamicRenderer/FieldRenderer';
import 'styles/carFunnel/components/OccupationPopup.css';

// Evaluate a showWhen condition against a set of form values.
// Mirrors the logic used in FieldRenderer / ScreenRegular so the popup behaves
// exactly like the inline form.
const isConditionMet = (condition, values) => {
    if (!condition) return false;
    const { field: conditionField, value: conditionValue, operator = 'equal' } = condition;
    const currentValue = values[conditionField];

    if (conditionValue === 'any') {
        return !(!currentValue || currentValue === '' || (Array.isArray(currentValue) && currentValue.length === 0));
    } else if (operator === 'notEqual') {
        return !(!currentValue || currentValue === '' || currentValue === conditionValue);
    } else if (operator === 'in') {
        return !(!currentValue || currentValue === '' || !Array.isArray(conditionValue) || !conditionValue.includes(currentValue));
    } else if (operator === 'includesAny') {
        return Array.isArray(currentValue) && currentValue.length > 0 && Array.isArray(conditionValue) && conditionValue.some(v => currentValue.includes(v));
    }
    if (Array.isArray(currentValue)) return currentValue.includes(conditionValue);
    return currentValue === conditionValue;
};

const isFieldVisible = (field, values) => {
    if (field.hidden) return false;
    if (field.showWhen && !isConditionMet(field.showWhen, values)) return false;
    return true;
};

/**
 * OccupationPopup
 * Re-uses the dynamic FieldRenderer to ask the same occupation question (and its
 * dependent "Dans quel domaine travaillez-vous?" dropdown) inside a popup.
 *
 * It is opened on submit when the user has selected only the trigger option
 * (e.g. "Diplôme universitaire"), which on its own is not a valid occupation.
 * The fields and parameters are identical to the inline form, so the data sent
 * to the backend is unchanged.
 */
const OccupationPopup = ({ visible, config, initialValues = {}, onConfirm, onClose }) => {
    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState(initialValues);

    const fields = config?.fields || [];

    // Reset and prefill the popup's form whenever it opens
    useEffect(() => {
        if (visible) {
            form.resetFields();
            form.setFieldsValue(initialValues);
            setFormValues(initialValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const handleValuesChange = () => {
        const values = form.getFieldsValue(true);

        // Clear values of fields that are no longer visible so stale answers
        // don't get committed (e.g. switching away from an employed status).
        const updates = {};
        fields.forEach((field) => {
            if (field.showWhen && !isConditionMet(field.showWhen, values) && values[field.name] !== undefined) {
                updates[field.name] = undefined;
                values[field.name] = undefined;
            }
        });
        if (Object.keys(updates).length > 0) {
            form.setFieldsValue(updates);
        }

        setFormValues({ ...values });
    };

    const handleConfirm = async () => {
        const allValues = form.getFieldsValue(true);
        const visibleNames = fields.filter((f) => isFieldVisible(f, allValues)).map((f) => f.name);

        try {
            await form.validateFields(visibleNames);
        } catch {
            // Validation errors render inline inside the popup
            return;
        }

        // Only return values for currently-visible fields
        const result = {};
        fields.forEach((f) => {
            if (isFieldVisible(f, allValues)) {
                result[f.name] = allValues[f.name];
            }
        });

        onConfirm(result);
    };

    return (
        <Modal getContainer={() => document.querySelector(".car-funnel") || document.body}
            open={visible}
            onCancel={onClose}
            footer={null}
            className="occupation-popup"
            closeIcon={
                <img
                    src={getAssetPath('/images/cross.svg')}
                    alt="Fermer"
                    className="occupation-popup__close-icon"
                />
            }
            centered
            width={520}
            destroyOnClose
        >
            <div className="occupation-popup__content">
                {config?.title && (
                    <h3 className="occupation-popup__title">{config.title}</h3>
                )}
                {config?.text && (
                    <p className="occupation-popup__text">{config.text}</p>
                )}

                <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
                    {fields.map((field, index) => (
                        <FieldRenderer
                            key={field.name}
                            form={form}
                            field={field}
                            isLastField={index === fields.length - 1}
                            formValues={formValues}
                        />
                    ))}
                </Form>

                <div className="occupation-popup__actions">
                    <PrimaryButton onClick={handleConfirm}>
                        Confirmer
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default OccupationPopup;
