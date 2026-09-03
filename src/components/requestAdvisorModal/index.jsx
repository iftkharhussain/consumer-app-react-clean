import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../icon';
import { getProductsForAdvisorType } from '../../constants/advisorCategories';
import styles from './RequestAdvisorModal.module.css';

const RequestAdvisorModal = ({ isOpen, onClose, advisorRecord, onSelectProduct }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getAdvisorProducts = () => {
    if (!advisorRecord) return [];

    // Direct products array attached to advisor record
    if (Array.isArray(advisorRecord.products) && advisorRecord.products.length > 0) {
      return advisorRecord.products;
    }

    const type = advisorRecord.type || advisorRecord.categoryKey || advisorRecord.key || '';
    return getProductsForAdvisorType(type);
  };

  const products = getAdvisorProducts();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Div 1: Title & Cross Close Icon */}
        <div className={styles.modalHeader}>
          <h3 className={styles.requestModalTitle}>
            Pour quel produit avez-vous besoin d'un conseiller?
          </h3>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12" stroke="#A4A7AE" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 4L12 12" stroke="#A4A7AE" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Div 2: Product Details Selection */}
        <div className={styles.productsContainer}>
          <div className={styles.requestModalGrid}>
            {products.map((product) => (
              <div
                key={product.key}
                className={styles.productCard}
                onClick={() => {
                  if (onSelectProduct) {
                    onSelectProduct(product);
                  } else {
                    onClose();
                    navigate(product.path);
                  }
                }}
              >
                <div className={styles.productIconWrapper}>
                  <img src={product.icon} alt={product.title} className={styles.productIcon} />
                </div>
                <div className={styles.productTitle}>{product.title}</div>
                <div className={styles.productSubtitle}>{product.desc || product.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAdvisorModal;
