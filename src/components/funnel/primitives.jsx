/**
 * Shared funnel field primitives — the reusable building blocks for every
 * public /questions/* funnel form. Extracted (verbatim styling) from the
 * original per-product pages so new forms don't redeclare these locally.
 *
 * Styling comes from the single shared stylesheet funnel.module.css. `styles`
 * and `local` both point at it (the `local` alias is kept only so the Yes/No,
 * OK-row and reco class names read the same as before).
 */

import React, { useState, useRef } from 'react';
import ImprovedDatePicker from '../../pages/assuranceVie/ImprovedDatePicker';
import { sanitizeName, sanitizeDigits, formatCAPhone } from '../../pages/assuranceVie/formValidation';
import styles from './funnel.module.css';
import local from './funnel.module.css';

// ── Chevron-right icon (shared by every "Suivant"/"Continuer" button) ─────────
// stroke: currentColor → white on the blue/green CTAs, inherits on outline ones.
export function ChevronRight({ size = 14 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Chevron-left icon (shared by every "Retour" button). stroke: currentColor.
export function ChevronLeft({ size = 13 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8.125 9.75L4.875 6.5L8.125 3.25" stroke="currentColor" strokeWidth="1.08333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Chevron-down icon for dropdown selects (the right-aligned indicator).
export function ChevronDown({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
      <path d="M0.5 0.5L3.5 3.5L6.5 0.5" stroke="#9BAAB8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ display: 'block' }}>
          <g clipPath="url(#clip0_25_8032)">
            <path d="M6.50004 11.9166C9.49158 11.9166 11.9167 9.49152 11.9167 6.49998C11.9167 3.50844 9.49158 1.08331 6.50004 1.08331C3.5085 1.08331 1.08337 3.50844 1.08337 6.49998C1.08337 9.49152 3.5085 11.9166 6.50004 11.9166Z" stroke="#1A1ABA" strokeOpacity="0.5" strokeWidth="1.08333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 8.66667V6.5" stroke="#1A1ABA" strokeOpacity="0.5" strokeWidth="1.08333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 4.33331H6.50542" stroke="#1A1ABA" strokeOpacity="0.5" strokeWidth="1.08333" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_25_8032">
              <rect width="13" height="13" fill="white" />
            </clipPath>
          </defs>
        </svg>
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

export function Input({ value, onChange, placeholder, type = 'text', prefix, suffix, filter, error, inputMode, disabled }) {
  const handle = (raw) => {
    if (filter === 'name') return onChange(sanitizeName(raw));
    if (filter === 'digits') return onChange(sanitizeDigits(raw));
    if (filter === 'phone') return onChange(formatCAPhone(raw));
    return onChange(raw);
  };
  const disabledStyle = { background: '#f2f4f7', color: '#697586', cursor: 'not-allowed' };
  return (
    <div className={styles.inputWrap}>
      {prefix && <span className={styles.inputAffix} style={{ left: 12 }}>{prefix}</span>}
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${prefix ? styles.hasPrefix : ''} ${suffix ? styles.hasSuffix : ''}`}
        style={disabled ? disabledStyle : (error ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.12)' } : undefined)}
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
      <ChevronDown className={styles.selectChevron} />
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
