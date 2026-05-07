import './style.css'
import React, { useState, useEffect } from 'react'
import { Input } from 'antd'

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  if (!value) return '';
  let phoneNumber = value.replace(/\D/g, '');
  
  // If it starts with 1, strip it for formatting
  if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
    phoneNumber = phoneNumber.slice(1);
  } else if (phoneNumber.length > 10) {
    phoneNumber = phoneNumber.slice(0, 10);
  }
  
  const len = phoneNumber.length;
  if (len < 4) return phoneNumber;
  if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const Phone = ({ value, onChange }) => {
  const [phoneValue, setPhoneValue] = useState('')

  useEffect(() => {
    if (value) {
      // For the parent, we always send '1' + digits.
      // For display, we strip the '1' and format the rest.
      const raw = value.startsWith('1') ? value.substring(1) : value;
      setPhoneValue(formatPhoneNumber(raw));
    } else {
      setPhoneValue('');
    }
  }, [value])

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, '').slice(0, 10);
    
    // Update local display state
    setPhoneValue(formatPhoneNumber(numbersOnly));
    
    if (onChange) {
      // Backend expects '1' + digits
      onChange('1' + numbersOnly);
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
        placeholder="(514) 123-4567"
        className="phone-input"
        maxLength={14}
      />
    </div>
  )
}

export default Phone