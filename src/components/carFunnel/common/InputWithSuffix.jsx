/* eslint-disable */
import React from 'react';
import { Form, Input } from 'antd';
import './InputWithSuffix.css';

// Custom wrapper component that properly handles value/onChange from Form.Item
const InputWithSuffixWrapper = ({ value, onChange, placeholder, inputMode, suffix, maxLength }) => {
  return (
    <div className="input-with-suffix-container">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="input-with-suffix-field"
      />
      {suffix && (
        <span className="input-with-suffix-text">{suffix}</span>
      )}
    </div>
  );
};

const InputWithSuffix = ({ field, isLastField = false }) => {
  // Handler to allow only numbers
  const handleNumbersOnly = (e) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/[^0-9.,]/g, '');
    return numbersOnly;
  };

  // Build validation rules
  const rules = [
    { required: field.required !== false, message: '*Requis' }
  ];

  // Add min validation
  if (field.min !== undefined) {
    rules.push({
      validator: (_, value) => {
        if (value === undefined || value === '') return Promise.resolve();
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < field.min) {
          return Promise.reject(`La valeur minimale est ${field.min}`);
        }
        return Promise.resolve();
      }
    });
  }

  // Add max validation
  if (field.max !== undefined) {
    rules.push({
      validator: (_, value) => {
        if (value === undefined || value === '') return Promise.resolve();
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue > field.max) {
          return Promise.reject(`La valeur maximale est ${field.max}`);
        }
        return Promise.resolve();
      }
    });
  }

  return (
    <Form.Item
      style={isLastField ? { marginBottom: 0 } : undefined}
      label={field.noLabel ? null : field.label}
      name={field.name}
      rules={rules}
      getValueFromEvent={field.numbersOnly ? (e) => handleNumbersOnly(e) : undefined}
    >
      <InputWithSuffixWrapper
        placeholder={field.placeholder}
        inputMode={field.numbersOnly ? 'decimal' : undefined}
        suffix={field.suffix}
        maxLength={field.maxLength}
      />
    </Form.Item>
  );
};

export default InputWithSuffix;

