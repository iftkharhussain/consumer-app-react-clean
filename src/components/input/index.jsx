import React from 'react';
import { Input as AntInput, Form } from 'antd';
import styles from './Input.module.css';

const Input = ({
  label,
  hint,
  size = 'sm',
  placeholder,
  icon: Icon,
  tooltip,
  shortcut,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  hideRequiredIndicator = false,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  wrapperClassName = '',
  inputClassName = '',
  iconClassName = '',
  ...props
}) => {
  // Map untitledui sizes to antd sizes
  const sizeMap = {
    sm: 'middle',
    md: 'large'
  };

  const hasLeadingIcon = !!Icon;
  const hasTrailingIcon = !!tooltip || isInvalid;

  // Build wrapper classes
  const wrapperClasses = [
    styles.wrapper,
    styles[`size-${size}`],
    hasLeadingIcon ? styles.hasLeadingIcon : '',
    hasTrailingIcon ? styles.hasTrailingIcon : '',
    isDisabled ? styles.disabled : '',
    isInvalid ? styles.invalid : '',
    wrapperClassName
  ].filter(Boolean).join(' ');

  // Build input classes
  const inputClasses = [
    styles.input,
    inputClassName
  ].filter(Boolean).join(' ');

  const inputElement = (
    <div className={wrapperClasses}>
      {/* Leading Icon */}
      {Icon && (
        <span className={[styles.icon, styles.iconLeading, iconClassName].filter(Boolean).join(' ')}>
          {typeof Icon === 'function' ? <Icon /> : Icon}
        </span>
      )}

      {/* Input Field */}
      <AntInput
        size={sizeMap[size]}
        placeholder={placeholder}
        disabled={isDisabled}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={inputClasses}
        status={isInvalid ? 'error' : undefined}
        {...props}
      />

      {/* Trailing Icon - Info/Error */}
      {isInvalid && (
        <span className={[styles.icon, styles.iconTrailing, styles.errorIcon].filter(Boolean).join(' ')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 10.6667V8M8 5.33333H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.31813 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.31813 4.31813 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.31813 14.6667 8Z"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {/* Tooltip Icon */}
      {tooltip && !isInvalid && (
        <span className={[styles.icon, styles.iconTrailing, styles.tooltipIcon].filter(Boolean).join(' ')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6.05999 6.00001C6.21672 5.55445 6.52608 5.17875 6.93329 4.93943C7.34051 4.70012 7.81926 4.61264 8.28118 4.69247C8.7431 4.77231 9.16135 5.01436 9.47136 5.37569C9.78137 5.73703 9.95999 6.19436 9.95999 6.66668C9.95999 8.00001 7.95999 8.66668 7.95999 8.66668M7.99999 11.3333H8.00666M14.6667 8.00001C14.6667 11.6819 11.6819 14.6667 7.99999 14.6667C4.31813 14.6667 1.33333 11.6819 1.33333 8.00001C1.33333 4.31813 4.31813 1.33333 7.99999 1.33333C11.6819 1.33333 14.6667 4.31813 14.6667 8.00001Z"
              stroke="currentColor"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {/* Shortcut */}
      {shortcut && (
        <div className={styles.shortcut}>
          <span className={styles.shortcutText}>
            {typeof shortcut === 'string' ? shortcut : '⌘K'}
          </span>
        </div>
      )}
    </div>
  );

  // If no label and hint, return just the input
  if (!label && !hint) {
    return inputElement;
  }

  // Return with label and hint wrapper
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label}>
          {label}
          {isRequired && !hideRequiredIndicator && (
            <span className={styles.required}>*</span>
          )}
        </label>
      )}
      
      {inputElement}
      
      {hint && (
        <div className={[styles.hint, isInvalid ? styles.hintError : ''].filter(Boolean).join(' ')}>
          {hint}
        </div>
      )}
    </div>
  );
};

// Export variants
export const TextArea = ({ rows = 4, ...props }) => {
  const { TextArea: AntTextArea } = AntInput;
  
  return (
    <Input
      {...props}
      component={AntTextArea}
      rows={rows}
    />
  );
};

export const Password = (props) => {
  return (
    <Input
      {...props}
      component={AntInput.Password}
    />
  );
};

export default Input;
