import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ConfigProvider, theme } from "antd";
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { PageNotFound } from './components/index';
import { useSelector, useDispatch } from 'react-redux';
import Layout from './pages/layout/index';
import { Navigate } from 'react-router-dom';

import ProfileSkeleton from './pages/skeltons/profileSkeleton';
import SecuritySkeleton from './pages/skeltons/securitySkeleton';

import { useTranslation } from 'react-i18next';

import { authUrl } from './apis/sharedApi';
import { Types, action, setRequest, userAppLocalConfig, setUserAppLocalConfig, getUserAppLocalConfig } from './utils/helper';
import { globalToken, lightToken, darkToken } from './utils/themeConfig';

const LoginForm = React.lazy(() => import('./pages/login/index'));
const Overview = React.lazy(() => import('./pages/overview/index'));
const MyAdvisors = React.lazy(() => import('./pages/myAdvisors/index'));
const Messages = React.lazy(() => import('./pages/messages/index'));
const Notifications = React.lazy(() => import('./pages/notifications/index'));
const Settings = React.lazy(() => import('./pages/settings/index'));
const Explore = React.lazy(() => import('./pages/explore/index'));
const BoostSavings = React.lazy(() => import('./pages/boostSavings/index'));
const CarInsurance = React.lazy(() => import('./pages/carInsurance/index'));
const Profile = React.lazy(() => import('./pages/settings/profile'));
const Security = React.lazy(() => import('./pages/settings/security'));
const ResetPassword = React.lazy(() => import('./pages/resetPassword/index'));
const ForgotPassword = React.lazy(() => import('./pages/forgotPassword/index'));
const QuestionPage = React.lazy(() => import('./pages/question/index'));
const Logout = React.lazy(() => import('./pages/logout/index'));
const PrivateWrapper = ({ auth: { isAuthenticated }, heading, _style }) => {
	return isAuthenticated === false ? (
		<Layout _style={_style}>
			<Outlet />
		</Layout>
	) : (
		<Navigate to='/login' />
	);
};

const defaultAppPage = '/';

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
					<Routes>
						<Route element={<PrivateWrapper auth={{ isAuthenticated: isAuth }} _style={layoutStyles} />}>
							<Route path="/" element={<Suspense fallback={<div>Loading...</div>}><CarInsurance /></Suspense>} />
							<Route path="/overview" element={<Suspense fallback={<div>Loading...</div>}><Overview /></Suspense>} />
							<Route path="/my-advisors" element={<Suspense fallback={<div>Loading...</div>}><MyAdvisors /></Suspense>} />
							<Route path="/explore" element={<Suspense fallback={<div>Loading...</div>}><Explore /></Suspense>} />
							<Route path="/boost-savings" element={<Suspense fallback={<div>Loading...</div>}><BoostSavings /></Suspense>} />
							<Route path="/car-insurance" element={<Suspense fallback={<div>Loading...</div>}><CarInsurance /></Suspense>} />
							<Route path="/question" element={<Suspense fallback={<div>Loading...</div>}><QuestionPage /></Suspense>} />
						</Route>
						{/* Messages, Notifications, and Settings routes with no page padding */}
						<Route element={<PrivateWrapper auth={{ isAuthenticated: isAuth }} _style={{ contentPadding: 0 }} />}>
							<Route path="/messages" element={<Suspense fallback={<div>Loading...</div>}><Messages /></Suspense>} />
							<Route path="/notifications" element={<Suspense fallback={<div>Loading...</div>}><Notifications /></Suspense>} />
							<Route path="/settings" element={<Suspense fallback={<div>Loading...</div>}><Settings /></Suspense>} />
						</Route>
						<Route exact path="/logout" element={<Logout />} />
						<Route exact path="/question-public" element={<Suspense fallback={<div>Loading...</div>}><QuestionPage /></Suspense>} />
						<Route exact path="/reset-password/:token" element={isAuth ? <Navigate to={defaultAppPage} /> : <ResetPassword />} />
						<Route exact path="/forgot-password" element={isAuth ? <Navigate to={defaultAppPage} /> : <ForgotPassword />} />
						<Route exact path="/login" element={isAuth ? <Navigate to={defaultAppPage} /> : <LoginForm setIsAuth={setIsAuth} {...props} />} />
						<Route path="/*" element={<PageNotFound />} />
					</Routes>
				</Router>
			</ConfigProvider>
		);
	}
}

export default App;
