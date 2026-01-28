import React, { useState, useEffect } from 'react';
import { Switch, Spin } from 'antd';
import Button from '../button/Button';
import ProtectionCard from './ProtectionCard';
import { getUserVehicles } from '../../services/api/vehicleService';
import styles from './CustomizeProtections.module.css';

const CustomizeProtections = ({ onBack, userProductId, onProtectionsChange }) => {
    const [protections, setProtections] = useState({
        responsabilite: { included: false, amount: 2000000, vehicleToggles: [] },
        collision: { included: false, amount: 250, vehicleToggles: [] },
        accidents: { included: false, amount: 250, vehicleToggles: [] },
        bonifiee: { included: false, vehicleToggles: [] },
        assistance: { included: false, vehicleToggles: [] }
    });

    const [initialProtections, setInitialProtections] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    // Fetch user's vehicles and coverages on mount
    useEffect(() => {
        const fetchVehiclesAndCoverages = async () => {
            try {
                setLoadingVehicles(true);
                const response = await getUserVehicles(null, userProductId);
                
                if (response.success && response.vehicles) {
                    // Store vehicles without toggle state (toggles are per-protection)
                    setVehicles(response.vehicles);
                    
                    // Initialize vehicleToggles arrays for each protection (all off by default)
                    const vehicleToggles = new Array(response.vehicles.length).fill(false);
                    
                    // Parse coverages to determine which protections are included
                    let initialProtections = {
                        responsabilite: { included: false, amount: 2000000, vehicleToggles: [...vehicleToggles] },
                        collision: { included: false, amount: 250, vehicleToggles: [...vehicleToggles] },
                        accidents: { included: false, amount: 250, vehicleToggles: [...vehicleToggles] },
                        bonifiee: { included: false, vehicleToggles: [...vehicleToggles] },
                        assistance: { included: false, vehicleToggles: [...vehicleToggles] }
                    };
                    
                    // If we have coverages from the quote, pre-populate the values
                    if (response.coverages && Array.isArray(response.coverages)) {
                        console.log('[CustomizeProtections] Processing coverages:', response.coverages);
                        
                        response.coverages.forEach(coverage => {
                            const code = coverage.code;
                            const deductible = coverage.deductible;
                            const limit = coverage.limit;
                            
                            console.log('[CustomizeProtections] Processing coverage:', { code, limit, deductible });
                            
                            // Map coverage codes to protection keys
                            // TP = Responsabilité civile (Third Party Liability)
                            // B2/Collision = Collision et renversement
                            // B3/Comprehensive = Accidents sans collision
                            // FAQ27 = Protection bonifiée
                            // FAQ33 = Assistance routière
                            
                            switch (code) {
                                case 'TP':
                                    // Responsabilité civile - extract amount from limit
                                    // Format: "$2,000,000/-$1" or "2000000"
                                    const limitMatch = limit?.toString().match(/[\d,]+/);
                                    if (limitMatch) {
                                        const amount = parseInt(limitMatch[0].replace(/,/g, ''));
                                        console.log('[CustomizeProtections] TP coverage - extracted amount:', amount);
                                        initialProtections.responsabilite.amount = amount;
                                    }
                                    initialProtections.responsabilite.included = true;
                                    // TP applies to all vehicles - set all toggles to true
                                    initialProtections.responsabilite.vehicleToggles = vehicleToggles.map(() => true);
                                    break;
                                    
                                case 'B2':
                                case 'Collision':
                                    // Collision - deductible can be 250 or 500
                                    if (deductible && deductible !== -1) {
                                        const ded = parseInt(deductible);
                                        initialProtections.collision.amount = [250, 500].includes(ded) ? ded : 250;
                                    }
                                    initialProtections.collision.included = true;
                                    // Enable for all vehicles when coverage exists
                                    initialProtections.collision.vehicleToggles = vehicleToggles.map(() => true);
                                    break;
                                    
                                case 'B3':
                                case 'Comprehensive':
                                    // Accidents sans collision - deductible can be 250 or 500
                                    if (deductible && deductible !== -1) {
                                        const ded = parseInt(deductible);
                                        initialProtections.accidents.amount = [250, 500].includes(ded) ? ded : 250;
                                    }
                                    initialProtections.accidents.included = true;
                                    // Enable for all vehicles when coverage exists
                                    initialProtections.accidents.vehicleToggles = vehicleToggles.map(() => true);
                                    break;
                                    
                                case 'FAQ27':
                                    initialProtections.bonifiee.included = true;
                                    // Enable for all vehicles when coverage exists
                                    initialProtections.bonifiee.vehicleToggles = vehicleToggles.map(() => true);
                                    break;
                                    
                                case 'FAQ33':
                                    initialProtections.assistance.included = true;
                                    // Enable for all vehicles when coverage exists
                                    initialProtections.assistance.vehicleToggles = vehicleToggles.map(() => true);
                                    break;
                            }
                        });
                        
                        console.log('[CustomizeProtections] Pre-populated from coverages:', {
                            coveragesCount: response.coverages.length,
                            protections: initialProtections
                        });
                    }
                    
                    setProtections(initialProtections);
                    // Save initial state for change detection
                    setInitialProtections(JSON.parse(JSON.stringify(initialProtections)));
                }
            } catch (error) {
                console.error('Failed to fetch vehicles and coverages:', error);
                // Keep empty array on error
                setVehicles([]);
            } finally {
                setLoadingVehicles(false);
            }
        };

        if (userProductId) {
            fetchVehiclesAndCoverages();
        }
    }, [userProductId]);

    // Check if protections have changed compared to initial state
    useEffect(() => {
        if (!initialProtections || !onProtectionsChange) return;
        
        const hasChanges = JSON.stringify(protections) !== JSON.stringify(initialProtections);
        // Pass both hasChanges and current protections data to parent
        onProtectionsChange(hasChanges, protections);
    }, [protections, initialProtections, onProtectionsChange]);

    const handleToggle = (key, value) => {
        setProtections(prev => {
            // When toggling main switch ON, enable all vehicle toggles
            // When toggling main switch OFF, disable all vehicle toggles
            const updatedToggles = prev[key].vehicleToggles.map(() => value);
            
            return {
                ...prev,
                [key]: { 
                    ...prev[key], 
                    included: value,
                    vehicleToggles: updatedToggles
                }
            };
        });
    };

    const handleVehicleToggle = (protectionKey, vehicleIndex, value) => {
        setProtections(prev => {
            const updated = { ...prev };
            const updatedToggles = [...updated[protectionKey].vehicleToggles];
            updatedToggles[vehicleIndex] = value;
            
            // Auto-set included to true if any vehicle toggle is ON
            // Auto-set included to false if ALL vehicle toggles are OFF
            const anyVehicleOn = updatedToggles.some(toggle => toggle === true);
            
            updated[protectionKey] = { 
                ...updated[protectionKey], 
                vehicleToggles: updatedToggles,
                included: anyVehicleOn // Sync included with vehicle toggles
            };
            return updated;
        });
    };

    const handleAmountChange = (key, delta) => {
        setProtections(prev => {
            // For collision and accidents: toggle between 250 and 500 only
            if (key === 'collision' || key === 'accidents') {
                const currentAmount = prev[key].amount;
                let newAmount;
                
                if (delta > 0) {
                    // Increase: 250 → 500, 500 → 500
                    newAmount = currentAmount === 250 ? 500 : 500;
                } else {
                    // Decrease: 500 → 250, 250 → 250
                    newAmount = currentAmount === 500 ? 250 : 250;
                }
                
                return {
                    ...prev,
                    [key]: { ...prev[key], amount: newAmount }
                };
            }
            
            // For other protections: use normal increment/decrement
            return {
                ...prev,
                [key]: { ...prev[key], amount: Math.max(0, prev[key].amount + delta) }
            };
        });
    };

    return (
        <div className={styles.customizeContainer}>
            {/* Loading State */}
            {loadingVehicles ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    width: '100%'
                }}>
                    <Spin size="large" tip="Chargement des protections..." />
                </div>
            ) : (
                <>
                    {/* Back Button */}
                    <button className={styles.backButton} onClick={onBack}>
                        <img src="/images/back-button.svg" alt="back" className={styles.backIcon} />
                        Retour
                    </button>

                    {/* Page Heading */}
                    <h1 className={styles.pageHeading}>Personnalisez vos protections</h1>

            {/* Protection Cards - First Row */}
            <div className={styles.protectionCardsRow}>
                <ProtectionCard
                    title="Responsabilité civile"
                    image="/images/car1.svg"
                    description="Couvre les dommages à ce qui ne vous appartient pas quand vous causez un accident"
                    coverageLabel="Couverture jusqu'à:"
                    amount={protections.responsabilite.amount}
                    vehicles={vehicles}
                    vehicleToggles={protections.responsabilite.vehicleToggles}
                    alwaysIncluded={true}
                />

                <ProtectionCard
                    title="Collision et renversement (B2)"
                    image="/images/car2.svg"
                    description="Couvre les dommages causés à votre auto lorsque vous entrez en collision avec quelqu'un ou quelque chose."
                    coverageLabel="Franchise :"
                    amount={protections.collision.amount}
                    amountDelta={50}
                    onAmountChange={(delta) => handleAmountChange('collision', delta)}
                    vehicles={vehicles}
                    vehicleToggles={protections.collision.vehicleToggles}
                    onVehicleToggle={(vehicleIndex, value) => handleVehicleToggle('collision', vehicleIndex, value)}
                    included={protections.collision.included}
                    onToggle={(value) => handleToggle('collision', value)}
                    imageWidth={130}
                />

                <ProtectionCard
                    title="Accidents sans collision ni renversement (B3)"
                    image="/images/car3.svg"
                    description="Couvre les bris de votre voiture et les dommages qui ne sont pas liés à une collision"
                    coverageLabel="Franchise :"
                    amount={protections.accidents.amount}
                    amountDelta={50}
                    onAmountChange={(delta) => handleAmountChange('accidents', delta)}
                    vehicles={vehicles}
                    vehicleToggles={protections.accidents.vehicleToggles}
                    alwaysIncluded={true}
                    imageWidth={95}
                />
            </div>

            {/* Protection Cards - Second Row */}
            <div className={styles.protectionCardsRow}>
                <ProtectionCard
                    title="Protection bonifiée"
                    image="/images/car4.svg"
                    benefitsList={[
                        'Responsabilité civile étendue (FAQ 2)',
                        'Véhicule de remplacement et frais de déplacement (FAQ 20)',
                        'Assurance de personnes (FAQ 27)',
                        'Véhicules loués ou empruntés (FAQ 34)'
                    ]}
                    vehicles={vehicles}
                    vehicleToggles={protections.bonifiee.vehicleToggles}
                    onVehicleToggle={(vehicleIndex, value) => handleVehicleToggle('bonifiee', vehicleIndex, value)}
                    included={protections.bonifiee.included}
                    onToggle={(value) => handleToggle('bonifiee', value)}
                    showDetailsLink={true}
                    detailsContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                    imageWidth={75}
                />

                <ProtectionCard
                    title="Assistance routière (FAQ 33)"
                    image="/images/car5.svg"
                    description="Aide et remorquage en cas de panne ou d'imprévu sur la route."
                    vehicles={vehicles}
                    vehicleToggles={protections.assistance.vehicleToggles}
                    onVehicleToggle={(vehicleIndex, value) => handleVehicleToggle('assistance', vehicleIndex, value)}
                    included={protections.assistance.included}
                    onToggle={(value) => handleToggle('assistance', value)}
                    showDetailsLink={true}
                    detailsContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."
                    imageWidth={120}
                />
            </div>
                </>
            )}
        </div>
    );
};

export default CustomizeProtections;
