import React from 'react';
import styles from './Text.module.css';

const Text = ({ 
  variant = 'body-md', 
  color = 'primary', 
  children, 
  className = '',
  as: Component = 'p',
  ...props 
}) => {
  const textClassName = [
    styles.text,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={textClassName} {...props}>
      {children}
    </Component>
  );
};

export default Text;
