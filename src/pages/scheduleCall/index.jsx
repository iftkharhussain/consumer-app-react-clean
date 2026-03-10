import React, { useEffect, useRef } from 'react';
import { PageContent } from 'components';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from './ScheduleCall.module.css';

const ScheduleCall = () => {
  const initialized = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Planifier un appel - Consumer App';
      initialized.current = true;
    }
  }, []);

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeftOutlined className={styles.backIcon} /> Retour
        </button>

        <div className={styles.card}>
          <div className={styles.calendlyPlaceholder}>
            {/* Calendly embed will go here */}
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export default ScheduleCall;
