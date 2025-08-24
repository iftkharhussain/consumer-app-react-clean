import React from 'react';
import styles from './Section.module.css';

const Section = ({ children, className, variant = 'default', width = '100%', ...props }) => {
  const isFullWidth = width === '100%' || width === '100vw' || width === 'none';
  
  const sectionClasses = [
    styles.section,
    styles[`section--${variant}`],
    isFullWidth ? styles['section--full-width'] : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={sectionClasses}
      style={{ width, ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Section;
