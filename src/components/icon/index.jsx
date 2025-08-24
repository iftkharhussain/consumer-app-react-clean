import React from 'react';
import styles from './Icon.module.css';

const Icon = ({
  icon: IconComponent,
  size = 'md',
  color = 'default',
  className = '',
  onClick,
  ...props
}) => {
  // Build classes
  const iconClasses = [
    styles.icon,
    styles[`size-${size}`],
    styles[`color-${color}`],
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  // If icon is a string (like from untitled-ui), render as is
  if (typeof IconComponent === 'string') {
    return (
      <span
        className={iconClasses}
        onClick={onClick}
        {...props}
      >
        {IconComponent}
      </span>
    );
  }

  // If icon is a component
  if (typeof IconComponent === 'function') {
    return (
      <IconComponent
        className={iconClasses}
        onClick={onClick}
        {...props}
      />
    );
  }

  // If icon is an element
  if (React.isValidElement(IconComponent)) {
    return React.cloneElement(IconComponent, {
      className: [IconComponent.props.className, iconClasses].filter(Boolean).join(' '),
      onClick: onClick || IconComponent.props.onClick,
      ...props
    });
  }

  return null;
};

// Common icons as components for easy usage
export const CheckIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.6667 5L7.50004 14.1667L3.33337 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {...props}
  />
);

export const ChevronDownIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {...props}
  />
);

export const InfoIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 13.3333V10M10 6.66667H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {...props}
  />
);

export const AlertTriangleIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M8.57465 3.42502C9.15165 2.47169 10.8483 2.47169 11.4253 3.42502L17.6003 14.725C18.1773 15.6784 17.4956 16.875 16.3583 16.875H3.64165C2.50432 16.875 1.82265 15.6784 2.39965 14.725L8.57465 3.42502Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 7.5V10.8333"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 14.1667H10.0083"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {...props}
  />
);

export const XIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15 5L5 15M5 5L15 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {...props}
  />
);

export const ArrowRightIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12H19M19 12L12 5M19 12L12 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {...props}
  />
);

export default Icon;
