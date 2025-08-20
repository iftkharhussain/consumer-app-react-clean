import React from 'react';
import { Avatar as AntAvatar } from 'antd';
import styles from './Avatar.module.css';

const Avatar = ({
  size = 'md',
  src,
  alt,
  name,
  placeholder,
  status,
  className = '',
  onClick,
  ...props
}) => {
  // Map untitledui sizes to pixel values
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    '2xl': 64
  };

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Build classes
  const avatarClasses = [
    styles.avatar,
    styles[`size-${size}`],
    status ? styles.hasStatus : '',
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  const statusClasses = [
    styles.status,
    styles[`status-${status}`],
    styles[`statusSize-${size}`]
  ].filter(Boolean).join(' ');

  const avatarContent = (
    <div className={styles.wrapper} onClick={onClick}>
      <AntAvatar
        size={sizeMap[size]}
        src={src}
        alt={alt || name}
        className={avatarClasses}
        {...props}
      >
        {!src && (name ? getInitials(name) : placeholder || '?')}
      </AntAvatar>
      
      {status && (
        <span className={statusClasses} />
      )}
    </div>
  );

  return avatarContent;
};

// Export size variants
export const XSAvatar = (props) => <Avatar size="xs" {...props} />;
export const SMAvatar = (props) => <Avatar size="sm" {...props} />;
export const MDAvatar = (props) => <Avatar size="md" {...props} />;
export const LGAvatar = (props) => <Avatar size="lg" {...props} />;
export const XLAvatar = (props) => <Avatar size="xl" {...props} />;
export const XXLAvatar = (props) => <Avatar size="2xl" {...props} />;

// Export with status variants
export const OnlineAvatar = (props) => <Avatar status="online" {...props} />;
export const OfflineAvatar = (props) => <Avatar status="offline" {...props} />;
export const AwayAvatar = (props) => <Avatar status="away" {...props} />;
export const BusyAvatar = (props) => <Avatar status="busy" {...props} />;

export default Avatar;
