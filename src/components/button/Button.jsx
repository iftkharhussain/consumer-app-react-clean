import React from 'react';
import { Button as AntButton } from 'antd';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onClick, 
  className = '', 
  ...props 
}) => {
  const getButtonClass = () => {
    const baseClass = styles.button;
    const variantClass = styles[variant] || styles.primary;
    const sizeClass = styles[size] || styles.md;
    const customClass = className;
    
    return `${baseClass} ${variantClass} ${sizeClass} ${customClass}`.trim();
  };

  return (
    <AntButton
      className={getButtonClass()}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
