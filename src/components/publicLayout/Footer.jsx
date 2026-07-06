/**
 * Footer — shared blue footer for every public /questions/* funnel page.
 *
 * Left:   legal / utility links.
 * Center: large Norga wordmark.
 * Right:  scroll-to-top button.
 * Below:  AMF distributor legal line.
 *
 * The links point at norga.io; confirm the exact slugs with marketing before
 * launch — they are centralized here so they're easy to update.
 */

import React from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';
import styles from './PublicLayout.module.css';

const WORDMARK_SRC = '/images/norga_logo_noir-resized.svg';

const LINKS = [
  { label: "Conditions d'utilisation", href: 'https://norga.io/conditions-utilisation' },
  { label: 'Protection des renseignements personnels', href: 'https://norga.io/politique-de-confidentialite' },
  { label: 'Plaintes et différends', href: 'https://norga.io/plaintes-et-differends' },
  { label: 'Désabonnement', href: 'https://norga.io/desabonnement' },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Decorative wave that sits on the page background above the blue block. */}
      <svg className={styles.wave} viewBox="0 -16 1440 84" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <path d="M1440 47.5411C1369.24 43.2952 1308.53 16.0927 1238.36 4.77331C1109.65 -15.9917 981.473 36.8062 852.165 51.9244C709.538 68.607 566.348 39.2557 423.908 20.562C281.475 1.86827 134.1 -10.577 0 47.5411L0 68L1440 68Z" />
      </svg>

      <div className={styles.footerInner}>
        <nav className={styles.footerLinks}>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className={styles.footerLink} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </nav>

        <img src={WORDMARK_SRC} alt="Norga" className={styles.wordmark} />

        <button type="button" onClick={scrollToTop} className={styles.toTop} aria-label="Remonter en haut">
          <ArrowUpOutlined style={{ fontSize: 18 }} />
        </button>
      </div>

      <div className={styles.footerLegal}>
        Norga Inc.
        <br />
        distributeur des produits financiers iA groupe financier
        <br />
        122-100, rue Robinson S, 2e étage
        <br />
        Granby (Québec) J2G 7L4
      </div>
    </footer>
  );
}
