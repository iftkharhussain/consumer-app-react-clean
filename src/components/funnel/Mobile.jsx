/**
 * Mobile chrome for the funnel shell — step progress bar + slide-in transition.
 */

import React, { useState, useEffect } from 'react';
import styles from './funnel.module.css';

export function MobProgress({ step, total = 3, labels }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9baab8' }}>Étape {step} sur {total}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1aba' }}>{labels?.[step - 1]}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
          <div key={s} className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: step >= s ? '100%' : '0%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobSlide({ children, dir }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  return (
    <div style={{
      transform: visible ? 'translateX(0)' : dir === 'left' ? 'translateX(40px)' : 'translateX(-40px)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.22s ease',
    }}>
      {children}
    </div>
  );
}
