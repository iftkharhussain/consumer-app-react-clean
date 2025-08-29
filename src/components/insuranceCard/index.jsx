import React from 'react';
import StatusBadge from '../statusBadge2';
import styles from './InsuranceCard.module.css';
import { ImageUser } from '../../utils/icons';

const InsuranceCard = ({ 
  icon, 
  title, 
  subtitle, 
  badgeText, 
  badgeType = 'blue',
  description, 
  buttonText = 'Speak with an advisor',
  buttonType = 'secondary',
  additionalButtons = [],
  onButtonClick 
}) => {
  const Button = ({ label, type = 'secondary', onClick }) => (
    <button 
      className={`${styles.actionButton} ${type === 'primary' ? styles.btnPrimary : styles.btnSecondary}`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className={styles.insuranceCard}>
      {/* Header with avatar and badge */}
      <div className={styles.cardHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <div className={styles.iconContainer}>
              {icon ? <span className={styles.icon}>{icon}</span> : <ImageUser className={styles.icon} />}
            </div>
          </div>
        </div>
        {badgeText && (
          <StatusBadge text={badgeText} type={badgeType} />
        )}
      </div>

      {/* Title and description */}
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {/* Footer actions */}
      <div className={styles.cardFooter}>
        <Button label={buttonText} type={buttonType} onClick={onButtonClick} />
        {additionalButtons.map((lbl, idx) => (
          <Button key={idx} label={lbl} type="primary" onClick={() => onButtonClick && onButtonClick(lbl)} />
        ))}
      </div>
    </div>
  );
};

export default InsuranceCard;
