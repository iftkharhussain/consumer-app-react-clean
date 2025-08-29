import React from 'react';
import { Input } from 'antd';
import Button from '../../components/button';
import styles from './Messages.module.css';

const MessageInput = () => {
  return (
    <div className={styles.messageInput}>
      <div className={styles.inputWrapper}>
        <Input.TextArea
          placeholder="Send a message"
          autoSize={{ minRows: 1, maxRows: 4 }}
          className={styles.textArea}
        />
        <div className={styles.inputActions}>
          <Button
            color="secondary"
            size="sm"
            className={styles.attachButton}
          >
            📎
          </Button>
          <Button
            color="primary"
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
