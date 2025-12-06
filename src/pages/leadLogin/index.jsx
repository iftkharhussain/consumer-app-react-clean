/**
 * Lead Login Page
 * 
 * Handles authentication flow when users are redirected from the lead management system
 * with a login token. The page:
 * 1. Extracts the token from URL
 * 2. Shows user-friendly loading state (minimum 3 seconds)
 * 3. Validates the token with the backend
 * 4. Creates user session
 * 5. Redirects to the appropriate page in the app
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Typography, Button, Progress } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, PhoneOutlined, UserAddOutlined, SafetyOutlined, RocketOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { LeadLoginUrl } from '../../apis/sharedApi';
import { Types, setRequest } from '../../utils/helper';
import { useTranslation } from 'react-i18next';
import styles from './LeadLogin.module.css';

const { Title, Paragraph, Text } = Typography;

// Support contact info
const SUPPORT_PHONE = '(450) 558-3553';

// Minimum loading time in milliseconds
const MIN_LOADING_TIME = 3000;

// Status states
const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_TOKEN: 'no_token'
};

// Loading steps to show user progress
const LOADING_STEPS = [
  { key: 'verifying', icon: <SafetyOutlined />, text: 'Verifying your credentials...' },
  { key: 'creating', icon: <UserAddOutlined />, text: 'Setting up your account...' },
  { key: 'preparing', icon: <RocketOutlined />, text: 'Preparing your dashboard...' }
];

const LeadLogin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState(STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const loadingStartTime = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const start = searchParams.get('start'); // Where to redirect after login
    
    if (!token) {
      setStatus(STATUS.NO_TOKEN);
      return;
    }

    // Start loading animation
    loadingStartTime.current = Date.now();
    startLoadingAnimation();
    
    // Validate token and login
    authenticateWithToken(token, start);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [searchParams]);

  // Animate loading steps and progress
  const startLoadingAnimation = () => {
    let stepIndex = 0;
    let progressValue = 0;
    
    progressIntervalRef.current = setInterval(() => {
      progressValue += 2;
      if (progressValue <= 95) {
        setProgress(progressValue);
      }
      
      // Update step every ~1 second
      if (progressValue % 30 === 0 && stepIndex < LOADING_STEPS.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      }
    }, 60); // ~3 seconds to reach 95%
  };

  const authenticateWithToken = async (token, redirectTo) => {
    try {
      // Send token to backend for validation and session creation
      // Using JSON.stringify because the backend expects JSON body
      const response = await setRequest(
        Types.AUTH,
        JSON.stringify({ token }),
        LeadLoginUrl,
        Types.POST,
        dispatch
      );

      // Calculate remaining time to ensure minimum loading display
      const elapsedTime = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

      // Wait for minimum loading time before showing result
      setTimeout(() => {
        setProgress(100);
        
        if (response?.success) {
          setIsNewUser(response.isNewUser);
          setUserData(response.user);
          
          // Store session token if returned
          if (response.sessionToken) {
            localStorage.setItem('sessionToken', response.sessionToken);
          }

          setStatus(STATUS.SUCCESS);

          // Redirect after showing success message
          setTimeout(() => {
            const destination = redirectTo === 'app' ? '/' : (response.redirectTo || '/');
            navigate(destination, { replace: true });
            // Reload to ensure app state is updated
            window.location.reload();
          }, 2000);

        } else {
          setStatus(STATUS.ERROR);
          setErrorMessage(response?.message || t('authenticationFailed') || 'Authentication failed');
        }
      }, remainingTime);

    } catch (error) {
      console.error('Lead login error:', error);
      const elapsedTime = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
      
      setTimeout(() => {
        setProgress(100);
        setStatus(STATUS.ERROR);
        setErrorMessage(error?.message || t('authenticationError') || 'An error occurred during authentication');
      }, remainingTime);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Loading state with animated steps
  if (status === STATUS.LOADING) {
    const currentLoadingStep = LOADING_STEPS[currentStep];
    
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#667eea' }} spin />} />
          
          <Title level={3} className={styles.title}>
            {t('creatingYourAccount') || 'Creating Your Account'}
          </Title>
          
          <div className={styles.stepText}>
            {currentLoadingStep.icon}
            <Text className={styles.stepLabel}>
              {t(currentLoadingStep.key) || currentLoadingStep.text}
            </Text>
          </div>
          
          <Progress 
            percent={progress} 
            showInfo={false}
            strokeColor="#667eea"
            trailColor="#e8e8e8"
            className={styles.progressBar}
          />
        </div>
      </div>
    );
  }

  // No token provided
  if (status === STATUS.NO_TOKEN) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <CloseCircleOutlined className={styles.warningIcon} />
          </div>
          
          <Title level={3} className={styles.title}>
            {t('noTokenProvided') || 'No Authentication Token'}
          </Title>
          
          <Paragraph className={styles.description}>
            {t('noTokenProvidedDescription') || 'No authentication token was provided. Please use the link from your form submission.'}
          </Paragraph>
          
          <Button type="primary" size="large" onClick={handleGoToLogin} className={styles.primaryBtn}>
            {t('goToLogin') || 'Go to Login'}
          </Button>
          
          <div className={styles.support}>
            <Text type="secondary">{t('needHelp') || 'Need help?'} </Text>
            <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className={styles.phoneLink}>
              <PhoneOutlined /> {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === STATUS.SUCCESS) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <CheckCircleOutlined className={styles.successIcon} />
          </div>
          
          <Title level={3} className={styles.successTitle}>
            {isNewUser 
              ? (t('accountCreated') || 'Account Created!') 
              : (t('welcomeBack') || 'Welcome Back!')}
          </Title>
          
          {userData && (
            <Text className={styles.userName}>
              {userData.fullName || userData.email}
            </Text>
          )}
          
          <Paragraph className={styles.description}>
            {isNewUser 
              ? (t('accountReadyRedirecting') || 'Your account is ready. Redirecting you now...') 
              : (t('redirectingToDashboard') || 'Redirecting you to your dashboard...')}
          </Paragraph>
          
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#52c41a' }} spin />} />
        </div>
      </div>
    );
  }

  // Error state - with contact information
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <CloseCircleOutlined className={styles.errorIcon} />
        </div>
        
        <Title level={3} className={styles.errorTitle}>
          {t('authenticationFailed') || 'Authentication Failed'}
        </Title>
        
        <Paragraph className={styles.description}>
          {errorMessage || t('tokenExpiredOrInvalid') || 'Your login link may have expired or is invalid.'}
        </Paragraph>
        
        <Text type="secondary" className={styles.helpText}>
          {t('tokenExpiredHelp') || 'Login links expire after 10 minutes for security.'}
        </Text>
        
        <div className={styles.support}>
          <Text type="secondary">{t('needAssistance') || 'Need assistance?'} </Text>
          <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className={styles.phoneLink}>
            <PhoneOutlined /> {SUPPORT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeadLogin;
