/**
 * Header — shared top bar for every public /questions/* funnel page.
 *
 * Left:  Norga brand logo (links home).
 * Right: a product pill showing which funnel the visitor is in
 *        (e.g. "Assurance hypothécaire"), driven by `productLabel`.
 */

import React from 'react';
import styles from './PublicLayout.module.css';

// Brand mark lives in /public/images (referenced by absolute path, as the rest
// of this app does — see pages/thankyouAdvisor).
const LOGO_SRC = '/images/norga-blue-logo.png';

export default function Header({ productLabel }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="https://norga.io" aria-label="Norga">
          <img src={LOGO_SRC} alt="Norga" className={styles.logo} />
        </a>
        {productLabel && <span className={styles.headerPill}>{productLabel}</span>}
      </div>
    </header>
  );
}
