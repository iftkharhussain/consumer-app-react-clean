import toast from 'react-hot-toast'
import React, { useState, useEffect } from 'react'
import { LoginUrl, addPhoneOTPUrl, verifyPhoneOTPUrl, PhoneLoginCompleteUrl } from '../../apis/sharedApi'
import { useDispatch } from 'react-redux'
import { Form, Button, Typography, Input, Alert } from 'antd'
import { Types, setRequest } from '../../utils/helper'
import { useTranslation } from 'react-i18next'
import { PhoneInput } from '../../components'
import styles from './Login.module.css'

const { Text } = Typography;

// Rate limiting constants
const MAX_ATTEMPTS = 4;
const RATE_LIMIT_HOURS = 10;
const RATE_LIMIT_KEY = 'phoneLoginAttempts';
const COOLDOWN_KEY = 'phoneLoginCooldown';

const Login = props => {
  const { t } = useTranslation();
  const [phoneForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = phone input, 2 = OTP input
  const [phoneNumber, setPhoneNumber] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0); // Countdown for resend button

  // Load rate limiting data from localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem(RATE_LIMIT_KEY);
    const savedCooldown = localStorage.getItem(COOLDOWN_KEY);
    
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts, 10));
    }
    
    if (savedCooldown) {
      const cooldownTime = parseInt(savedCooldown, 10);
      if (Date.now() < cooldownTime) {
        setCooldownEnd(cooldownTime);
      } else {
        // Cooldown expired, reset attempts
        localStorage.removeItem(RATE_LIMIT_KEY);
        localStorage.removeItem(COOLDOWN_KEY);
        setAttempts(0);
        setCooldownEnd(null);
      }
    }
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!cooldownEnd) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= cooldownEnd) {
        // Cooldown expired
        localStorage.removeItem(RATE_LIMIT_KEY);
        localStorage.removeItem(COOLDOWN_KEY);
        setAttempts(0);
        setCooldownEnd(null);
        setTimeRemaining('');
      } else {
        // Calculate remaining time
        const diff = cooldownEnd - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const incrementAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem(RATE_LIMIT_KEY, newAttempts.toString());

    if (newAttempts >= MAX_ATTEMPTS) {
      // Set cooldown
      const cooldownTime = Date.now() + (RATE_LIMIT_HOURS * 60 * 60 * 1000);
      setCooldownEnd(cooldownTime);
      localStorage.setItem(COOLDOWN_KEY, cooldownTime.toString());
    }
  };

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
      toast.success('Code renvoyé');
    } catch (error) {
      toast.error('Échec de renvoi du code');
    }
  };

  const onVerifyPhone = async (values) => {
    if (cooldownEnd && Date.now() < cooldownEnd) {
      toast.error(`Trop de tentatives. Veuillez réessayer dans ${timeRemaining}`);
      return;
    }

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
        toast.success('Numéro vérifié! Envoi du code...');
        
        // Send OTP
        await sendOTP(phone);
        
        // Move to step 2 (OTP input)
        setStep(2);
      } else {
        setLoading(false);
        incrementAttempts();
        return toast.error(verifyRes?.message || t('phoneLoginFailed'));
      }
    } catch (error) {
      setLoading(false);
      incrementAttempts();
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
        toast.success('Code envoyé à votre téléphone');
        setResendCountdown(60); // Set 60 second countdown
      } else {
        toast.error(otpRes?.message || 'Échec de l\'envoi du code');
        setStep(1);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Échec de l\'envoi du code');
      setStep(1);
    }
  };

  const onVerifyOTP = async (values) => {
    try {
      const code = values.code;

      if (!code) {
        toast.error('Code requis');
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
        toast.success('Code vérifié! Connexion...');
        
        // Step 2: Complete login
        const loginFormData = new URLSearchParams();
        loginFormData.append("phone", phoneNumber.toString().trim());
        
        const loginRes = await setRequest(Types.AUTH, loginFormData, PhoneLoginCompleteUrl, Types.POST, dispatch);
        
        setLoading(false);
        
        if (loginRes?.success) {
          toast.success('Connexion réussie!');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          incrementAttempts();
          return toast.error(loginRes?.message || 'Échec de connexion');
        }
      } else {
        setLoading(false);
        incrementAttempts();
        return toast.error(verifyRes?.message || 'Code invalide');
      }
    } catch (error) {
      setLoading(false);
      incrementAttempts();
      toast.error('Vérification échouée');
    }
  };

  const handleBackToPhone = () => {
    setStep(1);
    otpForm.resetFields();
  };

  const isBlocked = cooldownEnd && Date.now() < cooldownEnd;
  const attemptsRemaining = MAX_ATTEMPTS - attempts;

  return (
    <div className={styles.container}>
      <img src="/images/norga-blue-logo.png" alt="Logo" className={styles.logo} />
      
      <div className={styles.card}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            {step === 1 ? t('signInWithPhone') : 'Vérification'}
          </h2>
        </div>

        {/* Rate limit warning */}
        {isBlocked && (
          <Alert
            message="Trop de tentatives"
            description={`Vous avez atteint la limite de ${MAX_ATTEMPTS} tentatives. Veuillez réessayer dans ${timeRemaining}.`}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Attempts remaining warning */}
        {!isBlocked && attempts > 0 && attemptsRemaining <= 2 && (
          <Alert
            message={`${attemptsRemaining} tentative${attemptsRemaining > 1 ? 's' : ''} restante${attemptsRemaining > 1 ? 's' : ''}`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Step 1: Phone Number Input */}
        {step === 1 && (
          <Form
            form={phoneForm}
            name="phone-login"
            loading={loading}
            className={styles.form}
            onFinish={onVerifyPhone}
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
            
            <Form.Item style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                loading={loading} 
                htmlType="submit" 
                block 
                className={styles.button}
                disabled={isBlocked}
              > 
                {t('signIn')}
              </Button>
            </Form.Item>
            
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              {t('phoneLoginVerifiedAccountsOnly')}
            </div>
          </Form>
        )}

        {/* Step 2: OTP Input (uncomment when OTP is implemented) */}
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
              <p>Un code a été envoyé au {phoneNumber}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                Code de vérification
              </label>
              <Form.Item 
                name="code" 
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: 'Code requis' },
                  { pattern: /^\d{4}$/, message: 'Le code doit contenir 4 chiffres' }
                ]}
              >
                <Input 
                  placeholder="0000"
                  maxLength={4}
                  style={{ fontSize: '20px', textAlign: 'center', letterSpacing: '8px' }}
                />
              </Form.Item>
            </div>
            
            <Form.Item style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                loading={loading} 
                htmlType="submit" 
                block 
                className={styles.button}
                disabled={isBlocked}
              > 
                Vérifier
              </Button>
            </Form.Item>

            {/* Resend OTP Section */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              {resendCountdown > 0 ? (
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                  Renvoyer le code dans {resendCountdown}s
                </Text>
              ) : (
                <Button 
                  type="link" 
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{ padding: 0, height: 'auto' }}
                >
                  Renvoyer le code
                </Button>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={handleBackToPhone}
                disabled={loading}
              >
                Changer de numéro
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Login