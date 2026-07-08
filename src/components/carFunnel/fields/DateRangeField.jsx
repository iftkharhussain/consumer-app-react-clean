/* eslint-disable */
import React from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import ImprovedDatePicker from 'components/carFunnel/common/ImprovedDatePicker';
import 'styles/carFunnel/components/DateRangeField.css';

export const DateRangeField = ({ field, isLastField = false }) => {
    // Determine year range based on validation type
    let fromYear = 1900;
    let toYear = dayjs().year() + 10;

    // Build validation rules for both start and end dates
    const rules = [{ required: field.required !== false, message: '*Requis' }];

    if (field.validation) {
        const { type, message } = field.validation;

        if (type === 'past') {
            toYear = dayjs().year();

            // Add validator to prevent future dates
            rules.push({
                validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    const selectedDate = dayjs(value);
                    const today = dayjs().startOf('day');

                    if (selectedDate.isAfter(today)) {
                        return Promise.reject(new Error(message || 'La date ne peut pas être dans le futur'));
                    }

                    return Promise.resolve();
                }
            });
        }
    }

    return (
        <div className={`date-range-field ${isLastField ? 'date-range-field--last' : ''}`}>
            {/* Label */}
            <div className="date-range-field__label">
                {field.label}
                {field.description && (
                    <span style={{ display: 'block', fontSize: '13px', color: '#697586', marginTop: '8px', fontWeight: 'normal', lineHeight: '1.5' }}>
                        {field.description}
                    </span>
                )}
            </div>

            {/* Date pickers in a row */}
            <div className="date-range-container">
                {/* Start Date */}
                <div className="date-range-field__item">
                    <div className="date-range-field__sub-label">
                        {field.startLabel || 'Début'}
                    </div>
                    <Form.Item
                        name={`${field.name}_start`}
                        rules={rules}
                        className="ant-form-item-no-margin"
                    >
                        <ImprovedDatePicker
                            placeholder={field.placeholder || 'JJ/MM/AAAA'}
                            fromYear={fromYear}
                            toYear={toYear}
                            pickerMode={field.pickerMode}
                        />
                    </Form.Item>
                </div>

                {/* End Date */}
                <div className="date-range-field__item">
                    <div className="date-range-field__sub-label">
                        {field.endLabel || 'Fin'}
                    </div>
                    <Form.Item
                        name={`${field.name}_end`}
                        rules={rules}
                        className="ant-form-item-no-margin"
                    >
                        <ImprovedDatePicker
                            placeholder={field.placeholder || 'JJ/MM/AAAA'}
                            fromYear={fromYear}
                            toYear={toYear}
                            pickerMode={field.pickerMode}
                        />
                    </Form.Item>
                </div>
            </div>
        </div>
    );
};

export default DateRangeField;
