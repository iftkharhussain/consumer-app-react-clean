import React from 'react';
import StatusBadge from '../statusBadge2';
import styles from './InsuranceCard.module.css';
import { ImageUser } from '../../utils/icons';
import ContentBox from '../contentBox';
import Button from '../button';

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
  timeToComplete,
  onButtonClick 
}) => {
  const ActionBtn = ({ label, type = 'secondary', onClick }) => (
    <Button 
      size="md" 
      color={type === 'primary' ? 'primary' : 'secondary'} 
      onClick={onClick}
      className={type === 'primary' ? styles.btnPrimary : styles.btnSecondary}
    >
      {label}
    </Button>
  );

  return (
    <ContentBox className="lead-card">
      <div className={styles.insuranceCard}>
        {/* Header: avatar on left, title and badge stacked on right */}
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            <div className={styles.iconContainer}>
              {icon ? <span className={styles.icon}>{icon}</span> : <ImageUser className={styles.icon} />}
            </div>
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>{title}</h3>
            {badgeText && (
              <StatusBadge text={badgeText} type={badgeType} />
            )}
          </div>
        </div>

        {/* Description row */}
        <div className={styles.cardContent}>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {/* Footer actions */}
        <div className={`${styles.cardFooter} ${!timeToComplete ? styles.footerRight : ''}`}>
          {timeToComplete && (
            <span className={styles.timeToComplete}>{timeToComplete}</span>
          )}
          <div className={styles.footerButtons}>
            <ActionBtn label={buttonText} type={buttonType} onClick={onButtonClick} />
            {additionalButtons.map((lbl, idx) => (
              <ActionBtn key={idx} label={lbl} type="primary" onClick={() => onButtonClick && onButtonClick(lbl)} />
            ))}
          </div>
        </div>
      </div>
    </ContentBox>
  );
};

export default InsuranceCard;
