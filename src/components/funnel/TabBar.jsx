/**
 * Config-driven funnel tab bar (Étape 1 / 2 / 3). The `tabs` come from each
 * form's config, so labels differ per product without forking the component.
 */

import React from 'react';
import { LockOutlined } from '@ant-design/icons';
import styles from '../../pages/assuranceVie/AssuranceVie.module.css';

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
                {isDisabled && <LockOutlined style={{ fontSize: 10, color: '#b0bac4' }} />}
              </span>
              <span className={styles.tabLabel} style={{ color: isActive ? '#121926' : '#9baab8' }}>
                {t.label}
              </span>
              {isActive && (
                <span className={styles.tabArrow}>
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                    <path d="M0 0 L8 8 L16 0Z" fill="#ffffff" />
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
