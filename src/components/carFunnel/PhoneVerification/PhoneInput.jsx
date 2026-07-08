/* eslint-disable */
import React from 'react';
import styles from './PhoneVerification.module.css';

/**
 * Custom Phone Input Component
 * A styled phone number input with Canadian format
 */
const PhoneInput = ({ 
  value = '', 
  onChange, 
  placeholder = '(xxx) xxx-xxxx', 
  disabled = false,
  prefix = '+1',
  error = false
}) => {
  // Format phone number for display
  const formatPhoneForDisplay = (digits) => {
    if (!digits) return '';
    
    const cleanDigits = digits.replace(/\D/g, '');
    
    if (cleanDigits.length === 0) return '';
    if (cleanDigits.length <= 3) return `(${cleanDigits}`;
    if (cleanDigits.length <= 6) return `(${cleanDigits.substring(0, 3)}) ${cleanDigits.substring(3)}`;
    return `(${cleanDigits.substring(0, 3)}) ${cleanDigits.substring(3, 6)}-${cleanDigits.substring(6, 10)}`;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Extract only digits from input
    const digits = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits (Canadian phone number)
    const limitedDigits = digits.substring(0, 10);
    
    // Call onChange with clean digits
    if (onChange) {
      onChange(limitedDigits);
    }
  };

  const displayValue = formatPhoneForDisplay(value);

  return (
    <div className={`${styles.phoneInputContainer} ${error ? styles.phoneInputError : ''}`}>
      <span className={styles.phonePrefix}>{prefix}</span>
      <input
        type="tel"
        className={styles.phoneInput}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="tel"
      />
    </div>
  );
};

export default PhoneInput;
