import React from 'react';
import PageHeader from '../../components/pageHeader';
import styles from './Messages.module.css';

const MessagesHeader = () => {
  return (
    <PageHeader 
      title="Messages"
      style={{paddingBottom: '16px'}}
      subtitle="Request to speak with a professional and view your conversation history here!"
      className={styles.pageHeaderContainer}
    />
  );
};

export default MessagesHeader;
