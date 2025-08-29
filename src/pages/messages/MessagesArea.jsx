import React from 'react';
import Avatar from '../../components/avatar';
import styles from './Messages.module.css';

const MessagesArea = ({ currentConversation }) => {
  return (
    <div className={styles.messagesArea}>
      {currentConversation.messages.map((message, index) => {
        const showDate = index === 0 ||
          (currentConversation.messages[index - 1] &&
            currentConversation.messages[index - 1].time !== message.time);

        return (
          <div key={message.id}>
            {showDate && (
              <div className={styles.dateMarker}>
                <span>{message.time}</span>
              </div>
            )}
            <div className={`${styles.messageWrapper} ${message.isOwn ? styles.own : ''}`}>
              {!message.isOwn && (
                <Avatar
                  src={currentConversation.avatar}
                  name={message.sender}
                  size="sm"
                />
              )}
              <div className={styles.messageContent}>
                <span className={styles.messageSender}>
                  {message.isOwn ? 'You' : message.sender}
                </span>
                <div className={`${styles.messageBubble} ${message.isOwn ? styles.ownMessage : styles.otherMessage}`}>
                  {message.hasAttachment ? (
                    <div className={styles.attachmentMessage}>
                      <div className={styles.attachmentIcon}>
                        📄
                      </div>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>{message.message}</span>
                        <span className={styles.attachmentSize}>{message.attachmentSize}</span>
                      </div>
                    </div>
                  ) : (
                    <p>{message.message}</p>
                  )}
                </div>
                {!showDate && (
                  <span className={styles.messageTime}>{message.time}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesArea;
