import React from 'react';
import cx from 'classnames';
import styles from './Banner.module.css';

const Banner = ({ heading, subHeading, bannerActions, bottomActionRow, className }) => {
  return (
    <div className={styles.root}>
      <div className={cx(styles.banner, styles.bannerRes, className)}>
        <div className={styles.info}>
          <h1>{heading}</h1>
          <p>{subHeading}</p>
        </div>
        <div className={styles.actions}>
          {bannerActions && React.cloneElement(bannerActions)}
        </div>
      </div>
      {
        bottomActionRow &&
        <div className={styles.banner}>
          <div className={styles.bottomActionsRow}>
            {bottomActionRow && React.cloneElement(bottomActionRow)}
          </div>
        </div>
      }
    </div>
  );
};

export default Banner;