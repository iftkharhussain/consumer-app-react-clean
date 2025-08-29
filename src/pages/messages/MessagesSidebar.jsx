import React from 'react';
import { Input, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Edit05 from '@untitled-ui/icons-react/build/cjs/Edit05';
import Avatar from '../../components/avatar';
import styles from './Messages.module.css';

const MessagesSidebar = ({
  searchValue,
  onSearchChange,
  conversations,
  selectedMessage,
  onConversationSelect
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Messages</h1>
          <div className={styles.messageBadge}>4</div>
        </div>
        <button className={styles.newMessageButton}>
          <Edit05 className={styles.newMessageIcon} />
        </button>
      </div>

      <div className={styles.searchSection}>
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className={styles.searchIcon} />}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.conversationsList}>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`${styles.conversationItem} ${selectedMessage?.id === conversation.id ? styles.selected : ''}`}
            onClick={() => onConversationSelect(conversation)}
          >
            <div className={styles.conversationAvatar}>
              <Avatar
                src={conversation.avatar}
                name={conversation.name}
                size="md"
                status={conversation.isOnline ? 'online' : 'offline'}
              />
            </div>
            <div className={styles.conversationContent}>
              <div className={styles.conversationHeader}>
                <span className={styles.conversationName}>{conversation.name}</span>
                <span className={styles.conversationTime}>{conversation.time}</span>
              </div>
              <div className={styles.conversationMeta}>
                <span className={styles.conversationRole}>{conversation.role}</span>
              </div>
              <div className={styles.conversationPreview}>
                <span className={conversation.isTyping ? styles.typing : ''}>
                  {conversation.message}
                </span>
                {conversation.unread > 0 && (
                  <Badge count={conversation.unread} className={styles.unreadBadge} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesSidebar;
