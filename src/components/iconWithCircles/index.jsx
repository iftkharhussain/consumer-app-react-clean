import React from 'react';
import styles from './IconWithCircles.module.css';

const IconWithCircles = ({
  icon: IconComponent,
  size = 'md',
  variant = 'primary',
  className = '',
  iconColor = 'white',
  onClick,
  ...props
}) => {
  // Build classes
  const wrapperClasses = [
    styles.iconWrapper,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  const iconClasses = [
    styles.icon,
    styles[`icon-color-${iconColor}`]
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    // If icon is a string (like from untitled-ui), render as is
    if (typeof IconComponent === 'string') {
      return (
        <span className={iconClasses}>
          {IconComponent}
        </span>
      );
    }

    // If icon is a component
    if (typeof IconComponent === 'function') {
      return (
        <IconComponent className={iconClasses} />
      );
    }

    // If icon is an element
    if (React.isValidElement(IconComponent)) {
      return React.cloneElement(IconComponent, {
        className: [IconComponent.props.className, iconClasses].filter(Boolean).join(' ')
      });
    }

    return null;
  };

  return (
    <div
      className={wrapperClasses}
      onClick={onClick}
      {...props}
    >
      <div className={styles.outerCircle}>
        <div className={styles.innerCircle}>
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default IconWithCircles;
