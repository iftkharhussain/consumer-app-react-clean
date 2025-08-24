import React from 'react';
import { Alert as AntAlert } from 'antd';
import styles from './Alert.module.css';

const Alert = ({ 
  title,
  description, 
  type = 'info',
  icon,
  actions,
  closable = false,
  onClose,
  className = '',
  ...props 
}) => {
  const alertClassName = [
    styles.alert,
    styles[`type-${type}`],
    className
  ].filter(Boolean).join(' ');

  const customActions = actions && (
    <div className={styles.actions}>
      {actions}
    </div>
  );

  return (
    <div className={alertClassName}>
      {icon && (
        <div className={styles.iconContainer}>
          {typeof icon === 'function' ? React.createElement(icon) : icon}
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.textContent}>
          {title && (
            <div className={styles.title}>
              {title}
            </div>
          )}
          {description && (
            <div className={styles.description}>
              {description}
            </div>
          )}
        </div>
        
        {customActions}
      </div>
      
      {props.endIcon && (
        <div className={styles.endIcon}>
          {typeof props.endIcon === 'function' ? React.createElement(props.endIcon) : props.endIcon}
        </div>
      )}
      
      {closable && (
        <button 
          className={styles.closeButton}
          onClick={onClose}
          type="button"
          aria-label="Close alert"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
