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

export const MailIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M18.3333 4.16667H1.66667V15.8333H18.3333V4.16667Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.3333 4.16667L10 10L1.66667 4.16667"
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

export const PhoneIcon = (props) => (
  <Icon
    icon={() => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M18.3333 14.0917V16.5917C18.3343 16.8127 18.2917 17.0315 18.2078 17.2356C18.1239 17.4397 17.9998 17.625 17.8427 17.7808C17.6857 17.9366 17.4988 18.0597 17.2925 18.1428C17.0862 18.2259 16.8646 18.2673 16.6408 18.2646C14.0792 17.9859 11.6212 17.1121 9.45831 15.7104C7.43467 14.4172 5.7161 12.6987 4.42289 10.675C3.01633 8.50294 2.14213 6.03362 1.86872 3.46042C1.86603 3.23724 1.90709 3.01632 1.98964 2.81057C2.0722 2.60482 2.19455 2.41843 2.34969 2.26217C2.50482 2.10591 2.68958 1.98295 2.89311 1.90045C3.09664 1.81795 3.31478 1.77758 3.53539 1.78167H6.03539C6.43859 1.77771 6.82855 1.92569 7.12788 2.19623C7.42721 2.46676 7.61483 2.84074 7.65372 3.24375C7.72652 4.05386 7.92429 4.8488 8.24164 5.61042C8.35414 5.87784 8.38923 6.17187 8.34293 6.45946C8.29663 6.74705 8.17094 7.01604 7.97997 7.23625L6.92164 8.29458C8.12154 10.398 9.85196 12.1285 11.9554 13.3283L13.0137 12.27C13.2339 12.079 13.5029 11.9533 13.7905 11.907C14.0781 11.8607 14.3721 11.8958 14.6396 12.0083C15.4012 12.3257 16.1961 12.5235 17.0062 12.5963C17.4116 12.6355 17.7876 12.8258 18.0583 13.1284C18.329 13.431 18.4741 13.8242 18.4654 14.2292L18.3333 14.0917Z"
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
