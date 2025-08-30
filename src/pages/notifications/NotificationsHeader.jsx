import React from 'react';
import PageHeader from '../../components/pageHeader';
import styles from './Notifications.module.css';

const NotificationsHeader = () => {
  return (
    <PageHeader 
      title="Notifications"
      style={{paddingBottom: '16px'}}
      subtitle="Lorem Ipsum"
      className={styles.pageHeaderContainer}
    />
  );
};

export default NotificationsHeader;
