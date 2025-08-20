import React from 'react';
import PropTypes from 'prop-types';
import styles from './Badge.module.css';

const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    dot && styles.dot,
    className
  ].filter(Boolean).join(' ');

  if (dot) {
    return <div className={badgeClasses} {...props} />;
  }

  return (
    <div className={badgeClasses} {...props}>
      {Icon && iconPosition === 'left' && (
        <Icon className={styles.icon} />
      )}
      
      {children && (
        <span className={styles.text}>{children}</span>
      )}
      
      {Icon && iconPosition === 'right' && (
        <Icon className={styles.icon} />
      )}
    </div>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'blue',
    'indigo',
    'purple',
    'pink',
    'orange'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default Badge;
