/* eslint-disable */
import React from 'react';
import { Form, Input } from 'antd';
import 'styles/carFunnel/components/PhoneField.css';

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
    if (!value) return '';

    // Remove all non-digits
    let phoneNumber = value.replace(/\D/g, '');

    // If it starts with 1 and has more than 10 digits, strip the 1 (country code)
    if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
        phoneNumber = phoneNumber.slice(1);
    } else if (phoneNumber.length > 11 && phoneNumber.startsWith('1')) {
        // Handle cases where more digits might be pasted
        phoneNumber = phoneNumber.slice(1).slice(0, 10);
    } else if (phoneNumber.length > 10) {
        // Cap at 10 digits
        phoneNumber = phoneNumber.slice(0, 10);
    }

    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) {
        return phoneNumber;
    }

    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export const PhoneField = ({ field, isLastField = false }) => {
    return (
        <Form.Item
            label={field.noLabel ? null : field.label}
            key={field.name}
            className={isLastField ? 'phone-field-no-margin' : ''}
        >
            <div className="phone-field-wrapper">
                {/* Country Code - Not Editable */}
                <div className="phone-country-code">
                    {field.prefix || '+1'}
                </div>
                {/* Phone Input - Overlaps by 40px */}
                <Form.Item
                    name={field.name}
                    rules={[{ required: field.required !== false, message: '*Requis' }]}
                    className="phone-input-item"
                    getValueFromEvent={(e) => formatPhoneNumber(e.target.value)}
                    normalize={(value) => formatPhoneNumber(value)}
                >
                    <Input
                        type="tel"
                        inputMode="tel"
                        placeholder={field.placeholder || '(232) 323-2329'}
                        maxLength={14}
                        className="phone-input"
                    />
                </Form.Item>
            </div>
        </Form.Item>
    );
};

export default PhoneField;