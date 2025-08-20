import React from 'react';
import { Button as AntButton } from 'antd';
import styles from './Button.module.css';

const Button = ({
  children,
  size = 'sm',
  color = 'primary',
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  isLoading = false,
  isDisabled = false,
  showTextWhileLoading = false,
  className = '',
  onClick,
  htmlType = 'button',
  href,
  ...props
}) => {
  // Map untitledui sizes to antd sizes
  const sizeMap = {
    sm: 'small',
    md: 'middle',
    lg: 'large',
    xl: 'large'
  };

  // Map untitledui colors to antd types and custom classes
  const getAntdProps = (color) => {
    switch (color) {
      case 'primary':
        return { type: 'primary' };
      case 'secondary':
        return { type: 'default' };
      case 'tertiary':
        return { type: 'text' };
      case 'link-gray':
        return { type: 'link', className: styles.linkGray };
      case 'link-color':
        return { type: 'link', className: styles.linkColor };
      case 'primary-destructive':
        return { type: 'primary', danger: true };
      case 'secondary-destructive':
        return { type: 'default', danger: true };
      case 'tertiary-destructive':
        return { type: 'text', danger: true };
      case 'link-destructive':
        return { type: 'link', danger: true };
      default:
        return { type: 'primary' };
    }
  };

  const antdProps = getAntdProps(color);
  const isIconOnly = (IconLeading || IconTrailing) && !children;

  // Build combined className
  const combinedClassName = [
    styles.button,
    styles[`size-${size}`],
    styles[`color-${color}`],
    isIconOnly ? styles.iconOnly : '',
    isLoading ? styles.loading : '',
    isDisabled ? styles.disabled : '',
    antdProps.className || '',
    className
  ].filter(Boolean).join(' ');

  const buttonContent = (
    <>
      {IconLeading && !isLoading && (
        <span className={styles.iconLeading}>
          {typeof IconLeading === 'function' ? <IconLeading /> : IconLeading}
        </span>
      )}
      
      {children && (
        <span className={styles.text}>
          {children}
        </span>
      )}
      
      {IconTrailing && !isLoading && (
        <span className={styles.iconTrailing}>
          {typeof IconTrailing === 'function' ? <IconTrailing /> : IconTrailing}
        </span>
      )}
    </>
  );

  // If href is provided, render as link
  if (href && !isDisabled) {
    return (
      <a
        href={href}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <AntButton
      {...antdProps}
      size={sizeMap[size]}
      loading={isLoading}
      disabled={isDisabled}
      className={combinedClassName}
      onClick={onClick}
      htmlType={htmlType}
      {...props}
    >
      {buttonContent}
    </AntButton>
  );
};

export default Button;
