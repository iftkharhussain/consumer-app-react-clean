import React, { useEffect, useRef, useState } from 'react';
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './PersonalizeModal.module.css';
import { fortusService } from '../../services/api/fortusService';
import { isOpenNow } from '../../utils/businessHours';
import { trackPixelEvent } from '../../utils/pixel';

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
const PersonalizeModal = ({ isOpen, onClose, userProductId, productSlug = 'car-insurance', selectedQuote, recommendedInsurer = null, recalculatedQuote = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState(null); // 'success', 'error', null
    const [selectedOption, setSelectedOption] = useState(isOpenNow() ? 'now' : 'later'); // 'now' or 'later'
    const [showFAQ, setShowFAQ] = useState(false);
    const timerRef = useRef(null);
    const navigate = useNavigate();
    
    // Get user info from Redux to pass in URL
    const userProfile = useSelector(state => state.app?.user_profile);
    const authUser = useSelector(state => state.app?.auth);

    const userEmail = userProfile?.email || authUser?.email || '';
    const userName = userProfile?.firstName 
        ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
        : authUser?.firstName 
        ? `${authUser.firstName} ${authUser.lastName || ''}`.trim()
        : (userProfile?.fullName || authUser?.fullName || '');
    const userPhone = userProfile?.phone || authUser?.phone || '';

    const submissionQuote = recommendedInsurer
        ? {
            insurerName: recommendedInsurer.name,
            carrierCode: recommendedInsurer.carrierCode,
            logo: recommendedInsurer.logo,
            monthlyPrice: recommendedInsurer.price,
            yearlyPrice: recommendedInsurer.yearlyPrice,
            coverages: recommendedInsurer.coverages,
            isCourtikaSearch: selectedQuote?.isCourtikaSearch || false,
            // "Personnaliser" flow -> hide quote card in the confirmation email
            // (Fortus still receives this recommended/cheapest carrier - unchanged)
            selectionType: 'personalize',
            discount: selectedQuote?.discount || false
        }
        : { ...selectedQuote, selectionType: 'personalize' };

    const displayQuote = selectedQuote;

    const handleDemanderAppel = async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsLoading(true);
        setRequestStatus(null);
        console.log('Demander un appel clicked - calling Fortus API');

        try {
            // Use cheapest insurer (recommendedInsurer) for the call, not the displayed one
            const carrierCode = submissionQuote?.carrierCode;
            
            console.log('\n🚀 [PersonalizeModal] SENDING REQUEST:', {
                carrierCode: carrierCode,
                insurerName: submissionQuote?.insurerName,
                premium: submissionQuote?.monthlyPrice,
                userProductId: userProductId,
                isCustomizeRequest: true
            });
            
            // Prefer userProductId over productSlug for more reliable matching
            const params = userProductId 
                ? { userProductId, selectedQuote: submissionQuote, recalculatedQuote, carrierCode, isCustomizeRequest: true, emailType: 'call' } 
                : { productSlug, selectedQuote: submissionQuote, recalculatedQuote, carrierCode, isCustomizeRequest: true, emailType: 'call' };
            
            console.log('[CourtikaModal] Request params:', params);
            
            // Call Fortus API to send the lead
            const result = await fortusService.requestCall(params);
            
            if (result.success) {
                console.log('Fortus request successful:', result);
                setRequestStatus('success');
                message.success('Votre demande a été envoyée avec succès!');

                // Trigger the phone call dialer on mobile only
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    window.location.href = 'tel:+14507629240';
                }
                
                // Get userProductId from response if not already available
                const productId = result.data?.userProductId || userProductId;
                
                // Redirect to call confirmation page with userProductId
                timerRef.current = setTimeout(() => {
                    navigate(`/confirmation-call/${productId}`);
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

    const handleContinue = async () => {
        if (selectedOption === 'now') {
            // Call immediately
            handleDemanderAppel();
        } else {
            // Schedule for later - save order first, then navigate to schedule page
            setIsLoading(true);
            try {
                // Extract carrier code from selected quote
                const carrierCode = submissionQuote?.carrierCode;
                
                // Prefer userProductId over productSlug for more reliable matching
                const params = userProductId 
                    ? { userProductId, selectedQuote: submissionQuote, recalculatedQuote, carrierCode, scheduleLater: true, isCustomizeRequest: true } 
                    : { productSlug, selectedQuote: submissionQuote, recalculatedQuote, carrierCode, scheduleLater: true, isCustomizeRequest: true };
                
                console.log('[CourtikaModal] Saving order for schedule later:', params);
                
                // Save the order (but don't send to Fortus yet)
                const result = await fortusService.requestCall(params);
                
                if (result.success) {
                    const productId = result.data?.userProductId || userProductId;
                    console.log('[CourtikaModal] Order saved, navigating to schedule-call with productId:', productId);
                    
                    setIsLoading(false);
                    onClose();
                    const params = new URLSearchParams();
                    if (userName) params.append('name', userName);
                    if (userEmail) params.append('email', userEmail);
                    if (userPhone) params.append('phone', userPhone);
                    
                    navigate(`/schedule-call?${params.toString()}`, { state: { userProductId: productId, selectedQuote: submissionQuote, recalculatedQuote } });
                } else {
                    console.warn('Failed to save order:', result);
                    setIsLoading(false);
                    message.error(result.message || 'Une erreur est survenue.');
                }
            } catch (error) {
                console.error('Error saving order:', error);
                setIsLoading(false);
                message.error('Une erreur est survenue.');
            }
        }
    };

    const handleAttendre = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsLoading(false);
        setSelectedOption(isOpenNow() ? 'now' : 'later');
        setShowFAQ(false);
        onClose();
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // Icon components (simple SVG icons)
    const PhoneIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
    );

    const CalendarIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );

    const ArrowRightIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    );

    const CheckIcon = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );

    const ChevronDownIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );

    const ChevronUpIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    );

    return (
        <Modal
            open={isOpen}
            onCancel={handleAttendre}
            footer={null}
            width={680}
            centered
            closable={true}
            className={styles.courtikaModal}
            modalRender={(modal) => (
                <div style={{ background: '#ffffff', borderRadius: '12px' }}>
                    {modal}
                </div>
            )}
        >
            <div className={styles.modalContainer} style={{ background: '#ffffff' }}>
                {isLoading && (
                    <div className={styles.loadingOverlay} style={{ background: '#ffffff' }}>
                        <div className={styles.loadingContent} style={{ background: '#ffffff' }}>
                            <h3 className={styles.loadingText} style={{ background: '#ffffff', opacity: 1 }}>Nous vous connectons à un courtier..</h3>
                            <img
                                src="/images/39259805852ef0453b2b0f98eee91406934e42f6.gif"
                                alt="Chargement"
                                className={styles.loadingGif}
                                style={{ background: '#ffffff', opacity: 1 }}
                            />
                        </div>
                    </div>
                )}

                <div className={`${styles.mainCard} ${isLoading ? styles.contentHidden : ''}`}>
                    {/* Header */}
                    <div className={styles.cardHeader}>
                        {/* Logo Transition */}
                        <div className={styles.logoTransition}>
                            <div className={styles.logoBox}>
                                <img 
                                    src="/images/norga-blue-logo.png" 
                                    alt="Norga" 
                                    className={styles.logoImage}
                                />
                            </div>
                            
                            <div className={styles.animatedDots}>
                                <div className={styles.dot} style={{ animationDelay: '0ms' }}></div>
                                <div className={styles.dot} style={{ animationDelay: '300ms' }}></div>
                                <div className={styles.dot} style={{ animationDelay: '600ms' }}></div>
                            </div>
                            
                            <div className={styles.logoBoxHighlight}>
                                <img 
                                    src="/images/courtika-assurances-inc.png" 
                                    alt="Courtika" 
                                    className={styles.logoImage}
                                />
                            </div>
                        </div>

                        <h1 className={styles.mainTitle}>
                           Vous souhaitez personnaliser vos protections?
                        </h1>
                        <p className={styles.mainDescription}>
                            Courtika, cabinet certifié à l’AMF, peut poursuivre avec vous pour ajuster vos franchises, revoir vos protections et comparer d’autres options, sans engagement. Vos informations seront déjà transmises pour vous faire gagner du temps.
                        </p>
                    </div>

                    {/* Content */}
                    <div className={styles.cardContent}>
                        {/* Selection Summary */}
                        {displayQuote && (
                            <div className={styles.selectionSummary}>
                                <div className={styles.summaryLeft}>
                                    <div className={styles.insurerLogoBox}>
                                        <img 
                                            src={displayQuote.logo} 
                                            alt={displayQuote.insurerName}
                                            className={styles.insurerLogo}
                                        />
                                    </div>
                                    <div>
                                        <p className={styles.summaryLabel}>Votre sélection</p>
                                        <p className={styles.summaryInsurer}>{displayQuote.insurerName}</p>
                                    </div>
                                </div>
                                {!displayQuote.isCourtikaSearch && (
                            <div className={styles.summaryRight}>
                                <p className={styles.summaryPrice}>
                                    {displayQuote.monthlyPrice}$/mois 
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '400', marginLeft: '4px' }}>(+9% taxes)</span>
                                </p>
                                {displayQuote.yearlyPrice && !displayQuote.discount && (
                                    <p className={styles.summaryOldPrice}>{displayQuote.yearlyPrice}$/an</p>
                                )}
                                {displayQuote.discount && displayQuote.yearlyPrice && (
                                    <p className={styles.summaryOldPrice} style={{ color: '#64748b', fontSize: '11px' }}>{displayQuote.yearlyPrice}$/an</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                        {/* Question */}
                        <h2 className={styles.questionTitle}>
                            Comment souhaitez-vous être contacté ?
                        </h2>

                        {/* Options */}
                        <div className={styles.optionsContainer}>
                            {/* Option 1 - Call Now */}
                            {isOpenNow() && (
                                <button
                                    onClick={() => setSelectedOption('now')}
                                    className={`${styles.optionButton} ${selectedOption === 'now' ? styles.optionSelected : ''}`}
                                >
                                    <div className={styles.optionContent}>
                                        <div className={`${styles.radioButton} ${selectedOption === 'now' ? styles.radioSelected : ''}`}>
                                            {selectedOption === 'now' && <div className={styles.radioInner} />}
                                        </div>

                                        <div className={`${styles.iconBox} ${selectedOption === 'now' ? styles.iconBoxActive : ''}`}>
                                            <PhoneIcon />
                                        </div>
                                        
                                        <div className={styles.optionText}>
                                            <h3 className={styles.optionTitle}>Appeler maintenant</h3>
                                            <p className={styles.optionDescription}>Ligne d'appel prioritaire</p>
                                        </div>

                                        <div className={`${styles.onlineIndicator} ${!isOpenNow() ? styles.onlineIndicatorClosed : ''}`}>
                                            <div className={`${styles.pulsingDot} ${!isOpenNow() ? styles.pulsingDotClosed : ''}`}></div>
                                            <span className={`${styles.onlineText} ${!isOpenNow() ? styles.onlineTextClosed : ''}`}>
                                                {isOpenNow() ? 'Ouvert' : 'Fermé'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {/* Option 2 - Schedule Later */}
                            <button
                                onClick={() => setSelectedOption('later')}
                                className={`${styles.optionButton} ${selectedOption === 'later' ? styles.optionSelected : ''}`}
                            >
                                <div className={styles.optionContent}>
                                    <div className={`${styles.radioButton} ${selectedOption === 'later' ? styles.radioSelected : ''}`}>
                                        {selectedOption === 'later' && <div className={styles.radioInner} />}
                                    </div>

                                    <div className={`${styles.iconBox} ${selectedOption === 'later' ? styles.iconBoxActive : ''}`}>
                                        <CalendarIcon />
                                    </div>
                                    
                                    <div className={styles.optionText}>
                                        <h3 className={styles.optionTitle}>Planifier un appel plus tard</h3>
                                        <p className={styles.optionDescription}>Choisissez votre créneau</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* CTA Button */}
                        <button 
                            className={styles.ctaButton}
                            onClick={handleContinue}
                        >
                            {selectedOption === 'now' ? (isOpenNow() ? 'Appeler maintenant' : 'Demander un appel') : 'Continuer'}
                            <ArrowRightIcon />
                        </button>

                        {/* Trust Signals */}
                        <div className={styles.trustSignals}>
                            <div className={styles.trustItem}>
                                <CheckIcon />
                                <span>Certifié AMF</span>
                            </div>
                            <div className={styles.trustItem}>
                                <CheckIcon />
                                <span>100% gratuit</span>
                            </div>
                            <div className={styles.trustItem}>
                                <CheckIcon />
                                <span>Sans engagement</span>
                            </div>
                        </div>

                        {/* FAQ Toggle */}
                        <button
                            onClick={() => setShowFAQ(!showFAQ)}
                            className={styles.faqToggle}
                        >
                            Questions fréquentes
                            {showFAQ ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </button>

                        {/* FAQ Content */}
                        {showFAQ && (
                            <div className={styles.faqContent}>
                                <div className={styles.faqItem}>
                                    <p className={styles.faqQuestion}>Que se passe-t-il pendant l'appel ?</p>
                                    <p className={styles.faqAnswer}>Le courtier vérifie vos informations et finalise votre contrat (~15 min).</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <p className={styles.faqQuestion}>Le prix va-t-il changer ?</p>
                                    <p className={styles.faqAnswer}>Le prix affiché est une estimation. Le courtier confirmera le prix final après vérification.</p>
                                </div>
                                <div className={styles.faqItem}>
                                    <p className={styles.faqQuestion}>Puis-je annuler ?</p>
                                    <p className={styles.faqAnswer}>Oui, vous pouvez annuler ou modifier à tout moment sans frais.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PersonalizeModal;
