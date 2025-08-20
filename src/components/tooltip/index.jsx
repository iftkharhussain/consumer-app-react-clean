import React from 'react';
import { Tooltip as AntTooltip } from 'antd';
import styles from './Tooltip.module.css';

const Tooltip = ({
  children,
  title,
  placement = 'top',
  trigger = 'hover',
  className = '',
  overlayClassName = '',
  ...props
}) => {
  // Build overlay classes
  const overlayClasses = [
    styles.tooltip,
    overlayClassName
  ].filter(Boolean).join(' ');

  return (
    <AntTooltip
      title={title}
      placement={placement}
      trigger={trigger}
      overlayClassName={overlayClasses}
      className={className}
      {...props}
    >
      {children}
    </AntTooltip>
  );
};

export default Tooltip;
