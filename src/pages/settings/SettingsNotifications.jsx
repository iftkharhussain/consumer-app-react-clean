import React from 'react';
import { Form, Switch, Typography, Divider } from 'antd';
import styles from './Settings.module.css';

const { Title, Text } = Typography;

const SettingsNotifications = () => {
  return (
    <div className={styles.notificationsSection}>
      <div className={styles.sectionHeader}>
        <Title level={3} className={styles.sectionTitle}>Notifications</Title>
        <Text className={styles.sectionDescription}>
          Manage how you receive notifications.
        </Text>
      </div>

      <div className={styles.notificationSettings}>
        {/* Email Notifications */}
        <div className={styles.notificationGroup}>
          <Title level={5}>Email Notifications</Title>
          
          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>Comments</Text>
              <Text>Get notified when someone comments on your posts</Text>
            </div>
            <Switch defaultChecked />
          </div>

          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>Team Invitations</Text>
              <Text>Get notified when you're invited to join a team</Text>
            </div>
            <Switch defaultChecked />
          </div>

          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>File Updates</Text>
              <Text>Get notified when files are added or updated</Text>
            </div>
            <Switch />
          </div>
        </div>

        <Divider />

        {/* Push Notifications */}
        <div className={styles.notificationGroup}>
          <Title level={5}>Push Notifications</Title>
          
          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>Messages</Text>
              <Text>Get push notifications for new messages</Text>
            </div>
            <Switch defaultChecked />
          </div>

          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>Mentions</Text>
              <Text>Get notified when someone mentions you</Text>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Divider />

        {/* SMS Notifications */}
        <div className={styles.notificationGroup}>
          <Title level={5}>SMS Notifications</Title>
          
          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>Security Alerts</Text>
              <Text>Get SMS notifications for security-related events</Text>
            </div>
            <Switch />
          </div>

          <div className={styles.notificationOption}>
            <div className={styles.optionContent}>
              <Text strong>Important Updates</Text>
              <Text>Get SMS notifications for critical updates</Text>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;
