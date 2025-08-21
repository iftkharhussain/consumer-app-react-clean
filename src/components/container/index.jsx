import React from 'react';
import styles from './Container.module.css';

const Container = ({ children, className, variant = 'default', ...props }) => {
  return (
    <div 
      className={`${styles.container} ${styles[`container--${variant}`]} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
