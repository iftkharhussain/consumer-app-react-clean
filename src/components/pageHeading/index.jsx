import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

const PageHeading = ({ title, subtitle, className }) => {
  return (
    <div className={`${className} page-heading`}>
      <h1 className='m-0 p-0'>{title}</h1>
      {subtitle && <p className='sub-heading mt-4'>{subtitle}</p>}
    </div>
  );
};

PageHeading.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default PageHeading;