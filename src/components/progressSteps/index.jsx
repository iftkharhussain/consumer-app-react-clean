import React from 'react';
import { Steps } from 'antd';
import styles from './ProgressSteps.module.css';

const ProgressSteps = ({ steps = [], current = 0 }) => {
  // Custom icon renderer
  const customIcon = (stepIndex, status) => {
    const isCompleted = stepIndex <= current;
    const iconSrc = isCompleted ? '/images/blue-tik.svg' : '/images/check.svg';
    
    return (
      <div className={`${styles.stepIcon} ${isCompleted ? styles.completed : ''}`}>
        <img src={iconSrc} alt={isCompleted ? 'Completed' : 'Pending'} />
      </div>
    );
  };

  // Map steps to Ant Design format with custom icons
  const stepsItems = steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    icon: customIcon(index, step.status)
  }));

  return (
    <div className={styles.progressStepsContainer}>
      <Steps
        current={current}
        items={stepsItems}
        className={styles.customSteps}
      />
    </div>
  );
};

export default ProgressSteps;
