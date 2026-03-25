import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoadingModal.module.css';

const LoadingModal = ({
    isOpen,
    onClose,
    userName = 'User',
    heading = null, // Optional custom heading
    steps = [
        'Création du compte Norga',
        'Analyse de vos réponses',
        'Connexion aux assureurs',
        'Application des rabais'
    ],
    totalDuration = 5000,
    autoClose = true
}) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(-1);
    const [progress, setProgress] = useState(0);

    // Use refs to track if we've started and to store the onClose callback
    const hasStartedRef = useRef(false);
    const onCloseRef = useRef(onClose);

    // Keep onClose ref updated
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(-1);
            setProgress(0);
            hasStartedRef.current = false;
            return;
        }

        // Prevent re-starting if already started
        if (hasStartedRef.current) {
            return;
        }
        hasStartedRef.current = true;

        const stepDuration = totalDuration / steps.length;

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + (100 / totalDuration) * 50; // Update every 50ms
            });
        }, 50);

        // Update steps one by one
        const stepIntervals = steps.map((_, index) =>
            setTimeout(() => {
                setCurrentStep(index);
            }, stepDuration * (index + 1))
        );

        // Auto close after total duration
        let closeTimeout;
        if (autoClose) {
            closeTimeout = setTimeout(() => {
                onCloseRef.current && onCloseRef.current();
            }, totalDuration);
        }

        return () => {
            clearInterval(progressInterval);
            stepIntervals.forEach(timeout => clearTimeout(timeout));
            if (closeTimeout) clearTimeout(closeTimeout);
            // Reset hasStartedRef so timer can be recreated if effect runs again (React StrictMode)
            hasStartedRef.current = false;
        };
    }, [isOpen, steps.length, totalDuration, autoClose]); // Removed onClose from deps

    if (!isOpen) return null;

    // Default heading uses translation with user's name
    // const displayHeading = heading || t('loadingModal.shoppingInsurers', { userName }) || `${userName}, nous magasinons les assureurs pour vous...`;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {/* Animated Car Icon with Progress */}
                <div className={styles.iconContainer}>
                    <svg className={styles.progressRing} width="99" height="99" viewBox="0 0 99 99">
                        <circle
                            className={styles.progressRingCircleBg}
                            cx="49.5"
                            cy="49.5"
                            r="44.5"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="5"
                        />
                        <circle
                            className={styles.progressRingCircle}
                            cx="49.5"
                            cy="49.5"
                            r="44.5"
                            fill="none"
                            stroke="#1A1ABA"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44.5}`}
                            strokeDashoffset={`${2 * Math.PI * 44.5 * (1 - progress / 100)}`}
                            transform="rotate(-90 49.5 49.5)"
                        />
                    </svg>
                    {/* <img
                        src="/images/quote-loading.png"
                        alt="Loading"
                        className={styles.carIcon}
                    /> */}
                </div>

                {/* Heading disabled - show only circle loading */}
                {/* <h2 className={styles.heading}>
                    {displayHeading}
                </h2> */}

                {/* Progress Steps disabled - show only circle loading */}
                {/* <table className={styles.stepsList}>
                    <tbody>
                        {steps.map((step, index) => (
                            <tr key={index} className={styles.stepItem}>
                                <td className={styles.stepIconCell}>
                                    <img
                                        src={currentStep >= index ? '/images/blue-tik.svg' : '/images/check.svg'}
                                        alt={currentStep >= index ? 'Completed' : 'Pending'}
                                        className={styles.stepIcon}
                                    />
                                </td>
                                <td className={styles.stepTextCell}>
                                    <span className={currentStep >= index ? styles.stepTextActive : styles.stepText}>
                                        {step}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table> */}
            </div>
        </div>
    );
};

export default LoadingModal;
