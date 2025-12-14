import React from 'react';
import { Switch } from 'antd';
import styles from './CustomizeProtections.module.css';

const ProtectionCard = ({
    title,
    image,
    description,
    coverageLabel,
    amount,
    onAmountChange,
    amountDelta = 1,
    benefitsList,
    vehicles,
    onVehicleToggle,
    alwaysIncluded = false
}) => {
    return (
        <div className={styles.protectionCard}>
            {/* Vehicle Header */}
            {vehicles && vehicles.length > 0 && (
                <div className={styles.protectionCardHeader}>
                    {vehicles.map((vehicle, index) => (
                        <div key={index} className={styles.vehicleToggleRow}>
                            <span className={styles.vehicleName}>{vehicle.name}</span>
                            {alwaysIncluded ? (
                                <span className={styles.alwaysIncluded}>Toujours inclus</span>
                            ) : (
                                <div className={vehicle.included ? styles.toggleGroup : styles.toggleGroupInactive}>
                                    <Switch
                                        checked={vehicle.included}
                                        onChange={(checked) => onVehicleToggle && onVehicleToggle(index, checked)}
                                        size="small"
                                    />
                                    <span className={vehicle.included ? styles.toggleLabel : styles.toggleLabelInactive}>
                                        {vehicle.included ? 'couvert' : 'non couvert'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.protectionContent}>
                <h3 className={styles.protectionTitle}>{title}</h3>
                {image && <img src={image} alt="protection" className={styles.carImage} />}
                
                {description && (
                    <p className={styles.protectionDesc}>{description}</p>
                )}
                
                {benefitsList && (
                    <ul className={styles.benefitsList}>
                        {benefitsList.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                        ))}
                    </ul>
                )}
                
                {coverageLabel && amount !== undefined && onAmountChange && (
                    <>
                        <p className={styles.coverageLabel}>{coverageLabel}</p>
                        <div className={styles.amountControl}>
                            <button 
                                className={styles.amountButton} 
                                onClick={() => onAmountChange(-amountDelta)}
                            >
                                -
                            </button>
                            <span className={styles.amountValue}>
                                {typeof amount === 'number' && amount > 999 
                                    ? amount.toLocaleString() 
                                    : amount} $
                            </span>
                            <button 
                                className={styles.amountButton} 
                                onClick={() => onAmountChange(amountDelta)}
                            >
                                +
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProtectionCard;
