/**
 * Config-driven funnel tab bar (Étape 1 / 2 / 3). The `tabs` come from each
 * form's config, so labels differ per product without forking the component.
 */

import React from 'react';
import styles from './funnel.module.css';

export default function TabBar({ tabs, active, onChange, enabled }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className={styles.tabBar}>
        {tabs.map((t, i) => {
          const isActive = active === i;
          const isDisabled = enabled ? !enabled(i) : false;
          return (
            <button
              key={i} type="button" onClick={() => onChange(i)} disabled={isDisabled}
              className={`${styles.tab} ${isActive ? styles.tabActive : styles.tabInactive} ${isDisabled ? styles.tabDisabled : ''}`}
            >
              <span className={styles.tabStep} style={{ color: isActive ? '#1a1aba' : '#9baab8' }}>
                <span className={styles.tabNum} style={{ background: isActive ? '#1a1aba' : '#c8cdd6' }}>{i + 1}</span>
                {t.step}
              </span>
              <span className={styles.tabLabel} style={{ color: isActive ? '#121926' : '#9baab8' }}>
                {t.label}
              </span>
              {isActive && (
                <span className={styles.tabArrow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" viewBox="0 0 16 8" fill="none">
                    <g clipPath="url(#clip0_93_797)">
                      <path d="M0 0L8 8L16 0H0Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_93_797">
                        <rect width="16" height="8" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
