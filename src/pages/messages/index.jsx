import React, { useState } from 'react';
import { Input, Badge, Button as AntButton, Dropdown } from 'antd';
import { SearchOutlined, MoreOutlined, PhoneOutlined } from '@ant-design/icons';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
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
      <div className={styles.sidebarHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Messages</h1>
        </div>
        <p className={styles.subtitle}>
          Request to speak with a professional and view your conversation history here!
        </p>
      </div>
      <div className={styles.messagesContainer}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>Messages</h1>
              <Badge count={1} className={styles.badge}>
                <div></div>
              </Badge>
            </div>
            <p className={styles.subtitle}>
              Request to speak with a professional and view your conversation history here!
            </p>
          </div>

          <div className={styles.searchSection}>
            <Input
              placeholder="Search"
              prefix={<SearchOutlined className={styles.searchIcon} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.conversationsList}>
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${selectedMessage?.id === conversation.id ? styles.selected : ''}`}
                onClick={() => handleConversationSelect(conversation)}
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

        {/* Main Content */}
        <div className={styles.mainContent}>
          {selectedMessage || currentConversation ? (
            <>
              {/* Chat Header */}
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
                    <h3 className={styles.chatHeaderName}>{currentConversation.name}</h3>
                    <div className={styles.chatHeaderMeta}>
                      <span className={styles.chatHeaderRole}>{currentConversation.role}</span>
                      <span className={styles.onlineStatus}>
                        {currentConversation.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.chatHeaderActions}>
                  <Button
                    color="secondary"
                    size="sm"
                    className={styles.callButton}
                  >
                    <PhoneOutlined />
                    Call
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                  >
                    Archive
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                  >
                    View profile
                  </Button>
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

              {/* Messages Area */}
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

              {/* Message Input */}
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
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
