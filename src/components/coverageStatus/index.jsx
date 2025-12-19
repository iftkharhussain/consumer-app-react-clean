import React, { useState, useEffect } from 'react';
import styles from './index.module.css';

const CoverageStatus = ({
    active,
    onChange,
    activeText = "couvert",
    inactiveText = "non couvert",
    disabled = false
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const color = active ? '#1A1ABA' : '#C8C8C8';

    // Determine text display
    let displayText = active ? activeText : inactiveText;
    if (isLoading) {
        displayText = "Chargement...";
    }

    const handleClick = (e) => {
        e.stopPropagation();
        if (disabled || isLoading) return;

        setIsLoading(true);

        // Simulate loading for 2 seconds
        setTimeout(() => {
            setIsLoading(false);
            onChange?.(!active);
        }, 2000);
    };

    return (
        <div
            className={`${styles.wrapper} ${(!active || disabled || isLoading) ? styles.inactive : ''}`}
            onClick={handleClick}
        >
            <div className={styles.svgContainer}>
                {active ? (
                    <svg width="25" height="11" viewBox="0 0 25 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="24" height="10" rx="5" fill="white" stroke="#1A1ABA" />
                        <rect width="15" height="11" rx="5.5" fill="#1A1ABA" />
                    </svg>
                ) : (
                    <svg width="25" height="11" viewBox="0 0 25 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.5" y="0.5" width="24" height="10" rx="5" fill="white" stroke="#C8C8C8" />
                        <rect x="10" width="15" height="11" rx="5.5" fill="#C8C8C8" />
                    </svg>
                )}
            </div>
            <span className={styles.text} style={{ color: isLoading ? '#98A2B3' : color }}>
                {displayText}
            </span>
        </div>
    );
};

export default CoverageStatus;
