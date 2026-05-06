import React from 'react';
import styles from './AdvisorTypeBadge.module.css';

const AdvisorTypeBadge = ({ type, className = '', ...props }) => {
  // Define colors for different advisor types
  const getTypeConfig = (advisorType) => {
    const lowerType = (advisorType || '').toLowerCase();
    
    if (lowerType.includes('mortgage') || lowerType.includes('hypo')) {
      return {
        dotColor: '#2E90FA', // Blue
        colorClass: 'mortgage-broker'
      };
    }
    
    if (lowerType.includes('insurance') || lowerType.includes('dommage') || lowerType.includes('assurance')) {
      return {
        dotColor: '#17B26A', // Green
        colorClass: 'insurance-broker'
      };
    }
    
    if (lowerType.includes('advisor') || lowerType.includes('financ') || lowerType.includes('sécurité') || lowerType.includes('securite')) {
      return {
        dotColor: '#6366F1', // Indigo
        colorClass: 'financial-advisor'
      };
    }

    return {
      dotColor: '#717680', // Gray
      colorClass: 'default'
    };
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
