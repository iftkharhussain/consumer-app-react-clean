import React from 'react';
import styles from './Heading.module.css';

const Heading = ({ level = 1, children, className, ...props }) => {
  const HeadingTag = `h${level}`;
  
  return (
    <HeadingTag 
      className={`${styles.heading} ${styles[`heading--${level}`]} ${className || ''}`}
      {...props}
    >
      {children}
    </HeadingTag>
  );
};

export default Heading;
