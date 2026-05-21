import './style.css'
import React, { useState, useEffect } from 'react'
import { Input } from 'antd'

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  if (!value) return '';
  // Remove non-digits
  let phoneNumber = value.replace(/\D/g, '');
  
  // If it starts with 1 and is 11 digits, it's a US/CA number with country code
  if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
    phoneNumber = phoneNumber.slice(1);
  }
  
  // Limit to 10 digits
  phoneNumber = phoneNumber.slice(0, 10);
  
  const len = phoneNumber.length;
  if (len < 4) return phoneNumber;
  if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const Phone = ({ value, onChange }) => {
  const [phoneValue, setPhoneValue] = useState('')

  useEffect(() => {
    if (value) {
      // Handle +1 prefix or just 1 prefix for backwards compatibility
      let raw = value;
      if (raw.startsWith('+1')) {
        raw = raw.substring(2);
      } else if (raw.startsWith('1')) {
        raw = raw.substring(1);
      }
      setPhoneValue(formatPhoneNumber(raw));
    } else {
      setPhoneValue('');
    }
  }, [value])

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Extract only digits
    let digits = input.replace(/\D/g, '');
    
    // If user typed '1' at start, handle it
    if (digits.length > 10 && digits.startsWith('1')) {
      digits = digits.slice(1);
    }
    
    // Cap at 10 digits
    const numbersOnly = digits.slice(0, 10);
    
    // Update local display state
    setPhoneValue(formatPhoneNumber(numbersOnly));
    
    if (onChange) {
      // Backend expects '+1' + digits for consistent E.164
      onChange('+1' + numbersOnly);
    }
  }

  return (
    <div className="phone-field-wrapper">
      <div className="phone-country-code">
        +1
      </div>
      <Input 
        type="tel"
        inputMode="tel"
        value={phoneValue}
        onChange={handlePhoneChange}
        placeholder="(450) 000-0000"
        className="phone-input"
        maxLength={14}
      />
    </div>
  )
}

export default Phone