/* eslint-disable */
import React from 'react';
import { Form } from 'antd';
import './CheckboxSelectField.css';

// Checkbox SVG icons
const CheckedIcon = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="9" height="9" rx="2" stroke="#FFFFFF" strokeWidth="1.5" />
        <path d="M7.5 3.5L4.5 7L3 5.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UncheckedIcon = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="9" height="9" rx="2" stroke="#ededed" strokeWidth="1.5" />
    </svg>
);

/**
 * Custom checkbox select wrapper that properly integrates with Ant Design Form
 * Receives value/onChange from Form.Item to properly trigger form updates
 */
const CheckboxSelectWrapper = ({ value = [], onChange, options }) => {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleSelect = (optionValue) => {
        const currentValues = [...selectedValues];

        let newValues;
        if (currentValues.includes(optionValue)) {
            // Remove value if already selected
            newValues = currentValues.filter(v => v !== optionValue);
        } else {
            // Add value if not selected
            newValues = [...currentValues, optionValue];
        }

        // Call onChange to properly trigger form update
        if (onChange) {
            onChange(newValues);
        }
    };

    const isSelected = (optionValue) => {
        return selectedValues.includes(optionValue);
    };

    return (
        <div className="checkbox-select-container">
            {options.map((option) => {
                const selected = isSelected(option.value);
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`checkbox-select-box ${selected ? 'selected' : ''}`}
                        onClick={() => handleSelect(option.value)}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <span className="checkbox-select-label">
                            {option.label}
                        </span>
                        <div className="checkbox-select-indicator">
                            {selected ? <CheckedIcon /> : <UncheckedIcon />}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

/**
 * CheckboxSelectField Component
 * Renders a group of checkbox-style selection options that allow multiple selections
 * Options display as cards with checkbox indicators
 */
export const CheckboxSelectField = ({ field, isLastField = false }) => {
    // Build validation rules array
    const validationRules = [
        {
            required: field.required !== false,
            message: '*Requis',
            validator: (_, value) => {
                if (field.required !== false && (!value || value.length === 0)) {
                    return Promise.reject('*Requis');
                }
                return Promise.resolve();
            }
        }
    ];

    // Add custom validation rule if provided
    if (field.customValidator) {
        validationRules.push({
            validator: (_, value) => field.customValidator(value)
        });
    }

    // Build the label component with possible bold formatting
    const renderLabel = () => {
        if (!field.label) return null;
        if (typeof field.label !== 'string') return field.label;

        const parts = field.label.split('**');
        if (parts.length === 1) return field.label;

        return (
            <span>
                {parts.map((part, index) =>
                    index % 2 === 1 ? (
                        <strong key={index} style={{ fontWeight: 700 }}>{part}</strong>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <Form.Item
            label={renderLabel()}
            name={field.name}
            rules={validationRules}
            style={isLastField ? { marginBottom: 0 } : undefined}
            initialValue={field.defaultValue || []}
        >
            <CheckboxSelectWrapper options={field.options} />
        </Form.Item>
    );
};

export default CheckboxSelectField;

