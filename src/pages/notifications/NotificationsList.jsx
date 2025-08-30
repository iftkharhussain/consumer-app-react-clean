import React from 'react';
import styles from './Notifications.module.css';

const NotificationsList = () => {
  // Sample data based on the image
  const notifications = [
    {
      id: 1,
      avatar: '/images/Avatar.png', // You'll need to add actual avatar images
      name: 'Phoenix Baker',
      time: 'Just now',
      action: 'Added a file to',
      subject: 'Marketing site redesign',
      isOnline: true
    },
    {
      id: 2,
      avatar: '/images/Avatar.png',
      name: 'Lana Steiner',
      time: '2 mins ago',
      action: 'Invited',
      subject: 'Alisa Hester',
      additionalText: 'to the team',
      isOnline: true
    },
    {
      id: 3,
      avatar: '/images/Avatar.png',
      name: 'Demi Wilkinson',
      time: '2 mins ago',
      action: 'Invited',
      subject: 'Alisa Hester',
      additionalText: 'to the team',
      isOnline: true
    },
    {
      id: 4,
      avatar: '/images/Avatar.png',
      name: 'Candice Wu',
      time: '3 hours ago',
      action: 'Commented in',
      subject: 'Marketing site redesign',
      isOnline: true
    }
  ];

  const renderNotificationSection = (title, items) => (
    <div className={styles.notificationSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.notificationItems}>
        {items.map((notification, index) => (
          <div key={notification.id}>
            <div className={styles.notificationItem}>
              <div className={styles.avatarContainer}>
                <img 
                  src={notification.avatar} 
                  alt={notification.name}
                  className={styles.avatar}
                />
                {notification.isOnline && <div className={styles.onlineIndicator} />}
              </div>
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <span className={styles.userName}>{notification.name}</span>
                  <span className={styles.timeStamp}>{notification.time}</span>
                </div>
                <div className={styles.notificationText}>
                  <span className={styles.actionText}>{notification.action} </span>
                  <span className={styles.subjectText}>{notification.subject}</span>
                  {notification.additionalText && (
                    <span className={styles.actionText}> {notification.additionalText}</span>
                  )}
                </div>
              </div>
            </div>
            {index < items.length - 1 && <div className={styles.horizontalBar} />}
          </div>
        ))}
      </div>
    </div>
  );

  // Split notifications for different sections
  const todayNotifications = notifications.slice(0, 4);
  const oct14Notifications = notifications.slice(0, 3);
  const oct13Notifications = notifications.slice(0, 2);

  return (
    <div className={styles.notificationsListContainer}>
      {renderNotificationSection('Today', todayNotifications)}
      {renderNotificationSection('October 14, 2025', oct14Notifications)}
      {renderNotificationSection('October 13, 2025', oct13Notifications)}
    </div>
  );
};

export default NotificationsList;
