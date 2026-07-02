/**
 * Account / contact step (Étape 3) — shared across every funnel form.
 *
 * By default this is UI-only (the mortgage funnels): "Recevoir un code SMS"
 * advances to the visual OTP screen and "Confirmer" advances to done.
 *
 * When `api` is true (the insurance funnels) it does the real work: sends/
 * verifies the OTP (or submits directly when `otp` is false) and POSTs the lead
 * via `buildPayload`. Extra props (`persons`, `answers`, `selectedPerson`) feed
 * that payload and the "which insured is the account for?" selector.
 */

import React, { useState, useRef } from 'react';
import {
  RightOutlined, LeftOutlined, CheckOutlined,
  MailOutlined, PhoneOutlined, LockOutlined, DownOutlined,
} from '@ant-design/icons';
import { Field, FormGroup, OTPInputs, Input } from './primitives';
import { OTP_LENGTH, normalizePhone, prettyPhone } from './funnelUtils';
import { apiSendOtp, apiVerifyOtp, apiSubmitLead } from './funnelApi';
import { isValidEmail, isValidName } from '../../pages/assuranceVie/formValidation';
import styles from '../../pages/assuranceVie/AssuranceVie.module.css';

export default function ContactTab({
  onBack, collectName = false, backLabel = "Retour à l'étape 2",
  api = false, persons, answers, buildPayload, otp = false, logLabel = 'funnel',
  selectPersonLabel = 'Pour quel assuré créez-vous le compte ?',
}) {
  const [mainView, setMainView] = useState('signup'); // 'signup' | 'login'
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [view, setView] = useState('form'); // 'form' | 'verify' | 'done'
  const [verifyPhone, setVerifyPhone] = useState('');
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [codeError, setCodeError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPersonIdx, setSelectedPersonIdx] = useState(0);
  const codeRefs = useRef([]);

  const hasTwoPersons = !!(persons && persons.length > 1);
  const selectedPerson = (persons && persons[selectedPersonIdx]) || (persons && persons[0]);

  // Submit the lead (api mode) — after OTP verify, or directly when otp is off.
  async function submitLead(phoneOverride) {
    if (mainView === 'login') { setLoading(false); setView('done'); return; }
    try {
      const payload = buildPayload
        ? buildPayload({ email, phone: phoneOverride || verifyPhone, persons, answers, selectedPerson })
        : {};
      const data = await apiSubmitLead(payload);
      if (data?.redirectUrl) { window.location.href = data.redirectUrl; return; }
    } catch (err) {
      // Non-blocking: log and fall through to the confirmation screen.
      // eslint-disable-next-line no-console
      console.error(`[${logLabel}] lead submit failed:`, err);
    }
    setLoading(false);
    setView('done');
  }

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

    // UI-only: just reveal the OTP screen, no SMS sent.
    if (!api) {
      setVerifyPhone(normalized);
      setDigits(Array(OTP_LENGTH).fill(''));
      setView('verify');
      return;
    }

    // API mode.
    setLoading(true);
    if (!otp) {
      // 2-step SMS verification off: submit the lead directly, skipping OTP.
      setVerifyPhone(normalized);
      await submitLead(normalized);
      return;
    }
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
    if (api) apiSendOtp(verifyPhone);
  }

  async function handleConfirm() {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setCodeError(`Veuillez entrer les ${OTP_LENGTH} chiffres.`);
      return;
    }
    setCodeError('');
    // UI-only: any 6-digit code advances to the done screen.
    if (!api) { setView('done'); return; }
    setLoading(true);
    const verifyRes = await apiVerifyOtp(code, verifyPhone);
    if (!verifyRes?.success) {
      setLoading(false);
      setCodeError(verifyRes?.message || 'Code invalide ou expiré.');
      return;
    }
    await submitLead();
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
                <Input type="tel" inputMode="tel" filter="phone" value={tel} onChange={setTel} placeholder="(514) 000-0000" prefix={<PhoneOutlined style={{ fontSize: 14 }} />} />
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
            <LeftOutlined style={{ fontSize: 12 }} /> Retour à l&apos;étape précédente
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
            {collectName && (
              <div className={styles.grid2}>
                <Field label="Nom" error={nom && !isValidName(nom) ? 'Entrez un nom valide' : ''}>
                  <Input value={nom} onChange={setNom} placeholder="Dupont" filter="name" error={!!(nom && !isValidName(nom))} />
                </Field>
                <Field label="Prénom" error={prenom && !isValidName(prenom) ? 'Entrez un prénom valide' : ''}>
                  <Input value={prenom} onChange={setPrenom} placeholder="Marie" filter="name" error={!!(prenom && !isValidName(prenom))} />
                </Field>
              </div>
            )}
            {hasTwoPersons && (
              <Field label={selectPersonLabel}>
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
              <Input type="tel" inputMode="tel" filter="phone" value={tel} onChange={setTel} placeholder="(514) 000-0000" prefix={<PhoneOutlined style={{ fontSize: 14 }} />} />
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
          <LeftOutlined style={{ fontSize: 12 }} /> {backLabel}
        </button>
      </div>
    </div>
  );
}
