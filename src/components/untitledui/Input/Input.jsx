import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  placeholder = '',
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  size = 'sm',
  error = false,
  disabled = false,
  required = false,
  helpText,
  errorText,
  icon: Icon,
  iconPosition = 'left',
  shortcut,
  tooltip,
  className = '',
  inputClassName = '',
  wrapperClassName = '',
  ...props
}, ref) => {
  const wrapperClasses = [
    styles.wrapper,
    styles[size],
    error && styles.error,
    disabled && styles.disabled,
    wrapperClassName
  ].filter(Boolean).join(' ');

  const inputClasses = [
    styles.input,
    Icon && iconPosition === 'left' && styles.hasLeftIcon,
    Icon && iconPosition === 'right' && styles.hasRightIcon,
    shortcut && styles.hasShortcut,
    inputClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
          {tooltip && (
            <span className={styles.tooltip} title={tooltip}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16ZM6.5 6.5a1.5 1.5 0 1 1 3 0 .5.5 0 0 0 1 0 2.5 2.5 0 1 0-2.5 2.5v.5a.5.5 0 0 0 1 0v-.5a1.5 1.5 0 0 0 1-1.415A1.5 1.5 0 0 0 6.5 6.5ZM8 11a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"/>
              </svg>
            </span>
          )}
        </label>
      )}
      
      <div className={wrapperClasses}>
        {Icon && iconPosition === 'left' && (
          <Icon className={`${styles.icon} ${styles.leftIcon}`} />
        )}
        
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <Icon className={`${styles.icon} ${styles.rightIcon}`} />
        )}
        
        {shortcut && (
          <div className={styles.shortcut}>
            {typeof shortcut === 'string' ? shortcut : '⌘K'}
          </div>
        )}
      </div>
      
      {(helpText || errorText) && (
        <div className={styles.hint}>
          {error && errorText ? errorText : helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  type: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  helpText: PropTypes.string,
  errorText: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  shortcut: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  tooltip: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  wrapperClassName: PropTypes.string,
};

export default Input;
