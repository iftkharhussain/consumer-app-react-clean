import React from 'react';
import './index.css';

const ContentBox = ({ title, children, className = '' }) => {
  return (
    <div className={`content-box ${className}`}>
      {title && <div className="content-box-header">{title}</div>}
        {children}
    </div>
  );
};

export default ContentBox;