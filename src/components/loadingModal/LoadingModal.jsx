import React from 'react';
import styles from './LoadingModal.module.css';

const LoadingModal = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.infiniteOverlay}>
            <div className={styles.spinnerWrapper}>
                <div className={styles.infiniteSpinner} />
            </div>
        </div>
    );
};

export default LoadingModal;
