/**
 * Shared funnel field primitives — the reusable building blocks for every
 * public /questions/* funnel form. Extracted (verbatim styling) from the
 * original per-product pages so new forms don't redeclare these locally.
 *
 * Styling is reused from the existing CSS modules (not duplicated):
 *   - styles : pages/assuranceVie/AssuranceVie.module.css  (shared funnel look)
 *   - local  : pages/assuranceSalaire/AssuranceSalaire.module.css (Yes/No, OK row)
 */

import React, { useState, useRef } from 'react';
import { InfoCircleOutlined, DownOutlined } from '@ant-design/icons';
import ImprovedDatePicker from '../../pages/assuranceVie/ImprovedDatePicker';
import { sanitizeName, sanitizeDigits } from '../../pages/assuranceVie/formValidation';
import styles from '../../pages/assuranceVie/AssuranceVie.module.css';
import local from '../../pages/assuranceSalaire/AssuranceSalaire.module.css';

// ── Info tooltip ──────────────────────────────────────────────────────────────

export function InfoTooltip({ content }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  function handleClick() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 + window.scrollX });
    }
    setOpen((v) => !v);
  }
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={styles.tipBtn}
      >
        <InfoCircleOutlined style={{ fontSize: 13 }} />
      </button>
      {open && (
        <div
          className={styles.tipPop}
          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, calc(-100% - 8px))' }}
        >
          {content}
          <div className={styles.tipArrow} />
        </div>
      )}
    </>
  );
}

// ── Field primitives ──────────────────────────────────────────────────────────

export function Input({ value, onChange, placeholder, type = 'text', prefix, suffix, filter, error, inputMode }) {
  const handle = (raw) => {
    if (filter === 'name') return onChange(sanitizeName(raw));
    if (filter === 'digits') return onChange(sanitizeDigits(raw));
    return onChange(raw);
  };
  return (
    <div className={styles.inputWrap}>
      {prefix && <span className={styles.inputAffix} style={{ left: 12 }}>{prefix}</span>}
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${prefix ? styles.hasPrefix : ''} ${suffix ? styles.hasSuffix : ''}`}
        style={error ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.12)' } : undefined}
      />
      {suffix && <span className={styles.inputAffix} style={{ right: 12 }}>{suffix}</span>}
    </div>
  );
}

export function Select({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <DownOutlined className={styles.selectChevron} style={{ fontSize: 11 }} />
    </div>
  );
}

export function DateInput({ value, onChange }) {
  return (
    <ImprovedDatePicker
      value={value || null}
      onChange={(v) => onChange(v || '')}
      placeholder="JJ/MM/AAAA"
      fromYear={1900}
      toYear={new Date().getFullYear()}
    />
  );
}

export function PillToggle({ value, onChange, options }) {
  return (
    <div className={styles.pillGroup}>
      {options.map((o) => (
        <button
          key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`${styles.pill} ${value === o.value ? styles.pillActive : ''}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function YesNoToggle({ value, onChange }) {
  return (
    <div className={local.yesNoGroup}>
      <button
        type="button" onClick={() => onChange('oui')}
        className={`${local.yesNo} ${value === 'oui' ? local.yesNoActive : ''}`}
      >
        Oui
      </button>
      <div className={local.yesNoDivider} />
      <button
        type="button" onClick={() => onChange('non')}
        className={`${local.yesNo} ${value === 'non' ? local.yesNoActive : ''}`}
      >
        Non
      </button>
    </div>
  );
}

export function BoxSelect({ value, onChange, options }) {
  return (
    <div className={styles.boxGroup}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`${styles.box} ${active ? styles.boxActive : ''}`}
          >
            <span className={`${styles.boxDot} ${active ? styles.boxDotActive : ''}`}>
              {active && <span className={styles.boxDotInner} />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, tip, children, error }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabelRow}>
        <label className={styles.fieldLabel}>{label}</label>
        {tip && <InfoTooltip content={tip} />}
      </div>
      {children}
      {error && <p className={styles.errorText} style={{ textAlign: 'left', marginTop: 2 }}>{error}</p>}
    </div>
  );
}

export function FormGroup({ children }) {
  return <div className={styles.formGroup}>{children}</div>;
}

// ── OTP inputs (visual only) ────────────────────────────────────────────────────

export function OTPInputs({ digits, codeRefs, codeError, onChange, onKeyDown, onPaste, onResend }) {
  return (
    <FormGroup>
      <div className={styles.otpRow} onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { codeRefs.current[i] = el; }}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={(e) => onChange(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => onKeyDown(i, e)}
            className={styles.otpInput}
          />
        ))}
      </div>
      {codeError && <p className={styles.errorText}>{codeError}</p>}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="button" onClick={onResend} className={styles.linkBtn}>Renvoyer le code</button>
      </div>
    </FormGroup>
  );
}
