import React from 'react';
import styles from './ContactSection.module.css';

const ContactSection = ({
    label = "Votre courtier en assurance de dommages est Courtika",
    logo = "/images/courtika-assurances-inc.png",
    logoAlt = "Courtika",
    phone = "1 800-667-4249",
    email = "courtika@example.com"
}) => {
    return (
        <div className={styles.contactSection}>
            <span className={styles.providerLabel}>{label}</span>
            <img src={logo} alt={logoAlt} className={styles.providerLogo} />
            <p className={styles.contactLabel}>Cell: <a href={`tel:${phone.replace(/[^0-9]/g, '')}`}>{phone}</a></p>
            <p className={styles.contactLabel}>Email: <a href={`mailto:${email}`}>{email}</a></p>
        </div>
    );
};

export default ContactSection;
