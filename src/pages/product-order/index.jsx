import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import ExploreProducts from '../../components/exploreProducts';
import FAQ from '../../components/faq';
import { getOrderDetails } from '../../services/api/productOrderService';
import { isOpenNow, getFormattedTodayHours } from '../../utils/businessHours';
import { useOfficeHours } from '../../hooks/useOfficeHours';
import styles from './ProductOrder.module.css';

const OrderProduct = () => {
    const { userProductId } = useParams();
    useOfficeHours({ userProductId });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!userProductId) {
                setError('No order ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getOrderDetails(userProductId);
                
                if (response.success) {
                    setOrderData(response.data);
                } else {
                    setError(response.message || 'Failed to load order details');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [userProductId]);

    const handleExploreProducts = () => {
        console.log('Explore products clicked');
        // Add navigation logic here
    };

    if (loading) {
        return (
            <div className={styles.orderProductPage}>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '20px' }}>Chargement de votre demande...</p>
                </div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className={styles.orderProductPage}>
                <h1 className={styles.mainHeading}>Erreur</h1>
                <p className={styles.mainDescription}>{error || 'Commande non trouvée'}</p>
            </div>
        );
    }

    const selectedQuote = orderData.selectedQuote || {};
    const advisorInfo = orderData.advisorInfo || {};
    
    // Check if we have actual quote data (not just fallback)
    const hasQuoteData = orderData && orderData.selectedQuote && orderData.selectedQuote.insurerName;
    
    const insurerName = selectedQuote.insurerName || 'Intact Insurance';
    const insurerLogo = selectedQuote.logo || '/images/intact-insurance.svg';
    const monthlyPrice = selectedQuote.monthlyPrice || 90;
    const yearlyPrice = selectedQuote.yearlyPrice || 1080;
    const isIntact = selectedQuote.isIntactDiscount || false;

    // Advisor details
    const companyName = 'Courtika'; // Hardcoded
    const companyLogo = advisorInfo.logo || '/images/courtika-assurances-inc.png';
    const phone = '1 (450) 762-9240';
    const isOpen = isOpenNow();
    const openStatus = isOpen ? 'Ouvert' : 'Fermé';
    const formattedHours = getFormattedTodayHours();
    const callDuration = advisorInfo.callDuration || 15;
    const maxRetries = advisorInfo.maxRetries || 2;
    
    // Coverages
    const coverages = orderData?.coverages || [];
    
    // Helper function to format coverage for display
    const formatCoverage = (coverage) => {
      const csioCode = coverage.csioCode || coverage.code || coverage.id || '';
      const limit = coverage.limit1 || coverage.limit || '';
      const deductible = coverage.deductible || '';
      
      // CSIO Code mapping to French names
      const coverageNames = {
        '20': 'Responsabilité civile',
        '21': 'Protection accident et collision',
        '22': 'Protection tous risques',
        '23': 'Protection contre les risques spécifiés',
        '24': 'Protection complémentaire',
        '43': 'Avenant 43 - Remplacement automobile',
        '27': 'Avenant 27 - Indemnité de remplacement',
        'CIV': 'Responsabilité civile',
        'COL': 'Collision',
        'COMP': 'Tous risques'
      };
      
      const name = coverageNames[csioCode] || `Protection ${csioCode}`;
      let amount = '';
      
      if (limit) {
        amount = `${Number(limit).toLocaleString('en-US')}$`;
      }
      if (deductible && deductible !== -1) {
        amount += amount ? ` (${Number(deductible).toLocaleString('en-US')}$)` : `${Number(deductible).toLocaleString('en-US')}$`;
      }
      
      return { name, amount: amount || 'Inclus' };
    };

    return (
        <div className={styles.orderProductPage}>
            <h1 className={styles.mainHeading}>
                Génial, un courtier vous appellera bientôt!
            </h1>
            
            <p className={styles.mainDescription}>
                Nous avons envoyé votre demande à un courtier en assurance de dommages chez {companyName}. 
                Celui-ci vous appellera dès que possible pour répondre à vos questions et finaliser les détails. 
                <strong> Assurez-vous de répondre au {phone}</strong>
            </p>

            <div className={styles.contentContainer}>
                {/* Left Column - Insurance Provider - Only show if we have actual quote data */}
                {hasQuoteData && (
                <div className={styles.leftColumn}>
                    <h2 className={styles.columnTitle}>L'assureur choisit:</h2>
                    
                    <img 
                        src={insurerLogo} 
                        alt={insurerName} 
                        className={styles.intactLogo}
                    />
                    
                    <div className={styles.priceContainer}>
                        {selectedQuote.oldMonthlyPrice && (
                            <span className={styles.oldPrice}>{selectedQuote.oldMonthlyPrice} $ / mois</span>
                        )}
                        <span className={styles.newPrice}>{monthlyPrice} $ / mois</span>
                    </div>
                    
                    {isIntact && (
                        <div className={styles.rabaisBadge}>
                            Rabais Intact appliqué!
                        </div>
                    )}
                    
                    <div style={{display: 'none'}}>
                    <h3 className={styles.protectionsTitle}>Vos protections</h3>
                    
                    {coverages.length > 0 ? (
                      coverages.map((coverage, index) => {
                        const { name, amount } = formatCoverage(coverage);
                        return (
                          <div key={index} className={styles.protectionItem}>
                            <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                            <div className={styles.protectionDetails}>
                              <p className={styles.protectionName}>{name}</p>
                              <p className={styles.protectionAmount}>{amount}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className={styles.protectionItem}>
                          <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                          <div className={styles.protectionDetails}>
                            <p className={styles.protectionName}>Responsabilité civile</p>
                            <p className={styles.protectionAmount}>2 000 000 $</p>
                          </div>
                        </div>
                        
                        <div className={styles.protectionItem}>
                          <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                          <div className={styles.protectionDetails}>
                            <p className={styles.protectionName}>Protection collision</p>
                            <p className={styles.protectionAmount}>500 $</p>
                          </div>
                        </div>
                        
                        <div className={styles.protectionItem}>
                          <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                          <div className={styles.protectionDetails}>
                            <p className={styles.protectionName}>Protection tous risques</p>
                            <p className={styles.protectionAmount}>250 $</p>
                          </div>
                        </div>
                      </>
                    )}
                    </div>
                </div>
                )}

                {/* Right Column - Broker Details */}
                <div className={styles.rightColumn}>
                    <h2 className={styles.brokerTitle}>Votre cabinet en assurance de dommages:</h2>
                    
                    <img 
                        src={companyLogo} 
                        alt={companyName} 
                        className={styles.courtikaLogo}
                    />
                    
                    <p className={isOpen ? styles.statusOpen : styles.statusClosed}>
                        {openStatus}
                    </p>
                    
                    <p className={styles.callSoon}>Un courtier vous appellera sous peu</p>
                    
                    <div className={styles.infoRow}>
                        <img src="/images/calendar.svg" alt="calendar" className={styles.infoIcon} />
                        <span className={styles.infoText}>{formattedHours}</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                        <img src="/images/clock.svg" alt="clock" className={styles.infoIcon} />
                        <span className={styles.infoText}>Durée de l'appel :{callDuration} min</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                        <img src="/images/bell-ringing-01.svg" alt="bell" className={styles.infoIcon} />
                        <span className={styles.infoText}>Si vous ne répondez pas, nous essayerons encore {maxRetries} fois.</span>
                    </div>
                </div>
            </div>

            {/* Explore Products Section */}
            <ExploreProducts onExplore={handleExploreProducts} />

            {/* FAQ Section */}
            <div style={{ marginTop: '48px' }}>
                <FAQ />
            </div>
        </div>
    );
};

export default OrderProduct;
