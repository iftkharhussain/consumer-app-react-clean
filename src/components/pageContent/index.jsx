import React from 'react';
import './index.css';

const PageContent = ({ pageType, children }) => {
  return (
    <div className={`${pageType} page-content`}>
      {children}
    </div>
  );
};

export default PageContent;