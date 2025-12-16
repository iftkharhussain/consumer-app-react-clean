import React from 'react';
import styles from './ExploreProducts.module.css';

const ExploreProducts = ({ onExplore }) => {
    return (
        <div className={styles.exploreSection}>
            <div className={styles.iconsContainer}>
                <div className={styles.iconCircle} style={{left:0}}>
                    <img src="/images/pr1.svg" alt="Product 1" className={styles.productIcon} />
                </div>
                <div className={styles.iconCircle} style={{top:'-15px', zIndex:1}}>
                    <img src="/images/pr3.svg" alt="Product 3" className={styles.productIcon} />
                </div>
                <div className={styles.iconCircle} style={{right:0}}>
                    <img src="/images/pr2.svg" alt="Product 2" className={styles.productIcon} />
                </div>
            </div>

            <h2 className={styles.exploreTitle}>
                Looking to save on other products ?
            </h2>

            <p className={styles.exploreDescription}>
                We offer a broader range to meet your unique needs. Click below to explore our full catalog and discover the right solutions for you.
            </p>

            <button className={styles.exploreButton} onClick={onExplore}>
                Explore our products
            </button>
        </div>
    );
};

export default ExploreProducts;
