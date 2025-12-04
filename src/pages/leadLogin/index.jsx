/**
 * Lead Login Page
 * 
 * Handles authentication flow when users are redirected from the lead management system
 * with a login token. The page:
 * 1. Extracts the token from URL
 * 2. Validates the token with the backend
 * 3. Creates user session
 * 4. Redirects to the appropriate page in the app
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Result, Typography, Button } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { LeadLoginUrl } from '../../apis/sharedApi';
import { Types, setRequest } from '../../utils/helper';
import { useTranslation } from 'react-i18next';
import styles from './LeadLogin.module.css';

const { Title, Paragraph } = Typography;

// Status states
const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_TOKEN: 'no_token'
};

const LeadLogin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState(STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const start = searchParams.get('start'); // Where to redirect after login
    
    if (!token) {
      setStatus(STATUS.NO_TOKEN);
      return;
    }

    // Validate token and login
    authenticateWithToken(token, start);
  }, [searchParams]);

  const authenticateWithToken = async (token, redirectTo) => {
    try {
      setStatus(STATUS.LOADING);

      // Send token to backend for validation and session creation
      const response = await setRequest(
        Types.AUTH,
        { token },
        LeadLoginUrl,
        Types.POST,
        dispatch
      );

      if (response?.success) {
        setStatus(STATUS.SUCCESS);
        setUserData(response.user);

        // Store session token if returned
        if (response.sessionToken) {
          localStorage.setItem('sessionToken', response.sessionToken);
        }

        // Redirect after a brief success message
        setTimeout(() => {
          const destination = redirectTo === 'app' ? '/dashboard' : (response.redirectTo || '/');
          navigate(destination, { replace: true });
          // Reload to ensure app state is updated
          window.location.reload();
        }, 1500);

      } else {
        setStatus(STATUS.ERROR);
        setErrorMessage(response?.message || t('authenticationFailed') || 'Authentication failed');
      }

    } catch (error) {
      console.error('Lead login error:', error);
      setStatus(STATUS.ERROR);
      setErrorMessage(error?.message || t('authenticationError') || 'An error occurred during authentication');
    }
  };

  const handleRetry = () => {
    const token = searchParams.get('token');
    const start = searchParams.get('start');
    if (token) {
      authenticateWithToken(token, start);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { replace: true });
  };

  // Loading state
  if (status === STATUS.LOADING) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} />
          <Title level={4} style={{ marginTop: 24 }}>
            {t('authenticating') || 'Authenticating...'}
          </Title>
          <Paragraph type="secondary">
            {t('pleaseWait') || 'Please wait while we verify your credentials'}
          </Paragraph>
        </div>
      </div>
    );
  }

  // No token provided
  if (status === STATUS.NO_TOKEN) {
    return (
      <div className={styles.container}>
        <Result
          status="warning"
          title={t('noTokenProvided') || 'No Authentication Token'}
          subTitle={t('noTokenProvidedDescription') || 'No authentication token was provided. Please use the link from your form submission.'}
          extra={[
            <Button type="primary" key="login" onClick={handleGoToLogin}>
              {t('goToLogin') || 'Go to Login'}
            </Button>
          ]}
        />
      </div>
    );
  }

  // Success state
  if (status === STATUS.SUCCESS) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
          <Title level={3} style={{ marginTop: 24, color: '#52c41a' }}>
            {t('welcomeBack') || 'Welcome!'}
          </Title>
          {userData && (
            <Paragraph style={{ fontSize: 16 }}>
              {userData.fullName || userData.email}
            </Paragraph>
          )}
          <Paragraph type="secondary">
            {t('redirectingToDashboard') || 'Redirecting you to your dashboard...'}
          </Paragraph>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className={styles.container}>
      <Result
        status="error"
        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        title={t('authenticationFailed') || 'Authentication Failed'}
        subTitle={errorMessage || t('tokenExpiredOrInvalid') || 'Your login link may have expired or is invalid.'}
        extra={[
          <Button type="primary" key="retry" onClick={handleRetry}>
            {t('tryAgain') || 'Try Again'}
          </Button>,
          <Button key="login" onClick={handleGoToLogin}>
            {t('goToLogin') || 'Go to Login'}
          </Button>
        ]}
      />
    </div>
  );
};

export default LeadLogin;
