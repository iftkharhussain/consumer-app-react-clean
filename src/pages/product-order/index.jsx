import React from 'react';
import ExploreProducts from '../../components/exploreProducts';
import FAQ from '../../components/faq';
import styles from './ProductOrder.module.css';

const OrderProduct = () => {
    const handleExploreProducts = () => {
        console.log('Explore products clicked');
        // Add navigation logic here
    };

    return (
        <div className={styles.orderProductPage}>
            <h1 className={styles.mainHeading}>
                Génial, un courtier vous appellera bientôt!
            </h1>
            
            <p className={styles.mainDescription}>
                Nous avons envoyé votre demande à un courtier en assurance de dommages chez Courtika. 
                Celui-ci vous appellera dès que possible pour répondre à vos questions et finaliser les détails. 
                <strong>Assurez-vous de répondre au XXX XXX XXXX</strong>
            </p>

            <div className={styles.contentContainer}>
                {/* Left Column - Insurance Provider */}
                <div className={styles.leftColumn}>
                    <h2 className={styles.columnTitle}>L'assureur choisit:</h2>
                    
                    <img 
                        src="/images/intact-insurance.svg" 
                        alt="Intact Insurance" 
                        className={styles.intactLogo}
                    />
                    
                    <div className={styles.priceContainer}>
                        <span className={styles.oldPrice}>102 $ / mo</span>
                        <span className={styles.newPrice}>90 $ / mo</span>
                    </div>
                    
                    <div className={styles.rabaisBadge}>
                        Rabais Intact appliqué!
                    </div>
                    
                    <h3 className={styles.protectionsTitle}>Vos protections</h3>
                    
                    <div className={styles.protectionItem}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <div className={styles.protectionDetails}>
                            <p className={styles.protectionName}>Protection dommage matériel</p>
                            <p className={styles.protectionAmount}>2 000 000 $</p>
                        </div>
                    </div>
                    
                    <div className={styles.protectionItem}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <div className={styles.protectionDetails}>
                            <p className={styles.protectionName}>Protection accident et collision</p>
                            <p className={styles.protectionAmount}>500 $</p>
                        </div>
                    </div>
                    
                    <div className={styles.protectionItem}>
                        <img src="/images/Tick.svg" alt="check" className={styles.tickIcon} />
                        <div className={styles.protectionDetails}>
                            <p className={styles.protectionName}>Protection dommage matériel</p>
                            <p className={styles.protectionAmount}>250 $</p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Broker Details */}
                <div className={styles.rightColumn}>
                    <h2 className={styles.brokerTitle}>Votre courtier en assurance de dommages:</h2>
                    
                    <img 
                        src="/images/courtika-assurances-inc.png" 
                        alt="Courtika" 
                        className={styles.courtikaLogo}
                    />
                    
                    <p className={styles.statusOpen}>Ouvert</p>
                    
                    <p className={styles.callSoon}>Un courtier vous appellera sous peu</p>
                    
                    <div className={styles.infoRow}>
                        <img src="/images/calendar.svg" alt="calendar" className={styles.infoIcon} />
                        <span className={styles.infoText}>Ouvert de 8:30 à 16:30 du lundi au vendredi</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                        <img src="/images/clock.svg" alt="clock" className={styles.infoIcon} />
                        <span className={styles.infoText}>Durée de l'appel: 10 min</span>
                    </div>
                    
                    <div className={styles.infoRow}>
                        <img src="/images/bell-ringing-01.svg" alt="bell" className={styles.infoIcon} />
                        <span className={styles.infoText}>Si vous ne répondez pas, nous essayerons encore 2 fois.</span>
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
