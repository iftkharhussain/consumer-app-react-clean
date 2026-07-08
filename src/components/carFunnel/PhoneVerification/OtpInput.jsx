/* eslint-disable */
import React from 'react';
import { Input } from 'antd';

/**
 * OTP Input Component
 * Uses Ant Design's Input.OTP for entering verification codes
 */
const OtpInput = ({ 
  value = '', 
  onChange, 
  placeholder = '', 
  disabled = false,
  maxLength = 4,
  error = false
}) => {
  const handleChange = (otpValue) => {
    if (onChange) {
      onChange(otpValue);
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      length={maxLength}
      disabled={disabled}
      status={error ? 'error' : ''}
      style={{ width: '100%' }}
    />
  );
};

export default OtpInput;
