import React from 'react';
import NotificationsHeader from './NotificationsHeader';
import NotificationsList from './NotificationsList';
import styles from './Notifications.module.css';

const Notifications = () => {
  return (
    <div className={styles.notificationsContainer}>
      <NotificationsHeader />
      <NotificationsList />
    </div>
  );
};

export default Notifications;
