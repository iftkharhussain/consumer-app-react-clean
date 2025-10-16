import React from 'react';
import Button from '../button';
import styles from './ProgressCard.module.css';

const ProgressCard = ({ 
  title = "Level Progress",
  percentage = 0,
  description = "",
  completedCount = 0,
  totalCount = 0,
  categories = [],
  buttonText = "Continue with your quotes",
  onButtonClick = () => {},
  showButton = true
}) => {
  return (
    <div className={styles.progressCard}>
      {/* Header with title and percentage */}
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.percentage}>{percentage}%</span>
      </div>

      {/* Description */}
      {description && (
        <p className={styles.description}>{description}</p>
      )}

      {/* Categories List */}
      {categories.length > 0 && (
        <div className={styles.categoriesList}>
          {categories.map((category, index) => (
            <div key={index} className={styles.categoryItem}>
              <div className={styles.checkIcon}>
                <img 
                  src={category.completed ? '/images/check-ok.svg' : '/images/check.svg'} 
                  alt={category.completed ? 'Completed' : 'Not completed'}
                />
              </div>
              <span className={styles.categoryName}>{category.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Button */}
      {showButton && (
        <Button 
          color="secondary" 
          size="md" 
          stretch={true}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default ProgressCard;
