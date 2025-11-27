import React from 'react';
import styles from './ProgressSection.module.css';

const ProgressSection = ({ percentage = '33%', activeSteps = 1 }) => {
    return (
        <div className={styles.progressSection}>
            <div className={styles.progressSteps}>
                <div className={styles.progressStep}>
                    <span className={styles.stepLabel}>Estimation du prix</span>
                    <div className={styles.stepBar}>
                        {activeSteps >= 1 && <div className={styles.stepBarFill}></div>}
                    </div>
                </div>

                <div className={styles.progressStep}>
                    <span className={styles.stepLabel}>Achat au téléphone</span>
                    <div className={styles.stepBar}>
                        {activeSteps >= 2 && <div className={styles.stepBarFill}></div>}
                    </div>
                </div>

                <div className={styles.progressStep}>
                    <span className={styles.stepLabel}>Review Courtika</span>
                    <div className={styles.stepBar}>
                        {activeSteps >= 3 && <div className={styles.stepBarFill}></div>}
                    </div>
                </div>
            </div>

            <span className={styles.progressPercentage}>{percentage}</span>
        </div>
    );
};

export default ProgressSection;
