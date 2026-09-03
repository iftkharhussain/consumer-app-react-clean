import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { PageContent } from 'components';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
      document.title = 'Planifier un appel - Norga';
      
      // Save userProductId to localStorage so the confirmation page can find it
      // even if Calendly redirects without it.
      if (userProductId) {
        localStorage.setItem('pending_user_product_id', userProductId);
        console.log('[ScheduleCall] Saved userProductId to localStorage:', userProductId);
      }
      
      initialized.current = true;
    }
  }, [userProductId]);

  // Keep this page pinned to the top. React Router carries the previous page's
  // scroll offset over, and on history-back the browser restores its own saved
  // offset -- both drop the user into the middle of this very tall page.
  // Taking scroll restoration over while we're here covers the "Retour" case
  // without touching the page we return to.
  useEffect(() => {
    const supportsRestoration = 'scrollRestoration' in window.history;
    const previousRestoration = supportsRestoration ? window.history.scrollRestoration : null;

    if (supportsRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    return () => {
      if (!supportsRestoration) return;
      // Hand control back only once the pending navigation has settled -- restoring
      // it synchronously here lets the browser re-apply the old offset on the way out.
      setTimeout(() => {
        window.history.scrollRestoration = previousRestoration;
      }, 1000);
    };
  }, []);

  // Chrome applies its saved scroll offset *after* the history traversal, so a
  // single scrollTo before navigating gets overwritten. Re-assert the top across
  // the next few frames; these callbacks outlive this component on purpose.
  const goBackToTop = () => {
    const toTop = () => window.scrollTo(0, 0);

    toTop();
    navigate(-1);

    requestAnimationFrame(toTop);
    setTimeout(toTop, 0);
    setTimeout(toTop, 120);
    setTimeout(toTop, 300);
  };

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
      if (e.origin !== 'https://calendly.com' || !e.data) return;

      // Calendly swaps steps inside the iframe without a route change, so the
      // page keeps whatever offset it had and the new step renders off-screen.
      if (typeof e.data.event === 'string' && e.data.event.startsWith('calendly.')) {
        window.scrollTo(0, 0);
      }

      // Check if message is from Calendly
      if (e.data.event === 'calendly.event_scheduled') {
        console.log('[ScheduleCall] Event scheduled detected from Calendly postMessage');
        // We set redirected to true to avoid duplicate logic
        if (!redirected.current) {
          redirected.current = true;
          // Note: We are NOT manually navigating here anymore.
          // This allows Calendly to handle its own redirect (as per client instructions),
          // which will pass event details (Date/Time) to the confirmation page.
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
        <button className={styles.backButton} onClick={goBackToTop}>
          <img src="/images/left-arrow.svg" alt="Back" className={styles.backIcon} /> Retour
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
