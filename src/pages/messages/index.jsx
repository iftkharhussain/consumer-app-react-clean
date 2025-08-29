import React, { useState } from 'react';
import { PhoneOutlined } from '@ant-design/icons';
import MessagesHeader from './MessagesHeader';
import MessagesSidebar from './MessagesSidebar';
import ChatArea from './ChatArea';
import styles from './Messages.module.css';

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  // Mock data - in real app this would come from API
  const conversations = [
    {
      id: 1,
      name: 'Phoenix Baker',
      role: 'Life Insurance',
      message: 'Hey Olivia, Katherine sent me over the latest doc. I just have a quick question about the...',
      time: '5min ago',
      avatar: '/images/Avatar.png',
      unread: 0,
      isOnline: false
    },
    {
      id: 2,
      name: 'Katherine Moss',
      role: 'Home Insurance',
      message: 'Your Sure thing, I\'ll have a look today. They\'re looking great!',
      time: '20min ago',
      avatar: '/images/Avatar.png',
      unread: 0,
      isOnline: true
    },
    {
      id: 3,
      name: 'Mollie Hall',
      role: 'Auto Insurance',
      message: 'Mollie is typing...',
      time: '1hr ago',
      avatar: '/images/Avatar.png',
      unread: 0,
      isOnline: false,
      isTyping: true
    },
    {
      id: 4,
      name: 'Rosalee Melvin',
      role: 'Disability Insurance',
      message: 'Hey Liv — just wanted to say thanks for chasing up the release for me. Really...',
      time: '2hr ago',
      avatar: '/images/Avatar.png',
      unread: 0,
      isOnline: false
    }
  ];

  const currentConversation = {
    id: 2,
    name: 'Katherine Moss',
    role: 'Home Insurance',
    avatar: '/images/Avatar.png',
    isOnline: true,
    messages: [
      {
        id: 1,
        sender: 'Katherine Moss',
        message: 'Some notes in the good as well or I need to look even',
        time: 'Thursday 11:41am',
        isOwn: false,
        hasAttachment: false
      },
      {
        id: 2,
        sender: 'Katherine Moss',
        message: 'Tech requirements.pdf',
        time: 'Thursday 11:41am',
        isOwn: false,
        hasAttachment: true,
        attachmentSize: '1.2 MB'
      },
      {
        id: 3,
        sender: 'You',
        message: 'Awesome! Thanks. I\'ll look at this today.',
        time: 'Thursday 11:41am',
        isOwn: true,
        hasAttachment: false
      },
      {
        id: 4,
        sender: 'Katherine Moss',
        message: 'No rush though — we still have to wait for Lana\'s designs.',
        time: 'Thursday 11:44am',
        isOwn: false,
        hasAttachment: false
      },
      {
        id: 5,
        sender: 'Katherine Moss',
        message: 'Hey Olivia, can you please review the latest design when you can?',
        time: 'Today 2:20pm',
        isOwn: false,
        hasAttachment: false
      },
      {
        id: 6,
        sender: 'You',
        message: 'Sure thing, I\'ll have a look today. They\'re looking great!',
        time: 'Just now',
        isOwn: true,
        hasAttachment: false
      }
    ]
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    conv.message.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleConversationSelect = (conversation) => {
    setSelectedMessage(conversation);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const headerDropdownItems = [
    {
      key: 'call',
      label: (
        <div className={styles.dropdownItem}>
          <PhoneOutlined />
          Call
        </div>
      ),
    },
    {
      key: 'archive',
      label: (
        <div className={styles.dropdownItem}>
          📦
          Archive
        </div>
      ),
    },
    {
      key: 'view-profile',
      label: 'View profile',
    },
  ];

  return (
    <div>
      <MessagesHeader />
      <div className={styles.messagesContainer}>
        <MessagesSidebar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          conversations={filteredConversations}
          selectedMessage={selectedMessage}
          onConversationSelect={handleConversationSelect}
        />
        <ChatArea
          selectedMessage={selectedMessage}
          currentConversation={currentConversation}
          headerDropdownItems={headerDropdownItems}
        />
      </div>
    </div>
  );
};

export default Messages;
