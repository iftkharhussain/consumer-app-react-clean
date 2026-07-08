/* eslint-disable */
import React, { useState, useCallback } from 'react';
import { Form, Select, Input, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useOtpResend } from './useOtpResend';
import { getTranslations } from './translations';
import {
  sendOtp,
  verifyOtp,
  isTestPhoneNumber,
  isTestModeEnabled,
  getTestOtpCode,
  sendTestOtp,
  verifyTestOtp
} from './verificationApi';
import { submitFormData } from './formSubmissionApi';
import CustomDropdown from './CustomDropdown';
import styles from './PhoneVerification.module.css';

/**
 * Phone Verification Component
 * 
 * A complete phone/email verification component with OTP functionality.
 */
const PhoneVerification = ({
  language = 'fr',
  initialPhone = '',
  initialEmail = '',
  initialChannel = 'sms',
  onVerificationSuccess,
  onVerificationError,
  onPhoneChange,
  onChannelChange,
  channelOptions,
  submitButtonText,
  showChannelSelector = true,
  testPhoneNumbers
}) => {
  // Redux state
  const reduxState = useSelector(state => state);

  // State
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [channel, setChannel] = useState(initialChannel);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isTestNumber, setIsTestNumber] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedContact, setVerifiedContact] = useState(''); // Store the contact that received OTP
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [submissionError, setSubmissionError] = useState('');

  // Hooks
  const { canResend, countdown, handleResend, reset: resetResend } = useOtpResend();
  const t = getTranslations(language);

  // Default channel options
  const defaultChannelOptions = [
    { value: 'sms', label: t.sms },
    { value: 'voice', label: t.voice }
  ];

  const availableChannels = channelOptions || defaultChannelOptions;

  // Button text — no OTP step anymore, so this submits directly.
  const getButtonText = () => {
    if (isSending) return t.sending;
    if (submitButtonText) return submitButtonText;
    return 'Obtenir ma soumission';
  };

  // Validate phone number
  const isValidPhoneNumber = useCallback((phoneNumber) => {
    if (!phoneNumber) return false;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return cleanPhone.length === 10;
  }, []);

  // Validate email
  const isValidEmail = useCallback((emailAddress) => {
    if (!emailAddress) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddress);
  }, []);

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }
    if (cleanPhone.length === 10) {
      return `+1 (${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }
    return phoneNumber;
  };

  // Format phone for input display: (xxx) xxx-xxxx
  const formatPhoneForInput = (digits) => {
    if (!digits) return '';
    const cleanDigits = digits.replace(/\D/g, '');
    if (cleanDigits.length === 0) return '';
    if (cleanDigits.length <= 3) return `(${cleanDigits}`;
    if (cleanDigits.length <= 6) return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3)}`;
    return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 10)}`;
  };

  // Handle phone input change with masking
  const handlePhoneInputChange = (e) => {
    const inputValue = e.target.value;
    const digits = inputValue.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setError('');
    if (onPhoneChange) onPhoneChange(digits);
  };

  // Handle channel change
  const handleChannelChange = (value) => {
    setChannel(value);
    if (onChannelChange) onChannelChange(value);
  };

  // Two-step SMS verification is REMOVED for the internal funnel — the user is
  // already authenticated, so instead of sending + entering an OTP code we submit
  // the lead directly and go straight to the confirmation/processing screen.
  const handleSendOtp = async () => {
    setError('');
    setIsSending(true);

    try {
      if (channel === 'email') {
        if (!isValidEmail(email)) throw new Error(t.invalidEmail);
      } else {
        if (!isValidPhoneNumber(phone)) throw new Error(t.invalidPhoneNumber);
      }

      const phoneNumber = `1${phone}`;
      const verificationData = { phone: phoneNumber, channel, email, isTestNumber: false, skipped: true };
      if (onVerificationSuccess) onVerificationSuccess(verificationData);
      setIsSending(false);
      await handleFormSubmission(verificationData);
    } catch (err) {
      setError(err.message || t.otpSendFailed);
      if (onVerificationError) onVerificationError(err);
      setIsSending(false);
    }
  };

  // Submit form data and redirect
  const handleFormSubmission = async (verificationData) => {
    setIsSubmitting(true);
    setSubmissionError('');
    try {
      if (!reduxState) throw new Error('No form data found');
      const response = await submitFormData({ reduxState, verification: verificationData });
      console.log('API Response:', response);

      const event_id = response?.event_id;
      
      // Fire Meta Pixel Lead event with eventID for deduplication
      if (window.fbq && event_id) {
        window.fbq('track', 'Lead', {
          content_name: 'Auto Insurance Intake',
          value: 0.00,
          currency: 'CAD'
        }, { eventID: event_id });
        console.log('[Pixel] Lead event fired with event_id:', event_id);
      }

      let targetUrl = response?.redirectUrl || response?.url;
      
      if (targetUrl) {
        // Append event_id to the redirect URL for cross-app continuity
        if (event_id) {
          const separator = targetUrl.includes('?') ? '&' : '?';
          targetUrl = `${targetUrl}${separator}event_id=${event_id}`;
        }

        // Cross-domain analytics handoff: forward the independent tracing IDs
        // (norga.io localStorage -> app.norga.io via URL) so the consumer portal
        // can continue the same analytics session. Legacy norga_sid is untouched.
        //
        // Safety net: if the global Webflow script was blocked (browser extension /
        // cookie restriction) and the IDs are missing or the session has expired,
        // mint fresh ones here so the cross-domain chain never breaks.
        const SESSION_TTL_MS = 30 * 60 * 1000; // 30-min rolling window (matches app + Webflow)
        const genAnalyticsId = () =>
          (window.crypto && typeof window.crypto.randomUUID === 'function')
            ? window.crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
              });

        // visitor id — permanent; create if missing/empty
        let visitorIdAnalytics = localStorage.getItem('visitor_id_analytics');
        if (!visitorIdAnalytics) {
          visitorIdAnalytics = genAnalyticsId();
          localStorage.setItem('visitor_id_analytics', visitorIdAnalytics);
        }

        // session id — rolling 30-min window; create if missing/empty/expired
        let sessionIdAnalytics = localStorage.getItem('session_id_analytics');
        const sessionExpiry = parseInt(localStorage.getItem('session_id_analytics_expiry'), 10);
        if (!sessionIdAnalytics || !sessionExpiry || Date.now() > sessionExpiry) {
          sessionIdAnalytics = genAnalyticsId();
          localStorage.setItem('session_id_analytics', sessionIdAnalytics);
        }
        localStorage.setItem('session_id_analytics_expiry', String(Date.now() + SESSION_TTL_MS));

        // Both IDs are now guaranteed present -> clean URL-encoded append
        const sepV = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${sepV}visitor_id_analytics=${encodeURIComponent(visitorIdAnalytics)}`;
        const sepS = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${sepS}session_id_analytics=${encodeURIComponent(sessionIdAnalytics)}`;

        window.location.href = targetUrl;
      }
    } catch (err) {
      setSubmissionError(err.message || 'Échec de la soumission. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 4) return;
    setError('');
    setIsVerifying(true);
    try {
      let response;
      if (isTestNumber) {
        response = await verifyTestOtp(otp);
      } else {
        response = await verifyOtp({ otp, phoneNumber: verifiedContact, channel, locale: language, email });
      }

      if (response?.success) {
        setVerificationSuccess(true);
        setIsVerifying(false);
        const verificationData = { phone: verifiedContact, channel, email, isTestNumber };
        if (onVerificationSuccess) onVerificationSuccess(verificationData);
        await handleFormSubmission(verificationData);
      } else {
        throw new Error(t.verificationFailed);
      }
    } catch (err) {
      setError(isTestNumber && err.message ? err.message : t.invalidOrExpiredOtp);
      if (onVerificationError) onVerificationError(err);
      setIsVerifying(false);
    }
  };

  // Handle resend
  const handleResendClick = () => {
    setShowOtpInput(false);
    setOtp('');
    setError('');
    setIsTestNumber(false);
    resetResend();
  };

  const globalTestMode = isTestModeEnabled();

  // Render phone/email input screen
  if (!showOtpInput) {
    const isCurrentPhoneTest = globalTestMode || (phone ? isTestPhoneNumber(phone, testPhoneNumbers) : false);
    const isFormValid = channel === 'email' ? isValidEmail(email) : isValidPhoneNumber(phone);

    return (
      <div className={styles.phoneVerification}>


        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconCircle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3FC098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>

          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Dernière étape!</h1>
            <p className={styles.subtitle}>Confirmez vos coordonnées pour obtenir votre soumission</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
            {showChannelSelector && (
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Sélectionnez la méthode de vérification</label>
                <CustomDropdown
                  options={availableChannels.map(opt => ({
                    ...opt,
                    label: opt.label === t.sms ? 'SMS' : opt.label === t.voice ? 'Appel vocal' : opt.label
                  }))}
                  selected={channel}
                  onChange={handleChannelChange}
                  disabled={isSending}
                  placeholder="Sélectionner..."
                />
              </div>
            )}

            {channel !== 'email' ? (
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Numéro de téléphone</label>
                <div className={styles.phoneInputRow}>
                  <div className={styles.phonePrefix}>+1</div>
                  <input
                    type="tel"
                    placeholder="Numéro de téléphone"
                    value={formatPhoneForInput(phone)}
                    onChange={handlePhoneInputChange}
                    disabled={isSending}
                    className={styles.phoneInput}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Courriel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@courriel.com"
                  disabled={isSending}
                  className={styles.emailInput}
                />
              </div>
            )}



            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="submit"
              disabled={!isFormValid || isSending}
              className={styles.submitButton}
            >
              {getButtonText()}
            </button>

            <div className={styles.securityNotice}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3FC098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Vos données sont protégées et sécurisées</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Loading Screen when submitting form
  if (isSubmitting || verificationSuccess) {
    return (
      <div className={styles.phoneVerification}>
        <div className={styles.card}>
          <div className={styles.loadingContainer}>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1A1ABA' }} spin />}
            />
            <p className={styles.loadingTitle}>
              {submissionError ? 'Erreur de soumission' : 'Traitement en cours...'}
            </p>
            <p className={styles.loadingSubtitle}>
              {submissionError || 'Veuillez patienter pendant que nous traitons votre demande.'}
            </p>

            {submissionError && (
              <button
                type="button"
                onClick={() => handleFormSubmission({
                  phone: verifiedContact,
                  channel,
                  email,
                  isTestNumber
                })}
                className={styles.submitButton}
                style={{ marginTop: '24px' }}
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render OTP verification screen
  return (
    <div className={styles.phoneVerification}>
      <div className={styles.card}>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>Entrez le code reçu</h1>
          <p className={styles.subtitle}>Nous devons vérifier que vous n'êtes pas un robot</p>
        </div>

        <p className={styles.phoneNotice}>
          Un code de vérification a été envoyé au <span style={{fontWeight: 'bold', color: '#1A1ABA'}}>{channel === 'email' ? email : formatPhoneNumber(verifiedContact)}</span>
        </p>



        {!canResend ? (
          <p className={styles.resendNotice}>
            Si vous n'avez pas reçu le code, vous pourrez le renvoyer dans <span style={{fontWeight: 600}}>{countdown}</span> secondes
          </p>
        ) : (
          <p className={styles.resendNotice}>
             <span className={styles.resendLink} onClick={handleResendClick}>Renvoyer le code</span>
          </p>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
          <div className={styles.formGroup}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setOtp(value);
              }}
              disabled={isVerifying}
              maxLength={4}
              placeholder="0000"
              className={styles.otpInput}
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            disabled={otp.length !== 4 || isVerifying}
            className={styles.submitButton}
          >
            {isVerifying ? t.verifying : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhoneVerification;
