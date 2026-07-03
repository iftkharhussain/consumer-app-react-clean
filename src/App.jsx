import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ConfigProvider, theme } from "antd";
import { BrowserRouter as Router, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { trackPixelEvent } from './utils/pixel';
import { trackAnalyticsEvent } from './utils/analyticsHelper';
import { PageNotFound } from './components/index';
import { useSelector, useDispatch } from 'react-redux';
import Layout from './pages/layout/index';
import { Navigate } from 'react-router-dom';

import ProfileSkeleton from './pages/skeltons/profileSkeleton';
import SecuritySkeleton from './pages/skeltons/securitySkeleton';

import { useTranslation } from 'react-i18next';

import { authUrl, baseUrl } from './apis/sharedApi';
import { Types, action, setRequest, userAppLocalConfig, setUserAppLocalConfig, getUserAppLocalConfig } from './utils/helper';
import { globalToken, lightToken, darkToken } from './utils/themeConfig';

const LoginForm = React.lazy(() => import('./pages/login/index'));
const Register = React.lazy(() => import('./pages/register/index'));
const LeadLogin = React.lazy(() => import('./pages/leadLogin/index'));
const Overview = React.lazy(() => import('./pages/overview/index'));
const MyAdvisors = React.lazy(() => import('./pages/myAdvisors/index'));
const Messages = React.lazy(() => import('./pages/messages/index'));
const Notifications = React.lazy(() => import('./pages/notifications/index'));
const Settings = React.lazy(() => import('./pages/settings/index'));
const Explore = React.lazy(() => import('./pages/explore/index'));
const BoostSavings = React.lazy(() => import('./pages/boostSavings/index'));
const Results = React.lazy(() => import('./pages/results/index'));
const Profile = React.lazy(() => import('./pages/settings/profile'));
const Security = React.lazy(() => import('./pages/settings/security'));
const ResetPassword = React.lazy(() => import('./pages/resetPassword/index'));
const ForgotPassword = React.lazy(() => import('./pages/forgotPassword/index'));
const QuestionPage = React.lazy(() => import('./pages/question/index'));
const Logout = React.lazy(() => import('./pages/logout/index'));
const OrderProduct = React.lazy(() => import('./pages/product-order'));
const ThankyouAdvisor = React.lazy(() => import('./pages/thankyouAdvisor/index'));
const CallConfirmation = React.lazy(() => import('./pages/callConfirmation/index'));
const FifteenMinutesRedirect = React.lazy(() => import('./pages/fifteenMinutesRedirect/index'));
const ScheduleCall = React.lazy(() => import('./pages/scheduleCall/index'));
const ScheduleConfirmation = React.lazy(() => import('./pages/scheduleConfirmation/index'));
const FallbackNoQuotes = React.lazy(() => import('./pages/fallbackNoQuotes/index'));
const ExploreForm = React.lazy(() => import('./pages/exploreForm/index'));
const Mortgage = React.lazy(() => import('./pages/mortgage/index'));
const Disability = React.lazy(() => import('./pages/disability/index'));
const QuoteLimitExceeded = React.lazy(() => import('./pages/quoteLimitExceeded/index'));
const Advisors = React.lazy(() => import('./pages/myAdvisors/index'));
const CriticalIllness = React.lazy(() => import('./pages/criticalIllness/index'));
const MortgageExpert = React.lazy(() => import('./pages/mortgageExpert/index'));
const QuestionsPage = React.lazy(() => import('./pages/questions/index'));
const ExploreGetQuote = React.lazy(() => import('./pages/exploreGetQuote/index'));

const PrivateWrapper = ({ auth: { isAuthenticated }, heading, _style }) => {
	return isAuthenticated === true ? (
		<Layout _style={_style}>
			<Outlet />
		</Layout>
	) : (
		<Navigate to='/login' />
	);
};

const defaultAppPage = '/';

const PixelTracker = () => {
	const location = useLocation();

	useEffect(() => {
		// Log current location for debugging tracking handover
		console.info('[Tracking] Navigated to:', location.pathname + location.search);

		// Extract event_id and norga_sid from URL if present (from redirect)
		const searchParams = new URLSearchParams(location.search);
		const urlEventId = searchParams.get('event_id');
		const urlNorgaSid = searchParams.get('norga_sid');
		
		if (urlEventId) {
			localStorage.setItem('meta_event_id', urlEventId);
			console.info(' [Pixel] Captured event_id from URL:', urlEventId);
			
			// Push to dataLayer for GTM to capture
			if (window.dataLayer) {
				window.dataLayer.push({
					'event': 'meta_event_id_captured',
					'event_id': urlEventId
				});
			}
		}

		if (urlNorgaSid) {
			localStorage.setItem('norga_sid', urlNorgaSid);
			console.info('[Analytics] Captured norga_sid from URL:', urlNorgaSid);
			
			// Clean URL parameter so users don't see the query string
			try {
				const url = new URL(window.location.href);
				url.searchParams.delete('norga_sid');
				window.history.replaceState({}, document.title, url.pathname + url.search);
			} catch (err) {
				console.error('[Analytics] Failed to sanitize URL:', err);
			}
		}

		const eventId = localStorage.getItem('meta_event_id');
		if (eventId) {
			console.info('[Pixel] Using persistent event_id:', eventId);
		}

		// Track PageView with eventId for deduplication
		trackPixelEvent('PageView', {}, eventId);

		// First-Party Server-Side Analytics funnel tracking
		const norgaSid = localStorage.getItem('norga_sid');
		if (norgaSid) {
			const path = location.pathname;
			// List of views we want to capture on the consumer app
			const isFunnelPage = path === '/result' || path === '/' || path.startsWith('/confirmation');
			
			if (isFunnelPage) {
				const isResult = path === '/result' || path === '/';
				
				fetch(`${baseUrl}/api/analytics/track`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sessionId: norgaSid,
						eventName: isResult ? 'lead_conversion' : 'page_view',
						url: window.location.href,
						path: path,
						metadata: {
							leadId: localStorage.getItem('lead_id') || localStorage.getItem('user_id') || ''
						}
					})
				})
				.then(() => {
					if (isResult) {
						// Keep norga_sid in localStorage so the session persists across the visit.

						// Set a tiny cookie on the root domain (.norga.io) so that Webflow (norga.io)
						// knows to reset its session ID for a brand-new quote.
						// Session cookie (no max-age): lives until the browser/tab is closed.
						try {
							document.cookie = "norga_session_reset=true; path=/; domain=.norga.io";
						} catch (e) {
							console.error('[Analytics] Failed to set session reset cookie:', e);
						}

						console.info('[Analytics] Funnel completed. Session reset flag set for returning visits.');
					}
				})
				.catch(err => console.error('[Analytics] Track hit failed:', err));
			}
		}

		// Track Lead event once per session when the user first lands
		const hasTrackedLead = sessionStorage.getItem('pixel_lead_tracked');
		if (!hasTrackedLead) {
			trackPixelEvent('Lead', {}, eventId);
			sessionStorage.setItem('pixel_lead_tracked', 'true');
		}
	}, [location.pathname, location.search]); // Be more specific about dependency

	// Independent analytics tracing layer (visitor_id_analytics + session_id_analytics).
	// Fires on every route change; fully decoupled from the norga_sid logic above.
	useEffect(() => {
		trackAnalyticsEvent({ eventName: 'page_view' });
	}, [location.pathname]);

	return null;
};

