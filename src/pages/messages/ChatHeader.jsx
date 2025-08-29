import React from 'react';
import { Button as AntButton, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import Phone from '@untitled-ui/icons-react/build/cjs/PhoneCall01';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import styles from './Messages.module.css';
import StatusBadge from '../../components/statusBadge';
import AdvisorTypeBadge from '../../components/advisorTypeBadge';

const ChatHeader = ({ currentConversation, headerDropdownItems }) => {
  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatHeaderLeft}>
        <div className={styles.avatar}>
          <Avatar
            src={currentConversation.avatar}
            name={currentConversation.name}
            size="xl"
            status={currentConversation.isOnline ? 'online' : 'offline'}
          />
          
        </div>
        <div className={styles.chatHeaderInfo}>
          <span className='flex'><h3 className={styles.chatHeaderName}>{currentConversation.name}</h3> <AdvisorTypeBadge type={'online'} /></span>
          <div className={styles.chatHeaderMeta}>
            <span className={styles.chatHeaderRole}>{currentConversation.role}</span>
          </div>
        </div>
      </div>
      <div className={styles.chatHeaderActions}>
        <Button size='md' color="secondary">  <Phone style={{ width: '20px' }} /> &nbsp; Call </Button>
        <Button size='md' color="secondary"> Archive</Button>
        <Button size='md' color="primary">View profile</Button>
        <Dropdown
          menu={{ items: headerDropdownItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <AntButton
            type="text"
            icon={<MoreOutlined />}
            className={styles.moreButton}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default ChatHeader;
