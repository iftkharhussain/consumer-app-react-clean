import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Avatar.module.css';

const Avatar = ({
  src,
  alt = '',
  size = 'md',
  initials,
  placeholder,
  placeholderIcon: PlaceholderIcon,
  badge,
  status,
  verified = false,
  contrastBorder = false,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const avatarClasses = [
    styles.avatar,
    styles[size],
    status && styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`],
    contrastBorder && styles.contrastBorder,
    className
  ].filter(Boolean).join(' ');

  const handleImageError = () => {
    setImageError(true);
  };

  const renderContent = () => {
    // If image exists and hasn't errored, show image
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={handleImageError}
        />
      );
    }

    // If initials provided, show initials
    if (initials) {
      return (
        <div className={styles.initials}>
          {initials}
        </div>
      );
    }

    // If custom placeholder provided, show it
    if (placeholder) {
      return <div className={styles.placeholder}>{placeholder}</div>;
    }

    // If custom icon provided, show it
    if (PlaceholderIcon) {
      return <PlaceholderIcon className={styles.placeholderIcon} />;
    }

    // Default user icon
    return (
      <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    );
  };

  return (
    <div className={styles.container}>
      <div className={avatarClasses} {...props}>
        {renderContent()}
        
        {/* Status indicator */}
        {status && (
          <div className={`${styles.statusIndicator} ${styles[status]}`} />
        )}
        
        {/* Verified tick */}
        {verified && (
          <div className={styles.verifiedTick}>
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Badge (company logo, etc.) */}
      {badge && (
        <div className={styles.badge}>
          {badge}
        </div>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  initials: PropTypes.string,
  placeholder: PropTypes.node,
  placeholderIcon: PropTypes.elementType,
  badge: PropTypes.node,
  status: PropTypes.oneOf(['online', 'offline']),
  verified: PropTypes.bool,
  contrastBorder: PropTypes.bool,
  className: PropTypes.string,
};

export default Avatar;
