/* eslint-disable */
import React from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import ImprovedDatePicker from 'components/carFunnel/common/ImprovedDatePicker';

export const DateField = ({ field, isLastField = false }) => {
    // Build validation rules
    const rules = [
        { required: field.required !== false, message: '*Requis' }
    ];

    let fromYear = 1900;
    let toYear = dayjs().year() + 10;

    // Add custom validation rules if specified
    if (field.validation) {
        const { type, minAge, message } = field.validation;

        if (type === 'past' || type === 'minAge') {
            toYear = dayjs().year();
            if (type === 'minAge' && minAge) {
                toYear = dayjs().year() - minAge;
            }

            rules.push({
                validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const selectedDate = dayjs(value);
                    const today = dayjs().startOf('day');

                    // Check if date is in the future
                    if (selectedDate.isAfter(today)) {
                        return Promise.reject(new Error(message || 'La date ne peut pas être dans le futur'));
                    }

                    // Check minimum age if specified
                    if (type === 'minAge' && minAge) {
                        const age = today.diff(selectedDate, 'year');
                        if (age < minAge) {
                            return Promise.reject(new Error(message || `L'âge minimum requis est ${minAge} ans`));
                        }
                    }

                    return Promise.resolve();
                }
            });
        }
    }

    const itemClass = isLastField ? 'ant-form-item-no-margin' : 'ant-form-item-standard-margin';

    const label = (
        <span>
            {field.label}
            {field.description && (
                <span style={{ display: 'block', fontSize: '13px', color: '#697586', marginTop: '8px', fontWeight: 'normal', lineHeight: '1.5' }}>
                    {field.description}
                </span>
            )}
        </span>
    );

    return (
        <Form.Item
            label={label}
            name={field.name}
            rules={rules}
            className={itemClass}
        >
            <ImprovedDatePicker
                placeholder={field.placeholder}
                fromYear={fromYear}
                toYear={toYear}
                pickerMode={field.pickerMode}
                className={field.inlineWith ? 'full-width' : ''}
                style={!field.inlineWith ? { maxWidth: '235px' } : undefined}
            />
        </Form.Item>
    );
};

export default DateField;
