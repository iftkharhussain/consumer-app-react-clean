import React from 'react';
import styles from './AdvisorTypeBadge.module.css';

const AdvisorTypeBadge = ({ type, className = '', ...props }) => {
  // Define colors for different advisor types
  const getTypeConfig = (advisorType) => {
    switch (advisorType) {
      case 'Mortgage Broker':
        return {
          dotColor: '#2E90FA', // Blue
          colorClass: 'mortgage-broker'
        };
      case 'Insurance Broker':
      case 'online':
        return {
          dotColor: '#17B26A', // Green
          colorClass: 'insurance-broker'
        };
      case 'Financial Advisor':
        return {
          dotColor: '#6366F1', // Indigo
          colorClass: 'financial-advisor'
        };
      default:
        return {
          dotColor: '#717680', // Gray
          colorClass: 'default'
        };
    }
  };

  const { dotColor, colorClass } = getTypeConfig(type);

  return (
    <div 
      className={`${styles.badge} ${styles[colorClass]} ${className}`}
      {...props}
    >
      <div 
        className={styles.dot}
        style={{ backgroundColor: dotColor }}
      />
      <span className={styles.text}>
        {type}
      </span>
    </div>
  );
};

export default AdvisorTypeBadge;
