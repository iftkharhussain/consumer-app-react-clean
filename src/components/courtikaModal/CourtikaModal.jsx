import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import TabCustomProgressBar from '../TabCustomProgressBar';
import styles from './CourtikaModal.module.css';

const CourtikaModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef(null);

    const handleDemanderAppel = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsLoading(true);
        timerRef.current = setTimeout(() => {
            window.location.href = '/car-insurance/product-order';
        }, 4000);
        console.log('Demander un appel clicked');
    };

    const handleAttendre = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsLoading(false);
        onClose();
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const tabs = [
        { label: 'Soumission reçu', progress: '100%' },
        { label: 'Acheter avec Courtika', progress: '0%' },
        { label: "C'est terminé!", progress: '0%' },
    ];

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
            closable={false}
            className={styles.courtikaModal}
        >
            <div className={styles.modalContent}>
                {isLoading && (
                    <div className={styles.loadingOverlay}>
                        <img
                            src="/images/39259805852ef0453b2b0f98eee91406934e42f6.gif"
                            alt="Chargement"
                            className={styles.loadingGif}
                        />
                    </div>
                )}
                {/* Progress Bar */}
                <div className={isLoading ? styles.contentHidden : ''}>
                    <TabCustomProgressBar 
                        tabs={tabs}
                        activeKey="1"
                        style={{padding: '29px 60px'}}
                        progressPercentage={33}
                    />
                </div>

                {/* Modal Body */}
                <div className={`${styles.modalBody} ${isLoading ? styles.contentHidden : ''}`}>
                    <h2 className={styles.modalTitle}>
                        Achetez au téléphone avec Courtika
                    </h2>

                    <p className={styles.modalDescription}>
                        Norga collabore avec Courtika, courtier en assurance de dommages certifié à l'AMF. Courtika peut répondre à vos questions, vérifier vos informations et vous aider à finaliser l'achat de votre assurance. <strong>Cliquez sur « Demander un appel » pour continuer.</strong>
                    </p>

                    <p className={styles.modalLorem}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>

                    <p className={styles.modalSubtitle}>
                        Courtier en assurance de dommages certifié à l'AMF:
                    </p>

                    <div className={styles.logoContainer}>
                        <img 
                            src="/images/courtika-assurances-inc.png" 
                            alt="Courtika" 
                            className={styles.courtikaLogo}
                        />
                    </div>
                {/* Footer Buttons */}
                <div className={styles.modalFooter}>
                    <button 
                        className={styles.primaryButton}
                        onClick={handleDemanderAppel}
                    >
                        Demander un appel
                    </button>
                    <button 
                        className={styles.secondaryButton}
                        onClick={handleAttendre}
                    >
                        Attendre
                    </button>
                </div>
                </div>

            </div>
        </Modal>
    );
};

export default CourtikaModal;
