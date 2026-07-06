/**
 * Preferences step — a non-progressive funnel step that shows all fields at
 * once, each pre-selected with a sensible default the user can change. Used for
 * "Vos préférences"-style screens (segmented toggles + Retour/Suivant footer).
 *
 * Config:
 *   { type: 'preferences', title, subtitle?,
 *     fields: [{ key, label, tip?, default, options: [{value,label}] }] }
 */

import React from 'react';
import { Field, PillToggle, ChevronRight, ChevronLeft } from './primitives';
import styles from './funnel.module.css';

export default function PreferencesStep({ title, subtitle, fields, values, onChange, onNext, onBack }) {
  const set = (key) => (v) => onChange({ ...values, [key]: v });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={styles.card}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f2f5' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#121926', letterSpacing: '-0.3px', margin: '0 0 4px' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 13, color: '#9baab8', lineHeight: 1.6, margin: 0 }}>{subtitle}</p>}
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map((f) => (
            <Field key={f.key} label={f.label} tip={f.tip}>
              <div style={{ width: '100%' }}>
                <PillToggle value={values[f.key]} onChange={set(f.key)} options={f.options} />
              </div>
            </Field>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <button type="button" onClick={onBack} className={styles.btnGhost}>
          <ChevronLeft /> Retour
        </button>
        <button type="button" onClick={onNext} className={styles.btnPrimary}>
          Suivant <ChevronRight />
        </button>
      </div>
    </div>
  );
}
