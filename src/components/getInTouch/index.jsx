import React from 'react';
import Button from '../button/Button';
import styles from './GetInTouch.module.css';

const GetInTouch = ({ 
  title = "Still have questions?", 
  description = "Can't find the answer you're looking for? Please chat to our friendly team.",
  buttonText = "Get in touch",
  onButtonClick 
}) => {
  return (
    <div className={styles.getInTouchSection}>
      <div className={styles.avatarsRow}>
        <div className={styles.avatar1}>
          <img src="/images/Avatar.svg" alt="Team member" />
        </div>
        <div className={styles.avatar2}>
          <img src="/images/Avatar-1.svg" alt="Team member" />
        </div>
        <div className={styles.avatar3}>
          <img src="/images/Avatar-2.svg" alt="Team member" />
        </div>
      </div>
      
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      
      <Button 
        type="primary"
        onClick={onButtonClick}
        className={styles.button}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default GetInTouch;
