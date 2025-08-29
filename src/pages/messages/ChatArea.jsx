import React from 'react';
import ChatHeader from './ChatHeader';
import MessagesArea from './MessagesArea';
import MessageInput from './MessageInput';
import styles from './Messages.module.css';

const ChatArea = ({ selectedMessage, currentConversation, headerDropdownItems }) => {
  if (!selectedMessage && !currentConversation) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <ChatHeader 
        currentConversation={currentConversation} 
        headerDropdownItems={headerDropdownItems} 
      />
      <MessagesArea currentConversation={currentConversation} />
      <MessageInput />
    </div>
  );
};

export default ChatArea;
