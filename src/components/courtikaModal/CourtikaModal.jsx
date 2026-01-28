import React, { useEffect, useRef, useState } from 'react';
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import TabCustomProgressBar from '../TabCustomProgressBar';
import styles from './CourtikaModal.module.css';
import { fortusService } from '../../services/api/fortusService';

/**
 * CourtikaModal - Call request modal for Fortus Leads
 * 
 * Props:
 * - isOpen: boolean - Whether modal is open
 * - onClose: function - Close handler
 * - userProductId: string (RECOMMENDED) - User product ID from user_products collection
 * - productSlug: string (FALLBACK) - Product slug (e.g., 'car-insurance')
 * - selectedQuote: object - Selected insurer quote details to save with order
 * - recalculatedQuote: object - Temporary quote from recalculation (to be saved when user accepts)
 * 
 * Prefer passing userProductId as it's more reliable than productSlug matching
 */
const CourtikaModal = ({ isOpen, onClose, userProductId, productSlug = 'car-insurance', selectedQuote, recalculatedQuote = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null); // 'success', 'error', null
    const timerRef = useRef(null);
    const navigate = useNavigate();

    const handleDemanderAppel = async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsLoading(true);
        setRequestStatus(null);
        console.log('Demander un appel clicked - calling Fortus API');

        try {
            // Prefer userProductId over productSlug for more reliable matching
            const params = userProductId 
                ? { userProductId, selectedQuote, recalculatedQuote } 
                : { productSlug, selectedQuote, recalculatedQuote };
            
            console.log('[CourtikaModal] Request params:', params);
            
            // Call Fortus API to send the lead
            const result = await fortusService.requestCall(params);
            
            if (result.success) {
                console.log('Fortus request successful:', result);
                setRequestStatus('success');
                message.success('Votre demande a été envoyée avec succès!');
                
                // Get userProductId from response if not already available
                const productId = result.data?.userProductId || userProductId;
                
                // Redirect to product order page
                timerRef.current = setTimeout(() => {
                    if (productId) {
                        navigate(`/car-insurance/product-order/${productId}`);
                    } else {
                        // Fallback if no userProductId available
                        window.location.reload();
                    }
                }, 2000);
            } else {
                console.warn('Fortus request failed:', result);
                setRequestStatus('error');
                message.error(result.message || 'Une erreur est survenue. Veuillez réessayer.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Fortus API error:', error);
            setRequestStatus('error');
            message.error('Une erreur est survenue. Veuillez réessayer.');
            setIsLoading(false);
        }
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
                        <div className={styles.loadingContent}>
                            <h3 className={styles.loadingText}>Nous vous connectons à un courtier..</h3>
                            <img
                                src="/images/39259805852ef0453b2b0f98eee91406934e42f6.gif"
                                alt="Chargement"
                                className={styles.loadingGif}
                            />
                        </div>
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
