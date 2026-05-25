import toast from 'react-hot-toast'
import React, { useState, useEffect } from 'react'
import { LoginUrl, addPhoneOTPUrl, verifyPhoneOTPUrl, PhoneLoginCompleteUrl } from '../../apis/sharedApi'
import { useDispatch } from 'react-redux'
import { Form, Button, Typography, Input } from 'antd'
import { Types, setRequest } from '../../utils/helper'
import { useTranslation } from 'react-i18next'
import { PhoneInput } from '../../components'
import styles from './Login.module.css'

// Format a raw phone number (e.g. +18194695018) into (819) 469-5018 for display
const formatPhoneForDisplay = (phone) => {
  if (!phone) return phone;
  let digits = phone.replace(/\D/g, '');
  // Strip leading country code '1'
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // fallback to original if unexpected length
};

const { Text } = Typography;

const Login = props => {
  const { t } = useTranslation();
  const [phoneForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = phone input, 2 = OTP input
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0); // Countdown for resend button
  const [showAccountError, setShowAccountError] = useState(false);

  useEffect(() => {
    document.title = 'Connexion - Norga';

    // Disable Mouseflow on login page
    if (window._mfq) {
      window._mfq.push(['stop']);
    }

    return () => {
      // Re-enable Mouseflow when leaving login page
      if (window._mfq) {
        window._mfq.push(['start']);
      }
    };
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const interval = setInterval(() => {
      setResendCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    try {
      await sendOTP(phoneNumber);
      setResendCountdown(60); // Set 60 second countdown
      toast.success(t('codeResent'));
    } catch (error) {
      toast.error(t('codeResendFailed'));
    }
  };

  const onVerifyPhone = async (values) => {
    try {
      const phone = values.phone;

      if (!phone) {
        toast.error(t('phoneNumberRequired'));
        return;
      }

      setLoading(true);
      setPhoneNumber(phone);

      // Step 1: Verify phone exists
      const formData = new URLSearchParams();
      formData.append("phone", phone.toString().trim());

      const phoneLoginUrl = LoginUrl.replace('/login', '/phone-login');
      const verifyRes = await setRequest(Types.AUTH, formData, phoneLoginUrl, Types.POST, dispatch);
      
      if (verifyRes?.success) {
        // Phone verified, user exists, now send OTP
        toast.success(t('phoneVerifiedSendingCode'));
        setShowAccountError(false);

        // Send OTP
        await sendOTP(phone);

        // Move to step 2 (OTP input)
        setStep(2);
      } else {
        setLoading(false);
        
        // Check if this is an "account not found" error
        const msg = verifyRes?.message?.toLowerCase() || '';
        if (msg.includes('compte') || msg.includes('exist') || msg.includes('not found') || msg.includes('register')) {
          setShowAccountError(true);
          // Don't increment attempts — user has no account, not an OTP abuse attempt
        } else {
          // Show backend error message directly
          toast.error(verifyRes?.message || t('phoneLoginFailed'));
        }
        return;
      }
    } catch (error) {
      setLoading(false);
      toast.error(t('phoneLoginFailed'));
    }
  };

  const sendOTP = async (phone) => {
    try {
      setLoading(true);
      const formData = new URLSearchParams();
      formData.append("phoneNumber", phone.toString().trim()); // Backend expects 'phoneNumber'
      formData.append("channel", "sms");
      formData.append("locale", "fr");

      const otpRes = await setRequest(Types.AUTH, formData, addPhoneOTPUrl, Types.POST, dispatch);
      setLoading(false);

      if (otpRes?.success) {
        toast.success(t('codeSentToPhone'));
        setResendCountdown(60); // Set 60 second countdown
      } else {
        toast.error(otpRes?.message || t('codeSendFailed'));
        setStep(1);
      }
    } catch (error) {
      setLoading(false);
      toast.error(t('codeSendFailed'));
      setStep(1);
    }
  };

  const onVerifyOTP = async (values) => {
    try {
      const code = values.code;

      if (!code) {
        toast.error(t('codeRequired'));
        return;
      }

      setLoading(true);
      
      // Step 1: Verify OTP code
      const queryParams = new URLSearchParams({
        otp: code.toString().trim(),
        phoneNumber: phoneNumber.toString().trim(),
        channel: 'sms',
        locale: 'fr'
      });

      const verifyUrl = `${verifyPhoneOTPUrl}?${queryParams.toString()}`;
      const verifyRes = await setRequest(Types.AUTH, null, verifyUrl, Types.GET, dispatch);
      
      if (verifyRes?.success) {
        // OTP verified successfully, now complete login
        toast.success(t('codeVerifiedLoggingIn'));
        
        // Step 2: Complete login
        const loginFormData = new URLSearchParams();
        loginFormData.append("phone", phoneNumber.toString().trim());
        
        const loginRes = await setRequest(Types.AUTH, loginFormData, PhoneLoginCompleteUrl, Types.POST, dispatch);
        
        setLoading(false);
        
        if (loginRes?.success) {
          toast.success(t('loginSuccessful'));
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          return toast.error(loginRes?.message || t('loginFailedSimple'));
        }
      } else {
        setLoading(false);
        return toast.error(verifyRes?.message || t('invalidCode'));
      }
    } catch (error) {
      setLoading(false);
      toast.error(t('verificationFailed'));
    }
  };

  const handleBackToPhone = () => {
    setStep(1);
    otpForm.resetFields();
  };

  return (
    <div className={styles.container}>
      <a href="https://norga.io" className={styles.logoWrapper}>
        <img src="/images/norga-blue-logo.png" alt="Logo" className={styles.logo} />
      </a>
      
      <div className={styles.card}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
            {step === 1 ? t('signInWithPhone') : t('verification')}
          </h2>
          {step === 1 && (
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              {t('phoneLoginSMSTip')}
            </p>
          )}
        </div>

        {/* Step 1: Phone Number Input */}
        {step === 1 && (
          <Form
            form={phoneForm}
            name="phone-login"
            loading={loading}
            className={styles.form}
            onFinish={onVerifyPhone}
            onValuesChange={() => showAccountError && setShowAccountError(false)}
            initialValues={{
              phone: ''
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                {t('phoneNumber')}
              </label>
              <Form.Item 
                name="phone" 
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: t('phoneNumberRequired') },
                ]}
              >
                <PhoneInput />
              </Form.Item>
            </div>

            {showAccountError && (
              <div className={styles.accountErrorBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div className={styles.accountErrorText}>
                  Vous n'avez pas encore de compte. Pour créer un compte, visitez <a href="https://norga.io" target="_blank" rel="noopener noreferrer">norga.io</a> et soumettez votre première demande de devis.
                </div>
              </div>
            )}
            
            <Form.Item style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                loading={loading} 
                htmlType="submit" 
                block 
                className={styles.button}
              > 
                {t('signIn')}
              </Button>
            </Form.Item>
            
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              {t('phoneLoginVerifiedAccountsOnly')}
            </div>
          </Form>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <Form
            form={otpForm}
            name="otp-verify"
            loading={loading}
            className={styles.form}
            onFinish={onVerifyOTP}
            initialValues={{
              code: ''
            }}
          >
            <div style={{ marginBottom: 16, textAlign: 'center', color: '#6b7280' }}>
              <p>{t('codeSentToLabel')} <span style={{ color: '#1a1aba', fontWeight: 600 }}>+1 {formatPhoneForDisplay(phoneNumber)}</span></p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                {t('verificationCode')}
              </label>
              <Form.Item 
                name="code" 
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: t('codeRequired') },
                  { pattern: /^\d{4}$/, message: t('codeMustBe4Digits') }
                ]}
              >
                <Input 
                  placeholder="0000"
                  maxLength={4}
                  className={styles.otpInput}
                />
              </Form.Item>
            </div>
            
            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className={styles.loginButton}
              >
                {t('verifyCode')}
              </Button>
            </Form.Item>

            {/* Resend OTP Section */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              {resendCountdown > 0 ? (
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                  {t('resendCodeIn', { seconds: resendCountdown })}
                </Text>
              ) : (
                <Button 
                  type="link" 
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{ padding: 0, height: 'auto' }}
                >
                  {t('resendCode')}
                </Button>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={handleBackToPhone}
                disabled={loading}
              >
                {t('changeNumber')}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Login