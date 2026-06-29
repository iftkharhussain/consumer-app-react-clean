import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './OtherProducts.module.css';
import QuoteModal from '../quoteModal';
import { OTHER_PRODUCTS, matchesBannerProduct } from '../../constants/otherProducts';
import useQuotedProducts from '../../hooks/useQuotedProducts';

const OtherProducts = ({ className, currentKey }) => {
  const scrollContainerRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: true });

  const { quotedProducts } = useQuotedProducts();

  // Show only products the user has NOT already quoted (completed quote),
  // and never the product of the page currently being viewed.
  const visibleProducts = OTHER_PRODUCTS.filter(
    (product) =>
      product.key !== currentKey &&
      !quotedProducts.some((record) => matchesBannerProduct(product, record))
  );

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: Math.ceil(scrollLeft + clientWidth) < scrollWidth
      });
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Re-evaluate scroll affordances once the filtered list settles.
  useEffect(() => {
    checkScroll();
  }, [visibleProducts.length]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Nothing left to cross-sell — hide the whole section.
  if (visibleProducts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Other Products Section */}
      <div className={`${styles.otherProductsCard} ${className || ''}`}>
        <div className={styles.otherProductsHeader}>
          <h2 className={styles.otherProductsTitle}>Selon votre profil, vous pourriez aussi économiser sur ces produits</h2>
          <div className={styles.otherProductsNav}>
            <button className={`${styles.navButton} ${!scrollState.canScrollLeft ? styles.navButtonDisabled : ''}`} aria-label="Previous" onClick={scrollLeft}>
              <LeftOutlined />
            </button>
            <button className={`${styles.navButton} ${!scrollState.canScrollRight ? styles.navButtonDisabled : ''}`} aria-label="Next" onClick={scrollRight}>
              <RightOutlined />
            </button>
          </div>
        </div>

        <div className={styles.productsScrollContainer} ref={scrollContainerRef} onScroll={checkScroll}>
          {visibleProducts.map((product) => (
            <div key={product.key} className={`${styles.productCard} ${product.recommended ? styles.recommendedCard : ''}`}>
              <div className={styles.productCardTop}>
                <div className={styles.productIconWrapper}>
                  <img src={product.icon} alt={product.title} className={styles.productIcon} />
                </div>
                {product.recommended && (
                  <div className={styles.recommendedBadge}>RECOMMANDÉ</div>
                )}
              </div>
              <h3 className={styles.productTitle}>{product.title}</h3>
              <p className={styles.productDesc}>{product.desc}</p>
              <Button className={styles.productButton} onClick={() => {
                setSelectedProduct(product);
                setIsModalVisible(true);
              }}>
                <span>Obtenir une soumission</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <QuoteModal
        selectedProduct={selectedProduct}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </>
  );
};

export default OtherProducts;
