import React, { useEffect, useRef } from 'react';
import { PageContent } from 'components';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import styles from './ScheduleCall.module.css';

const ScheduleCall = () => {
  const initialized = useRef(false);
  const calendlyLoaded = useRef(false);
  const redirected = useRef(false);
  const widgetContainerRef = useRef(null);
  const navigate = useNavigate();

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
        // Initialize Calendly widget using JavaScript API for better event handling
        if (window.Calendly && widgetContainerRef.current) {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/courtika/appel?hide_gdpr_banner=1&primary_color=1a1aba',
            parentElement: widgetContainerRef.current,
            prefill: {},
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
        // Redirect to confirmation page
        if (!redirected.current) {
          redirected.current = true;
          setTimeout(() => {
            navigate('/schedule-confirmation');
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
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </div>
    </PageContent>
  );
};

export default ScheduleCall;
