import React from 'react';
import { Badge as AntBadge } from 'antd';
import styles from './Badge.module.css';

const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
  showDot = false, // Add alias for dot prop to match our usage
  icon: Icon,
  onClose,
  className = '',
  ...props
}) => {
  const isClosable = typeof onClose === 'function';
  const hasDot = dot || showDot; // Support both prop names
  
  // Build classes
  const badgeClasses = [
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    hasDot ? styles.dot : '',
    isClosable ? styles.closable : '',
    className
  ].filter(Boolean).join(' ');

  // For dot badges, use Antd's dot functionality
  if (hasDot && !children) {
    return (
      <AntBadge
        dot
        className={badgeClasses}
        {...props}
      />
    );
  }

  // Regular badge content
  const badgeContent = (
    <span className={badgeClasses} {...props}>
      {hasDot && (
        <span className={styles.dotElement} />
      )}
      
      {Icon && (
        <span className={styles.icon}>
          {typeof Icon === 'function' ? <Icon /> : Icon}
        </span>
      )}
      
      {children && (
        <span className={styles.text}>
          {children}
        </span>
      )}
      
      {isClosable && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          type="button"
          aria-label="Remove badge"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );

  return badgeContent;
};

// Export color variants for easier usage
export const PrimaryBadge = (props) => <Badge variant="primary" {...props} />;
export const SecondaryBadge = (props) => <Badge variant="secondary" {...props} />;
export const SuccessBadge = (props) => <Badge variant="success" {...props} />;
export const WarningBadge = (props) => <Badge variant="warning" {...props} />;
export const ErrorBadge = (props) => <Badge variant="error" {...props} />;
export const GrayBadge = (props) => <Badge variant="gray" {...props} />;

export default Badge;
