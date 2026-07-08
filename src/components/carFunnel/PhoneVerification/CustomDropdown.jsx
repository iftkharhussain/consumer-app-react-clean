/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import styles from './PhoneVerification.module.css';

/**
 * Custom Dropdown Component
 * A styled dropdown select component
 */
const CustomDropdown = ({ 
  options, 
  selected, 
  onChange, 
  placeholder = 'Sélectionner une option',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className={styles.customDropdown} ref={dropdownRef}>
      <button 
        type="button"
        className={`${styles.dropdownButton} ${isOpen ? styles.dropdownButtonActive : ''}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedOption?.label || placeholder}
        <svg 
          className={`${styles.dropdownArrow} ${isOpen ? styles.dropdownArrowOpen : ''}`}
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          fill="none"
        >
          <path 
            d="M1 1.5L6 6.5L11 1.5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <ul className={styles.dropdownOptions}>
          {options.map((opt) => (
            <li 
              key={opt.value} 
              onClick={() => handleSelect(opt.value)}
              className={selected === opt.value ? styles.dropdownOptionSelected : ''}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
