import React from "react";
import './style.css'
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';

function PageNotFound() {
  const { t } = useTranslation();
  return (
    <div id="notfound">
      <div className="notfound">
        <div className="notfound-404">
          <h1>404</h1>
        </div>
        <h2>{t('pageNotFound')}</h2>
        <p>{t('pageNotFoundMessage')}</p>
        <p><Link to={'/'}>{t('returnToHomepage')}</Link></p>
      </div>
    </div>

  )
}

export default PageNotFound