import React from 'react';
import styles from './StatusBadge.module.css';

const StatusBadge = ({ text, type = 'blue', className = '' }) => {
  const badgeClass = `${styles.statusBadge} ${styles[type]} ${className}`;
  
  return (
    <div className={badgeClass}>
      <span className={styles.badgeText}>{text}</span>
    </div>
  );
};

export default StatusBadge;
