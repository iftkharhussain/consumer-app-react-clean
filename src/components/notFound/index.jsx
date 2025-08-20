
import './style.css'
import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFound = ({type, style, message}) => {
  const { t } = useTranslation();
  return (
    <div style={style} className='not-found-404-component'>
      <img src="/images/not-found-404.svg" alt='not-found-404' />
      <br />
      <h3>404</h3>
      <p>{message || t('noDataFoundAgainstThisQuery')}</p>
    </div>
  );
};

export default NotFound;