import React, { useState } from 'react';
import { Tabs } from 'antd';
import PageHeader from '../../components/pageHeader';
import SettingsProfile from './SettingsProfile';
import SettingsSecurity from './SettingsSecurity';
import SettingsNotifications from './SettingsNotifications';
import styles from './Settings.module.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
  children: <SettingsProfile />,
    },
    {
      key: 'security',
      label: 'Security',
  children: <SettingsSecurity />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: <SettingsNotifications />,
    }
  ];

  return (
    <div className={styles.settingsContainer}>
      <PageHeader 
        title="Settings"
        style={{paddingBottom: '16px'}}
        subtitle="Lorem Ipsum"
        className={styles.pageHeaderContainer}
      />
      
      <div className={styles.settingsContent}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className={styles.settingsTabs}
          size="large"
        />
      </div>
    </div>
  );
};

export default Settings;
