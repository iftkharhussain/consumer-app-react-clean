import React from 'react';
import { Radio } from 'antd';
import styles from './BillingToggle.module.css';

const BillingToggle = ({ value, onChange, className }) => {
    return (
        <Radio.Group 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${styles.billingToggle} ${className || ''}`}
            buttonStyle="solid"
        >
            <Radio.Button value="Mensuel" className={styles.billingButton}>Mensuel</Radio.Button>
            <Radio.Button value="Annuel" className={styles.billingButton}>Annuel</Radio.Button>
        </Radio.Group>
    );
};

export default BillingToggle;
