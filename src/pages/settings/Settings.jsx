import React, { useState } from 'react';
import { Tabs } from 'antd';
import PageHeader from '../../components/pageHeader';
import SettingsProfile from './SettingsProfile';
import styles from './Settings.module.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabItems = [
    {
      key: 'profile',
      label: 'Profil',
      children: <SettingsProfile />,
    }
  ];

  return (
    <div className={styles.settingsContainer}>
      <PageHeader 
        title="Paramètres"
        subtitle="Gérez vos préférences et informations personnelles"
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
