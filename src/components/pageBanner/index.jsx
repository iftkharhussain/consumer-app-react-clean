import React from 'react';

const PageBanner = ({ heading, subHeading, actions, classNames, styles }) => {
  
  return (
    <div style={styles} className={`banner banner-res flex justify-content-between align-items-center ${classNames}`}>
      <div className='banner-info'>
        <h1>{heading}</h1>
        <p>{subHeading}</p>
      </div>
      <div className='banner-actions'>
        {actions}
      </div>
    </div>
  );
};

export default PageBanner;
