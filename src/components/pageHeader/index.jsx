import React from 'react';
import Text from '../text';
import styles from './PageHeader.module.css';

const PageHeader = ({ title, subtitle, className = '', style = {}, ...props }) => {
  return (
    <div className={`${styles.pageHeader} ${className}`} style={style} {...props}>
      <Text variant="display-sm" color="primary" as="h1">
        {title}
      </Text>
      <Text variant="body-md" color="tertiary">
        {subtitle}
      </Text>
    </div>
  );
};

export default PageHeader;