function App(props) {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const initialized = useRef(false);
	const [isAuth, setIsAuth] = useState(null);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [layoutStyles, setLayoutStyles] = useState({});


	// Toggle between light and dark mode
	const toggleTheme = () => {
		setIsDarkMode((prev) => !prev);
	};

	// Define the theme configuration
	const themeConfig = {
		hashed: false,
		algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
		token: {
			...(isDarkMode ? darkToken : lightToken),
			...globalToken,
		},
	};

	// useEffect(() => {
	//   setIsAuth((authEmail || verifyEmail)?true:null)
	// },[authEmail, verifyEmail])

	async function verifyAuth() {
		const authRes = await setRequest(Types.AUTH_VERIFY, {}, authUrl, Types.GET, dispatch);
		setTimeout(async () => {
			if (authRes?.data?.email) {
				setIsAuth(true);
				dispatch(action(Types.AUTH, authRes));
			} else {
				setIsAuth(false);
			}
		}, 500);
	}

	useEffect(() => {
		if (!initialized.current) {
			verifyAuth();
			initialized.current = true;
		}

		// set user default app local settings
		const localConfig = getUserAppLocalConfig();
		if (!localConfig) {
			setUserAppLocalConfig(userAppLocalConfig);
			dispatch(action(Types.USER_LOCAL_CONFIG, userAppLocalConfig));
		} else {
			dispatch(action(Types.USER_LOCAL_CONFIG, localConfig));
		}
	}, []);

	if (typeof isAuth === 'boolean') {
		return (
			<ConfigProvider theme={themeConfig}>
				<Router>
					<PixelTracker />
					<Routes>
						<Route element={<PrivateWrapper auth={{ isAuthenticated: isAuth }} _style={layoutStyles} />}>
							<Route path="/" element={<Suspense fallback={<div></div>}><Results /></Suspense>} />
					<Route path="/my-advisors" element={<Suspense fallback={<div></div>}><MyAdvisors /></Suspense>} />
					<Route path="/explore" element={<Suspense fallback={<div></div>}><Explore /></Suspense>} />
					{/* Internal "quick quote" funnel (logged-in) reached from the Explore page's Get Quote buttons. */}
					<Route path="/explore/getquote/:slug" element={<Suspense fallback={<div></div>}><ExploreGetQuote /></Suspense>} />
					<Route path="/boost-savings" element={<Suspense fallback={<div></div>}><BoostSavings /></Suspense>} />
					<Route path="/question" element={<Suspense fallback={<div></div>}><QuestionPage /></Suspense>} />
							<Route path="/life-insurance" element={<Suspense fallback={<div></div>}><Overview /></Suspense>} />
							<Route path="/result" element={<Suspense fallback={<div></div>}><Results /></Suspense>} />
							<Route path="/result-fallback" element={<Suspense fallback={<div></div>}><FallbackNoQuotes /></Suspense>} />
							<Route path="/result/product-order/:userProductId?" element={<Suspense fallback={<div></div>}><OrderProduct /></Suspense>} />
							<Route path="/confirmation-call/:userProductId?" element={<Suspense fallback={<div></div>}><CallConfirmation /></Suspense>} />
							<Route path="/result-expired/:userProductId?" element={<Suspense fallback={<div></div>}><FifteenMinutesRedirect /></Suspense>} />
							<Route path="/schedule-call/:userProductId?" element={<Suspense fallback={<div></div>}><ScheduleCall /></Suspense>} />
							<Route path="/confirmation-meeting/:userProductId?" element={<Suspense fallback={<div></div>}><ScheduleConfirmation /></Suspense>} />
							<Route path="/explore-form" element={<Suspense fallback={<div></div>}><ExploreForm /></Suspense>} />
							<Route path="/mortgage-insurance" element={<Suspense fallback={<div></div>}><Mortgage /></Suspense>} />
							<Route path="/disability" element={<Suspense fallback={<div></div>}><Disability /></Suspense>} />
							<Route path="/quote-limit-exceeded" element={<Suspense fallback={<div></div>}><QuoteLimitExceeded /></Suspense>} />
							<Route path="/advisors" element={<Suspense fallback={<div></div>}><Advisors /></Suspense>} />
							<Route path="/thankyou-advisor" element={<Suspense fallback={<div></div>}><ThankyouAdvisor /></Suspense>} />
							<Route path="/critical-illness" element={<Suspense fallback={<div></div>}><CriticalIllness /></Suspense>} />
							<Route path="/mortgage" element={<Suspense fallback={<div></div>}><MortgageExpert /></Suspense>} />
							<Route path="/mortgage-renew" element={<Suspense fallback={<div></div>}><MortgageExpert /></Suspense>} />

							<Route path="/question-public" element={<Suspense fallback={<div></div>}><QuestionPage /></Suspense>} />
							<Route path="/logout" element={<Logout />} />
						</Route>
						{/* Messages, Notifications, and Settings routes with no page padding */}
						<Route element={<PrivateWrapper auth={{ isAuthenticated: isAuth }} _style={{ contentPadding: 0 }} />}>
							<Route path="/messages" element={<Suspense fallback={<div></div>}><Messages /></Suspense>} />
							<Route path="/notifications" element={<Suspense fallback={<div></div>}><Notifications /></Suspense>} />
							<Route path="/settings" element={<Suspense fallback={<div></div>}><Settings /></Suspense>} />
						</Route>
						{/* Public routes - no authentication required.
						    All /questions/* funnels share the same Header + Footer chrome
						    (PublicLayout); QuestionsPage maps the slug to its funnel form. */}
						<Route path="/questions/:slug" element={<Suspense fallback={<div></div>}><QuestionsPage /></Suspense>} />
				<Route exact path="/auth/lead-login" element={<Suspense fallback={<div></div>}><LeadLogin /></Suspense>} />
						<Route exact path="/reset-password/:token" element={isAuth ? <Navigate to={defaultAppPage} /> : <ResetPassword />} />
						<Route exact path="/forgot-password" element={isAuth ? <Navigate to={defaultAppPage} /> : <ForgotPassword />} />
						<Route exact path="/login" element={isAuth ? <Navigate to={defaultAppPage} /> : <LoginForm setIsAuth={setIsAuth} {...props} />} />
						<Route exact path="/register" element={isAuth ? <Navigate to={defaultAppPage} /> : <Register setIsAuth={setIsAuth} {...props} />} />
						<Route path="/*" element={<PageNotFound />} />
					</Routes>
				</Router>
			</ConfigProvider>
		);
	}
}

export default App;
