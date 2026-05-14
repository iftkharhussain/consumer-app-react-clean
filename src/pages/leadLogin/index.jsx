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
import i18n from '../../i18n';
import styles from './LeadLogin.module.css';

const { Title, Paragraph, Text } = Typography;

// Support contact info
const SUPPORT_PHONE = '(450) 558-3553';

// Minimum loading time in milliseconds
const MIN_LOADING_TIME = 8000;

// Status states
const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_TOKEN: 'no_token',
  CREDENTIALS_MISMATCH: 'credentials_mismatch'
};

// Loading steps for new users
const NEW_USER_STEPS = [
  { key: 'verifying', icon: <SafetyOutlined />, text: 'Vérification de vos identifiants...' },
  { key: 'creating', icon: <UserAddOutlined />, text: 'Création de votre compte...' },
  { key: 'settingUp', icon: <RocketOutlined />, text: 'Configuration de votre profil...' },
  { key: 'preparing', icon: <RocketOutlined />, text: 'Préparation de votre tableau de bord...' }
];

// Loading steps for existing users (duplicates)
const EXISTING_USER_STEPS = [
  { key: 'verifying', icon: <SafetyOutlined />, text: 'Vérification de vos identifiants...' },
  { key: 'accountExists', icon: <CheckCircleOutlined />, text: 'Le compte existe déjà' },
  { key: 'credentialsMatched', icon: <SafetyOutlined />, text: 'Identifiants validés avec succès' },
  { key: 'redirecting', icon: <RocketOutlined />, text: 'Redirection vers votre compte...' }
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
  const [credentialsMismatch, setCredentialsMismatch] = useState(null);
  const [submittedCredentials, setSubmittedCredentials] = useState(null);
  const [loadingSteps, setLoadingSteps] = useState(NEW_USER_STEPS);

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
      progressValue += 1;
      if (progressValue <= 95) {
        setProgress(progressValue);
      }

      // Update step every ~2 seconds (based on 4 steps in 8 seconds)
      if (progressValue % 32 === 0 && stepIndex < loadingSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      }
    }, 80); // ~8 seconds to reach 95%
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

   

      // Set user language from response if available
      if (response?.user?.language) {
        const userLanguage = response.user.language;
        if (userLanguage === 'fr' || userLanguage === 'en') {
          // Change i18n language to match user preference
          i18n.changeLanguage(userLanguage);
        }
      }

      // Determine if user is new or existing and set appropriate steps
      const userIsNew = response?.isNewUser;
      if (!userIsNew) {
        // User already exists - switch to existing user steps
        setLoadingSteps(EXISTING_USER_STEPS);
        setCurrentStep(0); // Restart from first step with new steps
      }

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

          // Store resubmit alert flag if user resubmitted with different info
          if (response.showResubmitAlert) {
            localStorage.setItem('showResubmitAlert', 'true');
          }

          setStatus(STATUS.SUCCESS);

          // Redirect after showing success message
          setTimeout(() => {
            let destination = redirectTo === 'app' ? '/' : (response.redirectTo || '/');
            
            // If limit was exceeded during sync, override destination to limit exceeded page
            if (response.limitExceeded) {
              destination = '/quote-limit-exceeded';
            }
            
            navigate(destination, { replace: true });
            // Reload to ensure app state is updated
            window.location.reload();
          }, 2500);

        } else if (response?.requiresManualLogin && response?.credentialsMismatch) {
          // Credentials mismatch - show specific error
          setStatus(STATUS.CREDENTIALS_MISMATCH);
          setCredentialsMismatch(response.credentialsMismatch);
          setSubmittedCredentials(response.submittedCredentials);
          setErrorMessage(response?.message || 'Credentials mismatch');
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
    const currentLoadingStep = loadingSteps[currentStep];
    const isExistingUser = loadingSteps === EXISTING_USER_STEPS;

    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#667eea' }} spin />} />

          <Title level={3} className={styles.title}>
            {isExistingUser
              ? (t('verifyingAccount') || 'Vérification de votre compte')
              : (t('creatingYourAccount') || 'Création de votre compte')
            }
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
            strokeColor="#1a1aba"
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
            {t('noTokenProvided') || 'Aucun jeton d\'authentification'}
          </Title>

          <Paragraph className={styles.description}>
            {t('noTokenProvidedDescription') || 'Aucun jeton d\'authentification n\'a été fourni. Veuillez utiliser le lien de votre soumission de formulaire.'}
          </Paragraph>

          <Button type="primary" size="large" onClick={handleGoToLogin} className={styles.primaryBtn}>
            {t('goToLogin') || 'Aller à la connexion'}
          </Button>

          <div className={styles.support}>
            <Text type="secondary">{t('needHelp') || 'Besoin d\'aide?'} </Text>
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
              ? (t('accountCreated') || 'Compte créé avec succès!')
              : (t('welcomeBack') || 'Bienvenue!')}
          </Title>

          {userData && (
            <Text className={styles.userName}>
              {userData.fullName || userData.email}
            </Text>
          )}

          <Paragraph className={styles.description}>
            {isNewUser
              ? (t('accountReadyRedirecting') || 'Votre compte est prêt. Redirection vers votre tableau de bord...')
              : (t('credentialsValidated') || 'Vos identifiants ont été validés. Redirection vers votre compte...')}
          </Paragraph>

          {!isNewUser && (
            <div className={styles.successBadge}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <Text type="secondary">{t('credentialsMatched') || 'Identifiants validés'}</Text>
            </div>
          )}

          <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#52c41a' }} spin />} />
        </div>
      </div>
    );
  }

  // Credentials mismatch state - requires manual login
  if (status === STATUS.CREDENTIALS_MISMATCH) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <CloseCircleOutlined className={styles.warningIcon} />
          </div>

          <Title level={3} className={styles.title}>
            {t('credentialsMismatch') || 'Vérification du compte requise'}
          </Title>

          <Paragraph className={styles.description}>
            {credentialsMismatch?.phoneMismatch && credentialsMismatch?.emailMismatch ? (
              t('phonEmailMismatchMessage') ||
              'Nous avons constaté que votre numéro de téléphone et votre email sont différents de ceux que nous avons enregistrés. Veuillez vous connecter avec vos identifiants d\'origine.'
            ) : credentialsMismatch?.phoneMismatch ? (
              t('phoneMismatchMessage') ||
              'Nous avons trouvé un numéro de téléphone différent pour votre compte. Veuillez vous connecter avec votre numéro de téléphone d\'origine ou utiliser l\'email et le mot de passe corrects.'
            ) : (
              t('emailMismatchMessage') ||
              'Nous avons trouvé un email différent pour votre compte. Veuillez vous connecter avec votre email et mot de passe d\'origine ou utiliser la vérification par téléphone.'
            )}
          </Paragraph>

          {submittedCredentials && (
            <div className={styles.credentialsInfo}>
              <Text type="secondary" className={styles.credLabel}>
                {t('submittedInfo') || 'Informations que vous avez soumises'}
              </Text>
              {submittedCredentials.phone && (
                <Text className={styles.credValue}>
                  <PhoneOutlined /> {submittedCredentials.phone}
                </Text>
              )}
              {submittedCredentials.email && (
                <Text className={styles.credValue}>
                  {submittedCredentials.email}
                </Text>
              )}
            </div>
          )}

          <Button type="primary" size="large" onClick={handleGoToLogin} className={styles.primaryBtn}>
            {t('goToLogin') || 'Aller à la connexion'}
          </Button>

          <div className={styles.support}>
            <Text type="secondary">{t('needHelp') || 'Besoin d\'aide?'} </Text>
            <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className={styles.phoneLink}>
              <PhoneOutlined /> {SUPPORT_PHONE}
            </a>
          </div>
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
          {t('authenticationFailed') || 'Échec de l\'authentification'}
        </Title>

        <Paragraph className={styles.description}>
          {errorMessage || t('tokenExpiredOrInvalid') || 'Votre lien de connexion a peut-être expiré ou est invalide.'}
        </Paragraph>

        <Text type="secondary" className={styles.helpText}>
          {t('tokenExpiredHelp') || 'Les liens de connexion expirent après 20 minutes pour des raisons de sécurité.'}
        </Text>

        <div className={styles.support}>
          <Text type="secondary">{t('needAssistance') || 'Besoin d\'assistance?'} </Text>
          <a href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`} className={styles.phoneLink}>
            <PhoneOutlined /> {SUPPORT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeadLogin;
