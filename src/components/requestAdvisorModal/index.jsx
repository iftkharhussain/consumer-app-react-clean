import React from 'react';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../icon';
import { getProductsForAdvisorType } from '../../constants/advisorCategories';
import styles from './RequestAdvisorModal.module.css';

const RequestAdvisorModal = ({ isOpen, onClose, advisorRecord, onSelectProduct }) => {
  const navigate = useNavigate();

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
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      closeIcon={<XIcon size={18} color="#667085" />}
      className={styles.requestModal}
    >
      <div className={styles.requestModalContainer}>
        <h3 className={styles.requestModalTitle}>
          Pour quel produit avez-vous besoin d'un conseiller?
        </h3>
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
    </Modal>
  );
};

export default RequestAdvisorModal;
