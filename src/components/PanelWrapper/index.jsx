import React from 'react';
import cx from 'classnames';
import styles from './PanelWrapper.module.css';

const PanelWrapper = ({ children, className, ...rest }) => {
  return (
    <div {...rest} className={cx(styles.root, className)}>
      {children}
    </div>
  );
};

export default PanelWrapper;