import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { PageContent } from 'components';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from './ScheduleCall.module.css';

const ScheduleCall = () => {
  const initialized = useRef(false);
  const calendlyLoaded = useRef(false);
  const redirected = useRef(false);
  const widgetContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userProductId } = location.state || {};
  // Support pre-filling from URL parameters or Redux
  const [searchParams] = useSearchParams();
  const urlName = searchParams.get('name');
  const urlEmail = searchParams.get('email');
  const urlPhone = searchParams.get('phone');

  // Get user info from Redux for pre-filling (fallback)
  const userProfile = useSelector(state => state.app?.user_profile);
  const authUser = useSelector(state => state.app?.auth);

  const userEmail = urlEmail || userProfile?.email || authUser?.email || '';
  const userName = urlName || (userProfile?.firstName 
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : authUser?.firstName 
    ? `${authUser.firstName} ${authUser.lastName || ''}`.trim()
    : (userProfile?.fullName || authUser?.fullName || ''));
  const userPhone = urlPhone || userProfile?.phone || authUser?.phone || '';

  useEffect(() => {
    if (!initialized.current) {
      document.title = 'Planifier un appel - Consumer App';
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    // Load Calendly script dynamically (only once)
    if (!calendlyLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      
      script.onload = () => {
        // Initialize Calendly widget with pre-filled user data
        if (window.Calendly && widgetContainerRef.current) {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/courtika/appel?hide_gdpr_banner=1&primary_color=1a1aba',
            parentElement: widgetContainerRef.current,
            prefill: {
              name: userName,
              email: userEmail,
              phoneNumber: userPhone,
              smsReminderNumber: userPhone
            },
            utm: {}
          });
        }
      };
      
      document.body.appendChild(script);
      calendlyLoaded.current = true;
    }

    // Always register event listener to detect when user schedules a meeting
    const handleCalendlyEvent = (e) => {
      // Check if message is from Calendly
      if (e.origin === 'https://calendly.com' && e.data && e.data.event === 'calendly.event_scheduled') {
        // Redirect to confirmation page with userProductId
        if (!redirected.current) {
          redirected.current = true;
          setTimeout(() => {
            if (userProductId) {
              navigate(`/schedule-confirmation/${userProductId}`);
            } else {
              navigate('/schedule-confirmation');
            }
          }, 300);
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [navigate]);

  return (
    <PageContent pageType="overview">
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeftOutlined className={styles.backIcon} /> Retour
        </button>

        <div className={styles.card}>
          <div 
            ref={widgetContainerRef}
            style={{ width: '100%', height: '1200px' }}
          />
        </div>
      </div>
    </PageContent>
  );
};

export default ScheduleCall;
