/**
 * PublicLayout — the chrome wrapper for every public /questions/* funnel page.
 *
 *   <PublicLayout productLabel="Assurance vie">
 *     <SomeFunnelForm />
 *   </PublicLayout>
 *
 * Renders the shared Header + Footer with the funnel content sandwiched in
 * between. `productLabel` drives the pill shown on the right of the header.
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from './PublicLayout.module.css';

export default function PublicLayout({ productLabel, children }) {
  return (
    <div className={styles.shell}>
      <Header productLabel={productLabel} />
      <main className={styles.content}>{children}</main>
      <Footer />
    </div>
  );
}
