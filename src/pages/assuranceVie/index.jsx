/**
 * Assurance Vie — public life-insurance funnel page (route: /assurance-vie)
 *
 * Ported from the Figma "Life insurance - Complete External form" export.
 * Tailwind was intentionally NOT added to this CRA app — the design is
 * reproduced with the co-located CSS Module (AssuranceVie.module.css) plus a
 * few inline styles for dynamic values. Icons come from @ant-design/icons
 * (already a dependency) instead of lucide-react.
 *
 * Real backend wiring (public, no session required):
 *   - Phone OTP send:   POST  {baseUrl}/api/v1/phone/funnel/send-otp   (form-encoded, phoneNumber)
 *   - Phone OTP verify: GET   {baseUrl}/api/v1/phone/funnel/verify-otp?otp=&phoneNumber=
 *   - Lead submit:      POST  funnel submit endpoint (mirrors the proven
 *                       consumer-app-questions contract) -> { redirect: { url } }
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  InfoCircleOutlined,
  CloseOutlined,
  RightOutlined,
  LeftOutlined,
  CheckOutlined,
  MailOutlined,
  PhoneOutlined,
  DownOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { addPhoneOTPUrl, verifyPhoneOTPUrl, baseUrl } from '../../apis/sharedApi';
import logo from '../../logo.svg';
import ImprovedDatePicker from './ImprovedDatePicker';
import { sanitizeName, sanitizeDigits, isValidName, isValidEmail, isValidAmount } from './formValidation';
import styles from './AssuranceVie.module.css';

// ── Config ──────────────────────────────────────────────────────────────────

const OTP_LENGTH = 6; // Twilio Verify codes are 6 digits

// Funnel submit endpoint. Mirrors consumer-app-questions which posts to the LMS
// funnels endpoint (overridable via the window global it also uses, or an env var).
const FUNNEL_SUBMIT_URL =
  (typeof window !== 'undefined' && window.FORM_SUBMISSION_API) ||
  process.env.REACT_APP_FUNNEL_SUBMIT_URL ||
  `${baseUrl}/api/v1/funnels/submit`;

// ── Phone helpers ─────────────────────────────────────────────────────────────

// Normalize a user-entered phone to E.164 (+1XXXXXXXXXX) for the OTP backend.
function normalizePhone(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (raw && raw.trim().startsWith('+')) return `+${digits}`;
  return digits ? `+1${digits}` : '';
}

function prettyPhone(raw) {
  const digits = (raw || '').replace(/\D/g, '').slice(-10);
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw || '';
}

// ── OTP API ───────────────────────────────────────────────────────────────────

async function apiSendOtp(phoneNumber) {
  const body = new URLSearchParams();
  body.append('phoneNumber', phoneNumber);
  body.append('channel', 'sms');
  body.append('locale', 'fr');
  const res = await fetch(addPhoneOTPUrl, { method: 'POST', body });
  return res.json().catch(() => ({ success: false }));
}

async function apiVerifyOtp(code, phoneNumber) {
  const qs = new URLSearchParams({ otp: code, phoneNumber, channel: 'sms', locale: 'fr' });
  const res = await fetch(`${verifyPhoneOTPUrl}?${qs.toString()}`, { method: 'GET' });
  return res.json().catch(() => ({ success: false }));
}

async function apiSubmitLead(payload) {
  const res = await fetch(FUNNEL_SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.redirect?.url) data.redirectUrl = data.redirect.url;
  if (!res.ok) throw new Error(data?.message || 'submit_failed');
  return data;
}

// ── Types / data ──────────────────────────────────────────────────────────────

function createPerson() {
  return {
    id: Math.random().toString(36).slice(2),
    nom: '', prenom: '', dateNaissance: '', age: '',
    useDateNaissance: true, sexe: '', fumeur: 'non', province: 'Québec', montant: '',
  };
}

const PROVINCES = [
  'Québec', 'Ontario', 'Alberta', 'Colombie-Britannique', 'Manitoba',
  'Nouveau-Brunswick', 'Nouvelle-Écosse', 'Saskatchewan',
  'Terre-Neuve-et-Labrador', 'Île-du-Prince-Édouard',
  'Territoires du Nord-Ouest', 'Nunavut', 'Yukon',
].map((p) => ({ value: p, label: p }));

function createStep1() {
  return { reason: '', debtRange: '', mortgage: '', dependents: '' };
}

function suggestAmount(a) {
  let base = 250000;
  if (a.reason === 'revenu') base = 500000;
  else if (a.reason === 'dettes') {
    if (a.debtRange === 'moins-100k') base = 100000;
    else if (a.debtRange === '100k-300k') base = 250000;
    else if (a.debtRange === '300k-500k') base = 400000;
    else if (a.debtRange === 'plus-500k') base = 600000;
  } else if (a.reason === 'funeraires') base = 25000;
  else if (a.reason === 'proches') base = 200000;

  if (a.dependents === '1-2') base += 100000;
  else if (a.dependents === '3plus') base += 200000;

  if (a.reason !== 'dettes') {
    if (a.mortgage === 'moins-200k') base = Math.max(base, 200000);
    else if (a.mortgage === '200k-500k') base = Math.max(base, 500000);
    else if (a.mortgage === 'plus-500k') base = Math.max(base, 600000);
  }
  return base;
}

// ── Info tooltip ──────────────────────────────────────────────────────────────

function InfoTooltip({ content }) {
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

function Input({ value, onChange, placeholder, type = 'text', prefix, suffix, filter, error, inputMode }) {
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

function Select({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <DownOutlined className={styles.selectChevron} style={{ fontSize: 11 }} />
    </div>
  );
}

function DateInput({ value, onChange }) {
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

function PillToggle({ value, onChange, options }) {
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

function BoxSelect({ value, onChange, options }) {
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

function Field({ label, tip, children, error }) {
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

function FormGroup({ children }) {
  return <div className={styles.formGroup}>{children}</div>;
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, enabled }) {
  const tabs = [
    { step: 'Étape 1', label: 'De quelle couverture avez-vous besoin ?' },
    { step: 'Étape 2', label: 'Pour qui est la soumission ?' },
    { step: 'Étape 3', label: 'Crée ton compte Norga' },
  ];
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

// ── Coverage step (step 1) ────────────────────────────────────────────────────

const QUIZ = [
  {
    key: 'reason',
    label: 'Quelle est la principale raison pour laquelle vous cherchez une assurance vie ?',
    options: [
      { value: 'revenu', label: 'Remplacer mon revenu pour ma famille' },
      { value: 'dettes', label: 'Couvrir mes dettes' },
      { value: 'proches', label: 'Laisser quelque chose à mes proches' },
      { value: 'funeraires', label: 'Couvrir les frais funéraires' },
      { value: 'incertain', label: 'Je ne suis pas encore certain' },
    ],
  },
  {
    key: 'debtRange',
    label: 'Quel est le solde approximatif de vos dettes ?',
    columns: 2,
    showIf: (a) => a.reason === 'dettes',
    options: [
      { value: 'moins-100k', label: '< 100 000 $' },
      { value: '100k-300k', label: '100 – 300 k$' },
      { value: '300k-500k', label: '300 – 500 k$' },
      { value: 'plus-500k', label: '> 500 000 $' },
    ],
  },
  {
    key: 'mortgage',
    label: 'Avez-vous une hypothèque ou des dettes importantes ?',
    options: [
      { value: 'non', label: 'Non' },
      { value: 'moins-200k', label: 'Moins de 200 000 $' },
      { value: '200k-500k', label: 'Entre 200 000 $ et 500 000 $' },
      { value: 'plus-500k', label: 'Plus de 500 000 $' },
    ],
    columns: 2,
  },
  {
    key: 'dependents',
    label: 'Des personnes dépendent-elles de votre revenu ?',
    options: [
      { value: 'non', label: 'Non' },
      { value: '1-2', label: 'Oui, 1–2' },
      { value: '3plus', label: 'Oui, 3 ou +' },
    ],
    columns: 2,
  },
];

function CoverageStep({ answers, onChange, onNext }) {
  const sequence = QUIZ.filter((q) => !q.showIf || q.showIf(answers));
  const firstUnanswered = sequence.find((q) => !answers[q.key]);
  const currentKey = firstUnanswered?.key ?? null;
  const answered = sequence.filter((q) => answers[q.key]);
  const isDone = currentKey === null;

  function pick(q, value) {
    const next = { ...answers, [q.key]: value };
    if (q.key === 'reason' && value !== 'dettes') next.debtRange = '';
    onChange(next);
  }

  function editQ(key) {
    const idx = sequence.findIndex((q) => q.key === key);
    const next = { ...answers };
    sequence.slice(idx).forEach((q) => { next[q.key] = ''; });
    onChange(next);
  }

  const currentQ = sequence.find((q) => q.key === currentKey);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={styles.card}>
        {answered.length > 0 && (
          <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column' }}>
            {answered.map((q, i) => {
              const chosen = q.options.find((o) => o.value === answers[q.key]);
              return (
                <div key={q.key} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #f0f2f5' }}>
                  <span style={{ fontSize: 12, color: '#9baab8', display: 'block', marginBottom: 2 }}>{q.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#364152' }}>{chosen?.label}</span>
                    <button type="button" onClick={() => editQ(q.key)} className={styles.linkBtn} style={{ fontSize: 11 }}>
                      Modifier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentQ && (
          <div style={{ padding: answered.length > 0 ? '16px 20px 20px' : '20px', borderTop: answered.length > 0 ? '1px solid #f0f2f5' : 'none' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#121926', letterSpacing: '-0.15px', margin: '0 0 12px' }}>{currentQ.label}</p>
            <div className={currentQ.columns === 2 ? styles.choiceGrid2 : styles.choiceGrid1}>
              {currentQ.options.map((o) => (
                <button key={o.value} type="button" onClick={() => pick(currentQ, o.value)} className={styles.choice}>
                  <span className={styles.choiceDot} />
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isDone && (
          <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #3FC099, #35a882)' }}>
              <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
            </span>
            <span style={{ fontSize: 13, color: '#697586' }}>Vos besoins sont bien définis. Passez à l&apos;étape suivante.</span>
          </div>
        )}
      </div>

      {isDone && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button type="button" onClick={onNext} className={styles.btnPrimary}>
            Suivant <RightOutlined style={{ fontSize: 12 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Person card ───────────────────────────────────────────────────────────────

const FUMEUR_TIP = <span>Inclut cigarettes, vapoteuse, tabac à pipe, cigares, chicha, etc.</span>;
const MONTANT_TIP = <span>Choisissez un montant <strong>au moins équivalent à la somme de vos dettes</strong> (hypothèque, prêts, carte de crédit…)</span>;

function PersonCard({ person, index, onChange, onRemove, canRemove, suggestion }) {
  const set = (f) => (v) => onChange({ ...person, [f]: v });

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f2f5' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#364152', letterSpacing: '-0.1px' }}>
          {index === 0 ? 'Assuré principal' : `Assuré ${index + 1}`}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove} style={{ color: '#c0cad4', background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}>
            <CloseOutlined style={{ fontSize: 13 }} />
          </button>
        )}
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormGroup>
          <div className={styles.grid2}>
            <Field label="Nom" error={person.nom && !isValidName(person.nom) ? 'Entrez un nom valide' : ''}>
              <Input value={person.nom} onChange={set('nom')} placeholder="Dupont" filter="name" error={!!(person.nom && !isValidName(person.nom))} />
            </Field>
            <Field label="Prénom" error={person.prenom && !isValidName(person.prenom) ? 'Entrez un prénom valide' : ''}>
              <Input value={person.prenom} onChange={set('prenom')} placeholder="Marie" filter="name" error={!!(person.prenom && !isValidName(person.prenom))} />
            </Field>
          </div>

          <div className={styles.gridResp2}>
            <Field label="Date de naissance">
              <DateInput value={person.dateNaissance} onChange={set('dateNaissance')} />
            </Field>
            <Field label="Sexe à la naissance">
              <BoxSelect value={person.sexe} onChange={set('sexe')} options={[{ value: 'homme', label: 'Homme' }, { value: 'femme', label: 'Femme' }]} />
            </Field>
          </div>

          <div className={styles.gridResp2}>
            <Field label="Statut de fumeur" tip={FUMEUR_TIP}>
              <PillToggle value={person.fumeur} onChange={set('fumeur')} options={[{ value: 'non', label: 'Non-fumeur' }, { value: 'oui', label: 'Fumeur' }]} />
            </Field>
            <Field label="Province">
              <Select value={person.province} onChange={set('province')} options={PROVINCES} />
            </Field>
          </div>
        </FormGroup>

        <FormGroup>
          {suggestion && (
            <p style={{ fontSize: 12, color: '#697586', lineHeight: 1.6, margin: 0 }}>
              Selon vos réponses, nous vous suggérons une couverture de{' '}
              <strong style={{ color: '#1a1aba' }}>{suggestion.toLocaleString('fr-CA')} $</strong>.
            </p>
          )}
          <Field label="Montant d'assurance souhaité" tip={MONTANT_TIP}>
            <div style={{ width: '100%' }}>
              <Input type="text" inputMode="numeric" value={person.montant} onChange={set('montant')} placeholder="250 000" prefix="$" filter="digits" />
            </div>
          </Field>
        </FormGroup>
      </div>
    </div>
  );
}

// ── OTP inputs ────────────────────────────────────────────────────────────────

function OTPInputs({ digits, codeRefs, codeError, onChange, onKeyDown, onPaste, onResend }) {
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

// ── Contact tab (step 3) + OTP + submit ───────────────────────────────────────

function ContactTab({ persons, step1, onBack }) {
  const hasTwoPersons = persons.length > 1;
  const [selectedPersonIdx, setSelectedPersonIdx] = useState(0);
  const selectedPerson = persons[selectedPersonIdx] ?? persons[0];

  const [mainView, setMainView] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [view, setView] = useState('form'); // 'form' | 'verify' | 'done'
  const [verifyPhone, setVerifyPhone] = useState('');
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const codeRefs = useRef([]);

  async function startVerification(rawPhone) {
    setFormError('');
    if (mainView === 'signup' && !isValidEmail(email)) {
      setFormError('Veuillez entrer une adresse courriel valide.');
      return;
    }
    const normalized = normalizePhone(rawPhone);
    if (normalized.replace(/\D/g, '').length < 11) {
      setFormError('Veuillez entrer un numéro de téléphone valide.');
      return;
    }
    setLoading(true);
    const res = await apiSendOtp(normalized);
    setLoading(false);
    if (res?.success) {
      setVerifyPhone(normalized);
      setDigits(Array(OTP_LENGTH).fill(''));
      setView('verify');
    } else {
      setFormError(res?.message || "Échec de l'envoi du code. Réessayez.");
    }
  }

  function handleDigit(i, val) {
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setCodeError('');
    if (val && i < OTP_LENGTH - 1) codeRefs.current[i + 1]?.focus();
  }
  function handleDigitKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) codeRefs.current[i - 1]?.focus();
  }
  function handlePaste(e) {
    e.preventDefault();
    const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    raw.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    codeRefs.current[Math.min(raw.length, OTP_LENGTH - 1)]?.focus();
  }
  function handleResend() {
    setDigits(Array(OTP_LENGTH).fill(''));
    setCodeError('');
    codeRefs.current[0]?.focus();
    apiSendOtp(verifyPhone);
  }

  function buildPayload() {
    const insured = persons.map((p) => ({
      nom: p.nom,
      prenom: p.prenom,
      dateNaissance: p.dateNaissance,
      sexe: p.sexe,
      fumeur: p.fumeur,
      province: p.province,
      montant: p.montant ? Number(String(p.montant).replace(/\D/g, '')) : null,
    }));
    const event_id = `norga_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const fullName = [selectedPerson?.prenom, selectedPerson?.nom].filter(Boolean).join(' ').trim();
    return {
      event_id,
      product: 'assurance-vie',
      insuranceType: 'life',
      // Contact (root level — mirrors the proven funnels/submit contract)
      phone: verifyPhone,
      email,
      fullName,
      // Life-insurance form data
      insured,
      needs: step1,
      // Consent / verification metadata
      consentChecked: true,
      verification: {
        channel: 'sms',
        verifiedAt: new Date().toISOString(),
        isTestNumber: false,
      },
      submittedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      locale: 'fr',
    };
  }

  async function handleConfirm() {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setCodeError(`Veuillez entrer les ${OTP_LENGTH} chiffres.`);
      return;
    }
    setLoading(true);
    setCodeError('');
    const verifyRes = await apiVerifyOtp(code, verifyPhone);
    if (!verifyRes?.success) {
      setLoading(false);
      setCodeError(verifyRes?.message || 'Code invalide ou expiré.');
      return;
    }

    // Phone verified — submit the lead. The submit may land us logged-in via a
    // cross-app redirect URL; if the funnel endpoint isn't reachable we still
    // show the confirmation so the verified user isn't dead-ended.
    if (mainView === 'login') {
      setLoading(false);
      setView('done');
      return;
    }
    try {
      const data = await apiSubmitLead(buildPayload());
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
    } catch (err) {
      // Non-blocking: log and fall through to the confirmation screen.
      // eslint-disable-next-line no-console
      console.error('[assurance-vie] lead submit failed:', err);
    }
    setLoading(false);
    setView('done');
  }

  // ── Done ──
  if (view === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 24, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,26,186,0.25)', background: 'linear-gradient(135deg, #1a1aba, #2525c5)' }}>
          <CheckOutlined style={{ color: '#fff', fontSize: 26 }} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#121926', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            {mainView === 'login' ? 'Connexion réussie !' : 'Demande envoyée !'}
          </h2>
          <p style={{ fontSize: 14, color: '#535862', lineHeight: 1.6, margin: 0 }}>
            {mainView === 'login'
              ? 'Vous êtes connecté à votre compte Norga. Un conseiller vous contactera sous peu.'
              : <>Un conseiller Norga vous contactera à <strong style={{ color: '#121926' }}>{email || prettyPhone(verifyPhone)}</strong>.</>}
          </p>
        </div>
        <button type="button" onClick={() => window.location.reload()} className={styles.linkBtn} style={{ fontSize: 14 }}>
          Nouvelle soumission
        </button>
      </div>
    );
  }

  // ── Verify (shared by signup + login) ──
  if (view === 'verify') {
    const isLogin = mainView === 'login';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className={styles.card}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f2f5' }}>
            {isLogin
              ? <p style={{ fontSize: 11, fontWeight: 700, color: '#1a1aba', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>Vérification</p>
              : <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1aba', margin: 0 }}>Dernière étape !</p>}
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#121926', margin: '0 0 4px', letterSpacing: '-0.15px' }}>
                {isLogin ? 'Entrez le code de vérification' : 'Vérifiez votre numéro de téléphone'}
              </h3>
              <p style={{ fontSize: 12, color: '#697586', margin: 0 }}>
                Code à {OTP_LENGTH} chiffres envoyé au <strong style={{ color: '#364152' }}>{verifyPhone || 'votre téléphone'}</strong>
              </p>
            </div>
            <OTPInputs
              digits={digits} codeRefs={codeRefs} codeError={codeError}
              onChange={handleDigit} onKeyDown={handleDigitKey} onPaste={handlePaste} onResend={handleResend}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <button type="button" onClick={() => setView('form')} className={styles.btnOutline}>
            <LeftOutlined style={{ fontSize: 12 }} /> Retour
          </button>
          <button type="button" onClick={handleConfirm} disabled={loading} className={styles.btnPrimary}>
            {loading ? <span className={styles.spinner} /> : <>{isLogin ? 'Confirmer' : 'Confirmer mon identité'} <RightOutlined style={{ fontSize: 12 }} /></>}
          </button>
        </div>
      </div>
    );
  }

  // ── Login form ──
  if (mainView === 'login') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className={styles.card}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f2f5' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#121926', letterSpacing: '-0.3px', margin: '0 0 4px' }}>Connexion à votre compte</h2>
            <p style={{ fontSize: 13, color: '#697586', lineHeight: 1.6, margin: 0 }}>
              Entrez votre numéro de téléphone pour recevoir un code de vérification afin de vous connecter.
            </p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#b0bac4' }}>Vous n&apos;avez pas de compte ?</span>
              <button type="button" onClick={() => { setMainView('signup'); setView('form'); setTel(''); setFormError(''); }} className={styles.linkBtn}>
                Créez votre compte
              </button>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <FormGroup>
              <Field label="Numéro de téléphone">
                <Input type="tel" value={tel} onChange={setTel} placeholder="(514) 000-0000" prefix={<PhoneOutlined style={{ fontSize: 14 }} />} />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LockOutlined style={{ color: '#c0cad4', fontSize: 11, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#b0bac4', margin: 0 }}>Vos données sont chiffrées et bien protégées</p>
              </div>
              {formError && <p className={styles.errorText} style={{ textAlign: 'left' }}>{formError}</p>}
            </FormGroup>
            <button type="button" onClick={() => startVerification(tel)} disabled={loading} className={styles.btnGreen} style={{ marginTop: 12 }}>
              {loading ? <span className={styles.spinner} /> : <>Recevoir un code SMS <RightOutlined style={{ fontSize: 16 }} /></>}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button type="button" onClick={onBack} className={styles.btnGhost}>
            <LeftOutlined style={{ fontSize: 12 }} /> Retour à l&apos;étape 1
          </button>
        </div>
      </div>
    );
  }

  // ── Signup form ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={styles.card}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f0f2f5' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#121926', letterSpacing: '-0.3px', margin: '0 0 4px' }}>Créez votre compte Norga</h2>
          <p style={{ fontSize: 13, color: '#697586', lineHeight: 1.6, margin: 0 }}>
            Sauvegardez vos soumissions, suivez vos dossiers et accédez à vos polices en tout temps.
          </p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#b0bac4' }}>Déjà un compte ?</span>
            <button type="button" onClick={() => { setMainView('login'); setView('form'); setTel(''); setFormError(''); }} className={styles.linkBtn}>
              Se connecter
            </button>
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormGroup>
            {hasTwoPersons && (
              <Field label="Pour quel assuré créez-vous le compte ?">
                <div style={{ position: 'relative' }}>
                  <select value={selectedPersonIdx} onChange={(e) => setSelectedPersonIdx(Number(e.target.value))} className={styles.select}>
                    {persons.map((p, i) => (
                      <option key={p.id} value={i}>
                        {p.prenom && p.nom ? `${p.prenom} ${p.nom}` : i === 0 ? 'Assuré principal' : `Assuré ${i + 1}`}
                      </option>
                    ))}
                  </select>
                  <DownOutlined className={styles.selectChevron} style={{ fontSize: 11 }} />
                </div>
              </Field>
            )}
            <Field label="Adresse courriel" error={email && !isValidEmail(email) ? 'Entrez une adresse courriel valide' : ''}>
              <Input type="email" value={email} onChange={setEmail} placeholder="marie@exemple.com" prefix={<MailOutlined style={{ fontSize: 14 }} />} error={!!(email && !isValidEmail(email))} />
            </Field>
            <Field label="Numéro de téléphone">
              <Input type="tel" value={tel} onChange={setTel} placeholder="(514) 000-0000" prefix={<PhoneOutlined style={{ fontSize: 14 }} />} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LockOutlined style={{ color: '#c0cad4', fontSize: 11, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#b0bac4', margin: 0 }}>Vos données sont chiffrées et bien protégées</p>
            </div>
            {formError && <p className={styles.errorText} style={{ textAlign: 'left' }}>{formError}</p>}
          </FormGroup>

          <button type="button" onClick={() => startVerification(tel)} disabled={loading} className={styles.btnGreen}>
            {loading ? <span className={styles.spinner} /> : <>Obtenir mes soumissions <RightOutlined style={{ fontSize: 16 }} /></>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <button type="button" onClick={onBack} className={styles.btnGhost}>
          <LeftOutlined style={{ fontSize: 12 }} /> Retour à l&apos;étape 1
        </button>
      </div>
    </div>
  );
}

// ── Mobile progress + slide ───────────────────────────────────────────────────

function MobProgress({ step }) {
  const labels = ['Couverture', 'Pour qui ?', 'Ton compte'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9baab8' }}>Étape {step} sur 3</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1aba' }}>{labels[step - 1]}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: step >= s ? '100%' : '0%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MobSlide({ children, dir }) {
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

// ── Step completion gating ────────────────────────────────────────────────────

// Step 1: every (currently-visible) coverage question is answered.
function isCoverageComplete(answers) {
  const sequence = QUIZ.filter((q) => !q.showIf || q.showIf(answers));
  return sequence.every((q) => answers[q.key]);
}

// Step 2: every insured has valid identity + a valid amount.
function isPersonsComplete(persons) {
  return persons.every((p) => isValidName(p.nom) && isValidName(p.prenom) && p.dateNaissance && p.sexe && isValidAmount(p.montant));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AssuranceVie() {
  const [tab, setTab] = useState(0);
  const [persons, setPersons] = useState([createPerson()]);
  const [step1, setStep1] = useState(createStep1());

  const updatePerson = (id, u) => setPersons((p) => p.map((x) => (x.id === id ? u : x)));
  const removePerson = (id) => setPersons((p) => p.filter((x) => x.id !== id));

  const suggested = suggestAmount(step1);

  const coverageDone = isCoverageComplete(step1);
  const personsDone = isPersonsComplete(persons);
  const stepEnabled = (i) => (i === 0 ? true : i === 1 ? coverageDone : coverageDone && personsDone);
  const changeTab = (i) => { if (stepEnabled(i)) setTab(i); };

  function goToTab1() {
    setPersons((prev) => prev.map((p) => (p.montant ? p : { ...p, montant: String(suggested) })));
    setTab(1);
  }

  const personsTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {persons.map((p, i) => (
        <PersonCard
          key={p.id} person={p} index={i}
          onChange={(u) => updatePerson(p.id, u)}
          onRemove={() => removePerson(p.id)}
          canRemove={persons.length > 1}
          suggestion={step1.reason ? suggested : undefined}
        />
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <button type="button" onClick={() => setTab(0)} className={styles.btnGhost}>
          <LeftOutlined style={{ fontSize: 12 }} /> Retour
        </button>
        <button type="button" onClick={() => changeTab(2)} disabled={!personsDone} className={styles.btnPrimary}>
          Suivant <RightOutlined style={{ fontSize: 12 }} />
        </button>
      </div>
    </div>
  );

  const stepContent = (
    <>
      {tab === 0 && <CoverageStep answers={step1} onChange={setStep1} onNext={goToTab1} />}
      {tab === 1 && personsTab}
      {tab === 2 && <ContactTab persons={persons} step1={step1} onBack={() => setTab(1)} />}
    </>
  );

  return (
    <div className={styles.root}>
      {/* ═══ DESKTOP ═══ */}
      <div className={styles.desktop}>
        <div className={styles.main}>
          <div className={styles.mainInner}>
            <div style={{ marginBottom: 20 }}>
              <span className={styles.badge}>Assurance vie</span>
              <h1 className={styles.h1}>Soumission instantanée</h1>
            </div>
            <TabBar active={tab} onChange={changeTab} enabled={stepEnabled} />
            {stepContent}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE ═══ */}
      <div className={styles.mobile}>
        <div className={styles.mobHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img src={logo} alt="Norga" style={{ height: 20, objectFit: 'contain' }} />
            <span style={{ fontSize: 10, color: '#b0bac4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Assurance vie</span>
          </div>
          <MobProgress step={tab + 1} />
        </div>

        <div className={styles.mobContent}>
          <MobSlide key={tab} dir={tab === 0 ? 'right' : 'left'}>
            {stepContent}
          </MobSlide>
        </div>

        <div className={styles.mobDots}>
          {[0, 1, 2].map((s) => (
            <div key={s} style={{ width: tab === s ? 20 : 6, height: 6, borderRadius: 999, background: tab === s ? '#1a1aba' : '#d1d5db', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
