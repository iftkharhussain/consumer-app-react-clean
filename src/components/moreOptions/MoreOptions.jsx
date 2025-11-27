import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from 'components';
import Button from '../button/Button';
import styles from './MoreOptions.module.css';

const MoreOptions = ({ 
    title = "Looking for more product options?",
    description = "We offer a broader range to meet your unique needs. Click below to explore our full catalog and discover the right solutions for you.",
    buttonText = "Explore other Products"
}) => {
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/explore');
        window.scrollTo(0, 0);
    };

    return (
        <Section variant="card" style={{ marginTop: '40px' }}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <Button onClick={handleExploreClick}>
                {buttonText}
            </Button>
        </Section>
    );
};

export default MoreOptions;
