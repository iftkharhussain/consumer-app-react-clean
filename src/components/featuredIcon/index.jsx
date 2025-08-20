import React from 'react';
import PropTypes from 'prop-types';
import styles from './FeaturedIcon.module.css';

const FeaturedIcon = ({
  icon: IconComponent,
  size = 'lg',
  color = 'gray',
  type = 'modern',
  className = '',
  ...props
}) => {
  // Build classes based on props
  const iconClasses = [
    styles.featuredIcon,
    styles[`size-${size}`],
    styles[`color-${color}`],
    styles[`type-${type}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={iconClasses} {...props}>
      {IconComponent && <IconComponent className={styles.icon} />}
    </div>
  );
};

FeaturedIcon.propTypes = {
  icon: PropTypes.elementType.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['gray', 'primary', 'error', 'warning', 'success']),
  type: PropTypes.oneOf(['modern', 'outline', 'light']),
  className: PropTypes.string,
};

export default FeaturedIcon;
