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
import { CheckOutlined } from '@ant-design/icons';
import { Field, FormGroup, OTPInputs, Input, ChevronRight, ChevronLeft, ChevronDown } from './primitives';
import { OTP_LENGTH, normalizePhone, prettyPhone } from './funnelUtils';
import { apiSendOtp, apiVerifyOtp, apiSubmitLead } from './funnelApi';
import { isValidEmail, isValidName } from '../../pages/assuranceVie/formValidation';
import styles from './funnel.module.css';

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
              <h3 style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 14, fontStyle: 'normal', fontWeight: 600, lineHeight: '20px', letterSpacing: '-0.15px', color: '#121926', margin: '0 0 4px' }}>
                {isLogin ? 'Entrez le code de vérification' : 'Vérifiez votre numéro de téléphone'}
              </h3>
              <p style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 12, fontStyle: 'normal', fontWeight: 400, lineHeight: '16px', color: '#697586', margin: 0 }}>
                Code à {OTP_LENGTH} chiffres envoyé au <strong style={{ fontFamily: 'Inter', fontSize: 12, fontStyle: 'normal', fontWeight: 700, lineHeight: '16px', color: '#364152' }}>{verifyPhone || 'votre téléphone'}</strong>
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
            <ChevronLeft /> Retour
          </button>
          <button type="button" onClick={handleConfirm} disabled={loading} className={styles.btnPrimary}>
            {loading ? <span className={styles.spinner} /> : <>{isLogin ? 'Confirmer' : 'Confirmer mon identité'} <ChevronRight /></>}
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
            <h2 style={{ fontFamily: 'Inter', fontSize: 16, fontStyle: 'normal', fontWeight: 700, lineHeight: '24px', color: '#121926', letterSpacing: '-0.3px', margin: '0 0 4px' }}>Connexion à votre compte</h2>
            <p style={{ fontSize: 13, color: '#697586', lineHeight: 1.6, margin: 0 }}>
              Entrez votre numéro de téléphone pour recevoir un code de vérification afin de vous connecter.
            </p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 12, fontStyle: 'normal', fontWeight: 400, lineHeight: '18px', color: '#b0bac4' }}>Vous n&apos;avez pas de compte ?</span>
              <button type="button" onClick={() => { setMainView('signup'); setView('form'); setTel(''); setFormError(''); }} className={styles.linkBtn}>
                Créez votre compte
              </button>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <FormGroup>
              <Field label="Numéro de téléphone">
                <Input type="tel" inputMode="tel" filter="phone" value={tel} onChange={setTel} placeholder="(514) 000-0000" prefix={(
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <g clipPath="url(#clip0_93_2920)">
                    <path d="M12.8333 9.86989V11.6199C12.834 11.7824 12.8007 11.9432 12.7356 12.092C12.6705 12.2409 12.5751 12.3745 12.4554 12.4843C12.3357 12.5941 12.1943 12.6778 12.0404 12.7298C11.8865 12.7819 11.7235 12.8012 11.5617 12.7866C9.76665 12.5915 8.04242 11.9781 6.5275 10.9957C5.11807 10.1001 3.92311 8.90516 3.0275 7.49573C2.04166 5.97393 1.42814 4.24131 1.23667 2.43823C1.22209 2.27692 1.24126 2.11434 1.29296 1.96084C1.34466 1.80735 1.42775 1.6663 1.53695 1.54667C1.64615 1.42705 1.77905 1.33147 1.92721 1.26603C2.07537 1.20059 2.23553 1.16671 2.3975 1.16656H4.1475C4.4306 1.16377 4.70505 1.26402 4.9197 1.44862C5.13434 1.63322 5.27455 1.88957 5.31417 2.16989C5.38803 2.72993 5.52501 3.27982 5.7225 3.80906C5.80099 4.01785 5.81797 4.24476 5.77145 4.46291C5.72492 4.68105 5.61684 4.88129 5.46 5.03989L4.71917 5.78073C5.54958 7.24113 6.75877 8.45032 8.21917 9.28073L8.96 8.53989C9.1186 8.38306 9.31884 8.27497 9.53699 8.22845C9.75513 8.18192 9.98205 8.19891 10.1908 8.27739C10.7201 8.47488 11.27 8.61186 11.83 8.68573C12.1134 8.7257 12.3722 8.86843 12.5571 9.08677C12.7421 9.3051 12.8404 9.58381 12.8333 9.86989Z" stroke="#9BAAB8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_93_2920">
                      <rect width="14" height="14" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              )} />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0 }}>
                <g clipPath="url(#clip0_93_2923)">
                  <path d="M8.70833 5.04175H2.29167C1.78541 5.04175 1.375 5.45215 1.375 5.95841V9.16675C1.375 9.67301 1.78541 10.0834 2.29167 10.0834H8.70833C9.21459 10.0834 9.625 9.67301 9.625 9.16675V5.95841C9.625 5.45215 9.21459 5.04175 8.70833 5.04175Z" stroke="#C0CAD4" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.20837 5.04175V3.20841C3.20837 2.60063 3.44982 2.01773 3.87959 1.58796C4.30936 1.15819 4.89225 0.916748 5.50004 0.916748C6.10783 0.916748 6.69072 1.15819 7.12049 1.58796C7.55026 2.01773 7.79171 2.60063 7.79171 3.20841V5.04175" stroke="#C0CAD4" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_93_2923">
                    <rect width="11" height="11" fill="white" />
                  </clipPath>
                </defs>
              </svg>
                <p style={{ fontSize: 12, color: '#b0bac4', margin: 0 }}>Vos données sont chiffrées et bien protégées</p>
              </div>
              {formError && <p className={styles.errorText} style={{ textAlign: 'left' }}>{formError}</p>}
            </FormGroup>
            <button type="button" onClick={() => startVerification(tel)} disabled={loading} className={styles.btnGreen} style={{ marginTop: 12 }}>
              {loading ? <span className={styles.spinner} /> : <>Recevoir un code SMS <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button type="button" onClick={onBack} className={styles.btnGhost}>
            <ChevronLeft /> Retour à l&apos;étape précédente
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
          <h2 style={{ fontFamily: 'Inter', fontSize: 16, fontStyle: 'normal', fontWeight: 700, lineHeight: '24px', color: '#121926', letterSpacing: '-0.3px', margin: '0 0 4px' }}>Créez votre compte Norga</h2>
          <p style={{ fontFamily: 'Inter', fontSize: 13, fontStyle: 'normal', fontWeight: 400, lineHeight: '21.125px', color: '#697586', margin: 0 }}>
            Sauvegardez vos soumissions, suivez vos dossiers et accédez à vos polices en tout temps.
          </p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 12, fontStyle: 'normal', fontWeight: 400, lineHeight: '18px', color: '#b0bac4' }}>Déjà un compte ?</span>
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
                  <ChevronDown className={styles.selectChevron} />
                </div>
              </Field>
            )}
            <Field label="Adresse courriel" error={email && !isValidEmail(email) ? 'Entrez une adresse courriel valide' : ''}>
              <Input type="email" value={email} onChange={setEmail} placeholder="marie@exemple.com" prefix={(
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.6666 2.33325H2.33329C1.68896 2.33325 1.16663 2.85559 1.16663 3.49992V10.4999C1.16663 11.1443 1.68896 11.6666 2.33329 11.6666H11.6666C12.311 11.6666 12.8333 11.1443 12.8333 10.4999V3.49992C12.8333 2.85559 12.311 2.33325 11.6666 2.33325Z" stroke="#9BAAB8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.8333 4.08325L7.60079 7.40825C7.4207 7.52108 7.21248 7.58092 6.99996 7.58092C6.78744 7.58092 6.57922 7.52108 6.39913 7.40825L1.16663 4.08325" stroke="#9BAAB8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )} error={!!(email && !isValidEmail(email))} />
            </Field>
            <Field label="Numéro de téléphone">
              <Input type="tel" inputMode="tel" filter="phone" value={tel} onChange={setTel} placeholder="(514) 000-0000" prefix={(
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <g clipPath="url(#clip0_93_2920)">
                    <path d="M12.8333 9.86989V11.6199C12.834 11.7824 12.8007 11.9432 12.7356 12.092C12.6705 12.2409 12.5751 12.3745 12.4554 12.4843C12.3357 12.5941 12.1943 12.6778 12.0404 12.7298C11.8865 12.7819 11.7235 12.8012 11.5617 12.7866C9.76665 12.5915 8.04242 11.9781 6.5275 10.9957C5.11807 10.1001 3.92311 8.90516 3.0275 7.49573C2.04166 5.97393 1.42814 4.24131 1.23667 2.43823C1.22209 2.27692 1.24126 2.11434 1.29296 1.96084C1.34466 1.80735 1.42775 1.6663 1.53695 1.54667C1.64615 1.42705 1.77905 1.33147 1.92721 1.26603C2.07537 1.20059 2.23553 1.16671 2.3975 1.16656H4.1475C4.4306 1.16377 4.70505 1.26402 4.9197 1.44862C5.13434 1.63322 5.27455 1.88957 5.31417 2.16989C5.38803 2.72993 5.52501 3.27982 5.7225 3.80906C5.80099 4.01785 5.81797 4.24476 5.77145 4.46291C5.72492 4.68105 5.61684 4.88129 5.46 5.03989L4.71917 5.78073C5.54958 7.24113 6.75877 8.45032 8.21917 9.28073L8.96 8.53989C9.1186 8.38306 9.31884 8.27497 9.53699 8.22845C9.75513 8.18192 9.98205 8.19891 10.1908 8.27739C10.7201 8.47488 11.27 8.61186 11.83 8.68573C12.1134 8.7257 12.3722 8.86843 12.5571 9.08677C12.7421 9.3051 12.8404 9.58381 12.8333 9.86989Z" stroke="#9BAAB8" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_93_2920">
                      <rect width="14" height="14" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              )} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0 }}>
                <g clipPath="url(#clip0_93_2923)">
                  <path d="M8.70833 5.04175H2.29167C1.78541 5.04175 1.375 5.45215 1.375 5.95841V9.16675C1.375 9.67301 1.78541 10.0834 2.29167 10.0834H8.70833C9.21459 10.0834 9.625 9.67301 9.625 9.16675V5.95841C9.625 5.45215 9.21459 5.04175 8.70833 5.04175Z" stroke="#C0CAD4" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.20837 5.04175V3.20841C3.20837 2.60063 3.44982 2.01773 3.87959 1.58796C4.30936 1.15819 4.89225 0.916748 5.50004 0.916748C6.10783 0.916748 6.69072 1.15819 7.12049 1.58796C7.55026 2.01773 7.79171 2.60063 7.79171 3.20841V5.04175" stroke="#C0CAD4" strokeWidth="0.916667" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_93_2923">
                    <rect width="11" height="11" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <p style={{ fontSize: 12, color: '#b0bac4', margin: 0 }}>Vos données sont chiffrées et bien protégées</p>
            </div>
            {formError && <p className={styles.errorText} style={{ textAlign: 'left' }}>{formError}</p>}
          </FormGroup>

          <button type="button" onClick={() => startVerification(tel)} disabled={loading} className={styles.btnGreen}>
            {loading ? <span className={styles.spinner} /> : <>Obtenir mes soumissions <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <button type="button" onClick={onBack} className={styles.btnGhost}>
          <ChevronLeft /> {backLabel}
        </button>
      </div>
    </div>
  );
}
