import React from 'react';
import { Modal } from 'antd';
import TabCustomProgressBar from '../TabCustomProgressBar';
import styles from './CourtikaModal.module.css';

const CourtikaModal = ({ isOpen, onClose }) => {
    const handleDemanderAppel = () => {
        console.log('Demander un appel clicked');
    };

    const handleAttendre = () => {
        onClose();
    };

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
                {/* Progress Bar */}
                <TabCustomProgressBar 
                    tabs={tabs}
                    activeKey="1"
                    style={{padding: '29px 60px'}}
                    progressPercentage={33}
                />

                {/* Modal Body */}
                <div className={styles.modalBody}>
                    <h2 className={styles.modalTitle}>
                        Achetez au téléphone avec Courtika
                    </h2>

                    <p className={styles.modalDescription}>
                        Norga collabore avec Courtika, courtier en assurance de dommages certifié à l'AMF. Courtika peut répondre à vos questions, vérifier vos informations et vous aider à finaliser l'achat de votre assurance. <strong>Cliquez sur « Demander un appel » pour continuer.</strong>
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
