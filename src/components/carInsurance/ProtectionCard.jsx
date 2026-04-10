import React from 'react';
import { Switch } from 'antd';
import { CoverageStatus } from '..';
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
    vehicleToggles = [],
    onVehicleToggle,
    alwaysIncluded = false,
    included,
    onToggle,
    showDetailsLink = false,
    onDetailsClick,
    detailsContent,
    imageWidth
}) => {
    const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);

    const handleDetailsClick = () => {
        setIsDetailsExpanded(!isDetailsExpanded);
        if (onDetailsClick) {
            onDetailsClick();
        }
    };
    return (
        <div className={styles.protectionCard}>
            {/* Vehicle Header */}
            {vehicles && vehicles.length > 0 && (
                <div className={styles.protectionCardHeader}>
                    {vehicles.map((vehicle, index) => (
                        <div key={index} className={styles.vehicleToggleRow}>
                            <div className={styles.vehicleInfo}>
                                <div className={styles.vehicleMainLine}>
                                    <span className={styles.vehicleMake}>{vehicle.make}</span>
                                    <span className={styles.vehicleYear}>, {vehicle.year}</span>
                                </div>
                                <div className={styles.vehicleModel}>{vehicle.model}</div>
                            </div>
                            {alwaysIncluded ? (
                                <span className={styles.alwaysIncluded}>Toujours inclus</span>
                            ) : (
                                <div className={styles.toggleContainer}>
                                    <Switch 
                                        checked={vehicleToggles[index] || false} 
                                        onChange={(checked) => onVehicleToggle && onVehicleToggle(index, checked)}
                                    />
                                    <span className={vehicleToggles[index] ? styles.toggleLabelActive : styles.toggleLabelInactive}>
                                        {vehicleToggles[index] ? 'couvert' : 'non couvert'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Main Protection Toggle Header (for cards without vehicles but with toggle) */}
            {(!vehicles || vehicles.length === 0) && !alwaysIncluded && onToggle && (
                <div className={styles.protectionCardHeader}>
                    <div className={styles.vehicleToggleRow}>
                        <span className={styles.vehicleName}>{title}</span>
                        <div className={styles.toggleContainer}>
                            <Switch 
                                checked={included} 
                                onChange={(checked) => onToggle(checked)}
                            />
                            <span className={included ? styles.toggleLabelActive : styles.toggleLabelInactive}>
                                {included ? 'couvert' : 'non couvert'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.protectionContent}>
                <h3 className={styles.protectionTitle}>{title}</h3>
                <span style={{ textAlign: 'center' }}>
                    {image && <img src={image} alt="protection" className={styles.carImage} style={imageWidth ? { width: `${imageWidth}px` } : {}} />}

                    {description && (
                        <p className={styles.protectionDesc}>{description}</p>
                    )}
                </span>

                {benefitsList && (
                    <ul className={styles.benefitsList}>
                        {benefitsList.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                        ))}
                    </ul>
                )}

                {showDetailsLink && (
                    <>
                        <button className={styles.detailsLink} onClick={handleDetailsClick}>
                            *Détail condition importante
                            <img
                                src="/images/arrow-down.svg"
                                alt="arrow"
                                className={styles.arrowIcon}
                                style={{ transform: isDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                            />
                        </button>
                        {isDetailsExpanded && detailsContent && (
                            <div className={styles.detailsContent}>
                                {detailsContent}
                            </div>
                        )}
                    </>
                )}

                {coverageLabel && amount !== undefined && (
                    <>
                        <p className={styles.coverageLabel}>{coverageLabel}</p>
                        <div className={`${styles.amountControl} ${!onAmountChange ? styles.amountControlStatic : ''}`}>
                            {onAmountChange && (
                                <button
                                    className={styles.amountButton}
                                    onClick={() => onAmountChange(-amountDelta)}
                                >
                                    <svg width="12" height="1" viewBox="0 0 12 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.5 0.5L10.9333 0.500001" stroke="white" stroke-linecap="round" />
                                    </svg>
                                </button>
                            )}
                            <span className={`${styles.amountValue} ${!onAmountChange ? styles.amountValueStatic : ''}`}>
                                {typeof amount === 'number' && amount > 999
                                    ? amount.toLocaleString()
                                    : amount} $
                            </span>
                            {onAmountChange && (
                                <button
                                    className={styles.amountButton}
                                    onClick={() => onAmountChange(amountDelta)}
                                >
                                    +
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProtectionCard;
