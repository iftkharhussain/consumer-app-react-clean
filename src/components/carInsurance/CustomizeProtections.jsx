import React, { useState } from 'react';
import { Switch, Spin } from 'antd';
import Button from '../button/Button';
import ProtectionCard from './ProtectionCard';
import styles from './CustomizeProtections.module.css';

const CustomizeProtections = ({ onBack }) => {
    const [protections, setProtections] = useState({
        responsabilite: { included: true, amount: 2000000 },
        collision: { included: true, amount: 500 },
        accidents: { included: true, amount: 250 },
        bonifiee: { included: true },
        assistance: { included: true }
    });

    const [vehicles, setVehicles] = useState([
        { name: 'Mazda CX-9, 2020', included: true },
        { name: 'Honda, Civic, 2018', included: false }
    ]);

    const handleToggle = (key, value) => {
        setProtections(prev => ({
            ...prev,
            [key]: { ...prev[key], included: value }
        }));
    };

    const handleVehicleToggle = (index, value) => {
        setVehicles(prev => {
            const updated = [...prev];
            updated[index].included = value;
            return updated;
        });
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

            {/* Protection Cards - First Row */}
            <div className={styles.protectionCardsRow}>
                <ProtectionCard
                    title="Responsabilité civile"
                    image="/images/car1.svg"
                    description="Couvre les dommages à ce qui ne vous appartient pas quand vous causez un accident"
                    coverageLabel="Couverture jusqu'à:"
                    amount={protections.responsabilite.amount}
                    vehicles={vehicles}
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
                    onVehicleToggle={handleVehicleToggle}
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
                    onVehicleToggle={handleVehicleToggle}
                    showDetailsLink={true}
                    detailsContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                    imageWidth={75}
                />

                <ProtectionCard
                    title="Assistance routière (FAQ 33)"
                    image="/images/car5.svg"
                    description="Aide et remorquage en cas de panne ou d'imprévu sur la route."
                    vehicles={vehicles}
                    onVehicleToggle={handleVehicleToggle}
                    showDetailsLink={true}
                    detailsContent="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor."
                    imageWidth={120}
                />
            </div>
        </div>
    );
};

export default CustomizeProtections;
