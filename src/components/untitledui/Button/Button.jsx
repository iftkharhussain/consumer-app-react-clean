import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading,
    Icon && !children && styles.iconOnly,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {loading && (
        <div className={styles.spinner}>
          <div className={styles.spinnerIcon} />
        </div>
      )}
      
      {Icon && iconPosition === 'left' && (
        <Icon className={styles.icon} />
      )}
      
      {children && (
        <span className={styles.text}>{children}</span>
      )}
      
      {Icon && iconPosition === 'right' && (
        <Icon className={styles.icon} />
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary', 
    'tertiary',
    'link-gray',
    'link-color',
    'primary-destructive',
    'secondary-destructive',
    'tertiary-destructive'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
};

export default Button;
