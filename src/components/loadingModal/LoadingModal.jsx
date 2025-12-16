import React, { useState, useEffect } from 'react';
import styles from './LoadingModal.module.css';

const LoadingModal = ({ 
    isOpen, 
    onClose, 
    userName = 'Edward',
    steps = [
        'Création du compte Norga',
        'Analyse de vos réponses',
        'Connexion aux assureurs',
        'Application des rabais'
    ],
    totalDuration = 5000,
    autoClose = true
}) => {
    const [currentStep, setCurrentStep] = useState(-1);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(-1);
            setProgress(0);
            return;
        }

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
                onClose && onClose();
            }, totalDuration);
        }

        return () => {
            clearInterval(progressInterval);
            stepIntervals.forEach(timeout => clearTimeout(timeout));
            if (closeTimeout) clearTimeout(closeTimeout);
        };
    }, [isOpen, steps.length, totalDuration, autoClose, onClose]);

    if (!isOpen) return null;

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
                    <img 
                        src="/images/quote-loading.png" 
                        alt="Loading" 
                        className={styles.carIcon}
                    />
                </div>

                {/* Heading */}
                <h2 className={styles.heading}>
                    {userName}, nous magasinons les assureurs pour vous...
                </h2>

                {/* Progress Steps */}
                <table className={styles.stepsList}>
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
                </table>
            </div>
        </div>
    );
};

export default LoadingModal;
