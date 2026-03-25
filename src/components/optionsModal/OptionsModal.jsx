import React, { useState } from 'react';
import { Modal, Select, Checkbox } from 'antd';
import Button from '../button/Button';
import styles from './OptionsModal.module.css';

const OptionsModal = ({ isOpen, onClose, onRecalculate }) => {
    const [responsability, setResponsability] = useState('1M');
    const [franchise, setFranchise] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const franchiseOptions = [
        { value: '500', label: '500 $' },
        { value: '1000', label: '1000 $' },
        { value: '2000', label: '2000 $' },
    ];

    const checkboxOptions = [
        { value: 'frais', label: 'Frais de déplacement (étendue)' },
        { value: 'protection', label: "Protection lors de l'emprunt ou de la location d'un véhicule" },
        { value: 'assistance', label: 'Assistance routière' },
        { value: 'assurance', label: 'Assurance de personnes' },
        { value: 'exoneration', label: "Exonération d'accident - protection de la prime" },
    ];

    const handleCheckboxChange = (value) => {
        setSelectedOptions(prev => 
            prev.includes(value) 
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const handleRecalculate = () => {
        if (onRecalculate) {
            onRecalculate({
                responsability,
                franchise,
                selectedOptions
            });
        }
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={814}
            centered
            className={styles.modal}
            closeIcon={<img src="/images/Button close X.svg" alt="Close" />}
        >
            <div className={styles.modalContent}>
                {/* Title */}
                <h2 className={styles.title}>Options de garanties</h2>
                
                {/* Subtitle */}
                <p className={styles.subtitle}>Ces garanties s'appliquent à toutes les offres</p>

                {/* Two column layout */}
                <div className={styles.columnsContainer}>
                    {/* Left column */}
                    <div className={styles.leftColumn}>
                        {/* Responsabilité civile */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Responsabilité civile</label>
                            <div className={styles.toggleButtons}>
                                <button 
                                    className={`${styles.toggleButton} ${responsability === '1M' ? styles.toggleButtonActive : ''}`}
                                    onClick={() => setResponsability('1M')}
                                >
                                    1M
                                    {responsability === '1M' ? (
                                        <img src="/images/check.svg" alt="Selected" className={styles.radioIcon} />
                                    ) : (
                                        <svg width="8" height="8" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.radioIcon}>
                                            <circle cx="4.5" cy="4.5" r="4.25" stroke="#9C9C9C" strokeWidth="0.5"/>
                                        </svg>
                                    )}
                                </button>
                                <button 
                                    className={`${styles.toggleButton} ${responsability === '2M' ? styles.toggleButtonActive : ''}`}
                                    onClick={() => setResponsability('2M')}
                                >
                                    2M
                                    {responsability === '2M' ? (
                                        <img src="/images/check.svg" alt="Selected" className={styles.radioIcon} />
                                    ) : (
                                        <svg width="8" height="8" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.radioIcon}>
                                            <circle cx="4.5" cy="4.5" r="4.25" stroke="#9C9C9C" strokeWidth="0.5"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Franchise pour collision ou versement */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Franchise pour collision ou versement</label>
                            <Select
                                placeholder="Sélectionnez..."
                                value={franchise}
                                onChange={setFranchise}
                                options={franchiseOptions}
                                className={styles.selectField}
                                suffixIcon={<img src="/images/chevron-down1.svg" alt="Chevron" />}
                            />
                        </div>
                    </div>

                    {/* Right column - Checkboxes */}
                    <div className={styles.rightColumn}>
                        {checkboxOptions.map((option) => (
                            <div key={option.value} className={styles.checkboxItem}>
                                <Checkbox
                                    checked={selectedOptions.includes(option.value)}
                                    onChange={() => handleCheckboxChange(option.value)}
                                    className={styles.checkbox}
                                />
                                <span className={styles.checkboxLabel}>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recalculate button */}
                <Button type="primary" onClick={handleRecalculate} className={styles.recalculateButton}>
                    Recalculer l'offre
                </Button>
            </div>
        </Modal>
    );
};

export default OptionsModal;
