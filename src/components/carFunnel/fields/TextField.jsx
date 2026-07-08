/* eslint-disable */
import React from 'react';
import { Form, Input } from 'antd';
import HelpIcon from 'components/carFunnel/common/HelpIcon';
import InputSuffix from 'components/carFunnel/common/InputSuffix';

export const TextField = ({ field, isLastField = false, onShowHelp }) => {
    // Handler to allow only numbers
    const handleNumbersOnly = (e) => {
        const value = e.target.value;
        // Only allow digits and optionally comma/period for decimals
        const numbersOnly = value.replace(/[^0-9.,]/g, '');
        return numbersOnly;
    };

    const handleHelpClick = () => {
        if (onShowHelp && field.helpInfo) {
            onShowHelp(field.helpInfo);
        }
    };

    // Build label with optional help icon
    const labelContent = field.noLabel ? null : (
        <span>
            {field.label}
            {(field.helpIcon || field.hasHelpIcon) && (
                <HelpIcon
                    tooltipText={field.helpTooltip}
                    onClick={field.helpInfo ? handleHelpClick : undefined}
                />
            )}
        </span>
    );

    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';

    return (
        <Form.Item
            className={itemClass}
            label={labelContent}
            name={field.name}
            rules={[
                { required: field.required !== false, message: '*Requis' },
                field.maxLength
                    ? {
                        max: field.maxLength,
                        message: `Maximum ${field.maxLength} caractères`,
                    }
                    : {},
                field.min !== undefined && field.numbersOnly
                    ? {
                        validator: (_, value) => {
                            if (value === undefined || value === '') return Promise.resolve();
                            const numValue = parseFloat(value);
                            if (isNaN(numValue) || numValue < field.min) {
                                return Promise.reject(`La valeur minimale est ${field.min}`);
                            }
                            return Promise.resolve();
                        }
                    }
                    : {},
                field.max !== undefined && field.numbersOnly
                    ? {
                        validator: (_, value) => {
                            if (value === undefined || value === '') return Promise.resolve();
                            const numValue = parseFloat(value);
                            if (isNaN(numValue) || numValue > field.max) {
                                return Promise.reject(`La valeur maximale est ${field.max}`);
                            }
                            return Promise.resolve();
                        }
                    }
                    : {},
            ].filter(rule => Object.keys(rule).length > 0)}
            extra={field.helpText}
            getValueFromEvent={field.numbersOnly ? (e) => handleNumbersOnly(e) : undefined}
        >
            {field.multiline ? (
                <Input.TextArea
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    rows={4}
                    showCount={field.maxLength ? true : false}
                />
            ) : (
                <Input
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    inputMode={field.numbersOnly ? 'decimal' : undefined}
                    addonAfter={field.suffix ? <InputSuffix text={field.suffix} /> : null}
                />
            )}
        </Form.Item>
    );
};

export default TextField;
