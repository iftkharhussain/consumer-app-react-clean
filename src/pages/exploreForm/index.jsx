import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageContent } from 'components';
import styles from './ExploreForm.module.css';

const ExploreForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = location.state || {};

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <img src="/images/left-arrow.svg" alt="Back" className={styles.backIcon} /> Retour
        </button>
      </div>
    </PageContent>
  );
};

export default ExploreForm;
