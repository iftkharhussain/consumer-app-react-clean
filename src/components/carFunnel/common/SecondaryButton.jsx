/* eslint-disable */
import React from 'react';
import 'styles/carFunnel/components/SecondaryButton.css';

const SecondaryButton = ({ children, onClick, className, disabled, ...props }) => {
  return (
    <button
      type="button"
      className={`secondary-button btn-secondary ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
