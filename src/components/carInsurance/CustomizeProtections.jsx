import React, { useState } from 'react';
import { Switch, Spin } from 'antd';
import Button from '../button/Button';
import styles from './CustomizeProtections.module.css';

const CustomizeProtections = ({ onBack }) => {
    const [protections, setProtections] = useState({
        responsabilite: { included: true, amount: 2000000 },
        collision: { included: true, amount: 500 },
        accidents: { included: true, amount: 250 },
        bonifiee: { included: true },
        assistance: { included: true }
    });

    const handleToggle = (key, value) => {
        setProtections(prev => ({
            ...prev,
            [key]: { ...prev[key], included: value }
        }));
    };

    const handleAmountChange = (key, delta) => {
        setProtections(prev => ({
            ...prev,
            [key]: { ...prev[key], amount: Math.max(0, prev[key].amount + delta) }
        }));
    };

    return (
        <div className={styles.customizeContainer}>
            {/* Back Button */}
            <button className={styles.backButton} onClick={onBack}>
                <img src="/images/back-button.svg" alt="back" className={styles.backIcon} />
                Retour
            </button>

            {/* Page Heading */}
            <h1 className={styles.pageHeading}>Personnalisez vos protections</h1>

            {/* Vehicle Info Cards - First Row */}
            <div className={styles.vehicleRow}>
                <div className={styles.vehicleCard}>
                    <div className={styles.vehicleHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <span className={styles.vehicleStatus}>Toujours inclus</span>
                    </div>
                </div>
                <div className={styles.vehicleCard}>
                    <div className={styles.vehicleHeader}>
                        <span className={styles.vehicleName}>Honda, Civic, 2018</span>
                        <span className={styles.vehicleStatus}>Toujours inclus</span>
                    </div>
                </div>
            </div>

            {/* Protection Cards - First Row */}
            <div className={styles.protectionCardsRow}>
                {/* Responsabilité civile */}
                <div className={styles.protectionCard}>
                    <div className={styles.protectionCardHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <div className={styles.toggleGroup}>
                            <Switch 
                                checked={protections.responsabilite.included}
                                onChange={(checked) => handleToggle('responsabilite', checked)}
                                size="small"
                            />
                            <span className={styles.toggleLabel}>couvert</span>
                        </div>
                    </div>
                    
                    <div className={styles.protectionContent}>
                        <h3 className={styles.protectionTitle}>Responsabilité civile</h3>
                        <img src="/images/car1.svg" alt="car" className={styles.carImage} />
                        <p className={styles.protectionDesc}>
                            Couvre les dommages à ce qui ne vous appartient pas quand vous causez un accident
                        </p>
                        <p className={styles.coverageLabel}>Couverture jusqu'à:</p>
                        <div className={styles.amountControl}>
                            <button className={styles.amountButton} onClick={() => handleAmountChange('responsabilite', -100000)}>-</button>
                            <span className={styles.amountValue}>{protections.responsabilite.amount.toLocaleString()} $</span>
                            <button className={styles.amountButton} onClick={() => handleAmountChange('responsabilite', 100000)}>+</button>
                        </div>
                    </div>
                </div>

                {/* Collision et renversement */}
                <div className={styles.protectionCard}>
                    <div className={styles.protectionCardHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <div className={styles.toggleGroup}>
                            <Switch 
                                checked={protections.collision.included}
                                onChange={(checked) => handleToggle('collision', checked)}
                                size="small"
                            />
                            <span className={styles.toggleLabel}>couvert</span>
                        </div>
                    </div>
                    
                    <div className={styles.protectionContent}>
                        <h3 className={styles.protectionTitle}>Collision et renversement (B2)</h3>
                        <img src="/images/car2.svg" alt="car" className={styles.carImage} />
                        <p className={styles.protectionDesc}>
                            Couvre les dommages causés à votre auto lorsque vous entrez en collision avec quelqu'un ou quelque chose.
                        </p>
                        <p className={styles.coverageLabel}>Franchise :</p>
                        <div className={styles.amountControl}>
                            <button className={styles.amountButton} onClick={() => handleAmountChange('collision', -50)}>-</button>
                            <span className={styles.amountValue}>{protections.collision.amount} $</span>
                            <button className={styles.amountButton} onClick={() => handleAmountChange('collision', 50)}>+</button>
                        </div>
                    </div>
                </div>

                {/* Accidents sans collision */}
                <div className={styles.protectionCard}>
                    <div className={styles.protectionCardHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <div className={styles.toggleGroup}>
                            <Switch 
                                checked={protections.accidents.included}
                                onChange={(checked) => handleToggle('accidents', checked)}
                                size="small"
                            />
                            <span className={styles.toggleLabel}>couvert</span>
                        </div>
                    </div>
                    
                    <div className={styles.protectionContent}>
                        <h3 className={styles.protectionTitle}>Accidents sans collision ni renversement (B3)</h3>
                        <img src="/images/car3.svg" alt="car" className={styles.carImage} />
                        <p className={styles.protectionDesc}>
                            Couvre les bris de votre voiture et les dommages qui ne sont pas liés à une collision
                        </p>
                        <p className={styles.coverageLabel}>Franchise :</p>
                        <div className={styles.amountControl}>
                            <button className={styles.amountButton} onClick={() => handleAmountChange('accidents', -50)}>-</button>
                            <span className={styles.amountValue}>{protections.accidents.amount} $</span>
                            <button className={styles.amountButton} onClick={() => handleAmountChange('accidents', 50)}>+</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Info Cards - Second Row */}
            <div className={styles.vehicleRow}>
                <div className={styles.vehicleCard}>
                    <div className={styles.vehicleHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <div className={styles.toggleGroup}>
                            <Switch size="small" defaultChecked />
                            <span className={styles.toggleLabel}>couvert</span>
                        </div>
                    </div>
                </div>
                <div className={styles.vehicleCard}>
                    <div className={styles.vehicleHeader}>
                        <span className={styles.vehicleName}>Honda, Civic, 2018</span>
                        <div className={styles.toggleGroupInactive}>
                            <Switch size="small" />
                            <span className={styles.toggleLabelInactive}>non couvert</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Protection Cards - Second Row */}
            <div className={styles.protectionCardsRow}>
                {/* Protection bonifiée */}
                <div className={styles.protectionCard}>
                    <div className={styles.protectionCardHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <div className={styles.toggleGroup}>
                            <Switch 
                                checked={protections.bonifiee.included}
                                onChange={(checked) => handleToggle('bonifiee', checked)}
                                size="small"
                            />
                            <span className={styles.toggleLabel}>couvert</span>
                        </div>
                    </div>
                    
                    <div className={styles.protectionContent}>
                        <h3 className={styles.protectionTitle}>Protection bonifiée</h3>
                        <img src="/images/car4.svg" alt="car" className={styles.carImage} />
                        <ul className={styles.benefitsList}>
                            <li>Responsabilité civile étendue (FAQ 2)</li>
                            <li>Véhicule de remplacement et frais de déplacement (FAQ 20)</li>
                            <li>Assurance de personnes (FAQ 27)</li>
                            <li>Véhicules loués ou empruntés (FAQ 34)</li>
                        </ul>
                    </div>
                </div>

                {/* Assistance routière */}
                <div className={styles.protectionCard}>
                    <div className={styles.protectionCardHeader}>
                        <span className={styles.vehicleName}>Mazda CX-9, 2020</span>
                        <div className={styles.toggleGroup}>
                            <Switch 
                                checked={protections.assistance.included}
                                onChange={(checked) => handleToggle('assistance', checked)}
                                size="small"
                            />
                            <span className={styles.toggleLabel}>couvert</span>
                        </div>
                    </div>
                    
                    <div className={styles.protectionContent}>
                        <h3 className={styles.protectionTitle}>Assistance routière (FAQ 33)</h3>
                        <img src="/images/car5.svg" alt="car" className={styles.carImage} />
                        <p className={styles.protectionDesc}>
                            Aide et remorquage en cas de panne ou d'imprévu sur la route.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeProtections;
