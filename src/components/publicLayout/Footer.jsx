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
      <svg className={styles.wave} viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 48 L0 24 C 240 0 480 48 720 32 C 960 16 1200 0 1440 24 L 1440 48 Z" />
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
        Norga inc.,
        <br />
        distributeur des produits financiers iA groupe financier
        <br />
        123-100, rue Robinson S, 2e étage, Granby (Québec) J2G 7L4
      </div>
    </footer>
  );
}
