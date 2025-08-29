import React from 'react';
import styles from './StatusBadge.module.css';

const StatusBadge = ({ 
  type, 
  status = 'online', 
  showDot = true, 
  className = '', 
  ...props 
}) => {
  // Define colors for different advisor types
  const getTypeConfig = (advisorType) => {
    switch (advisorType) {
      case 'Mortgage Broker':
        return {
          dotColor: '#2E90FA', // Blue
          colorClass: 'mortgage-broker'
        };
      case 'Insurance Broker':
      case 'Home Insurance':
      case 'Life Insurance':
      case 'Auto Insurance':
      case 'Disability Insurance':
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

  // Normalize insurance types to "Insurance Broker"
  const normalizeType = (advisorType) => {
    if (['Home Insurance', 'Life Insurance', 'Auto Insurance', 'Disability Insurance'].includes(advisorType)) {
      return 'Insurance Broker';
    }
    return advisorType;
  };

  const { dotColor, colorClass } = getTypeConfig(type);
  const displayType = normalizeType(type);

  return (
    <div 
      className={`${styles.badge} ${styles[colorClass]} ${className}`}
      {...props}
    >
      {showDot && (
        <div 
          className={`${styles.dot} ${status === 'online' ? styles.online : styles.offline}`}
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span className={styles.text}>
        {displayType}
      </span>
      {status === 'online' && (
        <span className={styles.onlineText}>
          Online
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
