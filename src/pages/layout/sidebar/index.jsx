import { useTranslation } from 'react-i18next';
import { Layout, Menu, Tag, Input, Dropdown, Space, Popover } from 'antd';
import { InfoCircle, LayersThree01, Users01, CheckDone01, CurrencyDollarCircle, Flash, LifeBuoy01, Settings01, Bell01, ChevronLeftDouble, File04, Home01, ImageUser, MessageChatSquare, FileSearch02, Cube01, Target01, Car01, LogOut01, XClose, User01, Shield01, Mail01 } from "utils/icons";
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUrl, serverUrl, getQuoteSessionsUrl, activateQuoteSessionUrl } from '../../../apis/sharedApi';
import styles from './Sidebar.module.css';
import Button from '../../../components/button';
import ProgressCard from '../../../components/progressCard';

import { userAppLocalConfig, setUserAppLocalConfig, getUserAppLocalConfig, action, Types, setRequest } from '../../../utils/helper';
import toast from 'react-hot-toast';

const { Sider } = Layout;

const Sidebar = ({ collapsed: propsCollapsed, setCollapsed: propsSetCollapsed, onMobileClose, children }) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const localSettings = getUserAppLocalConfig();
	const [logoutLoading, setLogoutLoading] = useState(false);
	const [collapsed, setCollapsed] = useState(propsCollapsed);
	const [adminMenuItems, setAdminMenuItems] = useState([]);
	const [showProgressSection, setShowProgressSection] = useState(true); // Control progress section visibility
	const [quoteSessions, setQuoteSessions] = useState([]); // Quote sessions for multiple quotes
	const [loadingSessions, setLoadingSessions] = useState(false);
	const { firstName, lastName, email, type: userType, superAdmin, profilePic } = useSelector((state) => state.app.user_profile);
	const [isGetQuoteModalOpen, setIsGetQuoteModalOpen] = useState(false);
	const { sidebar } = useSelector(
		(state) => state.app.user_local_config,
	);
	const { leadDefaultPath, sidebarBehavior } = useSelector((state) => state.app.user_local_config);

	const [sideMenu, setSideMenu] = useState();
	const [openKeys, setOpenKeys] = useState([]);
	const hasAutoOpened = React.useRef(false);
	
	// Fetch quote sessions on mount
	useEffect(() => {
		fetchQuoteSessions();
	}, []);
	
	// Fetch quote sessions from API
	const fetchQuoteSessions = async () => {
		try {
			setLoadingSessions(true);
			console.log('🔍 [SIDEBAR] Fetching quote sessions...');
			const response = await setRequest(Types.USER, {}, getQuoteSessionsUrl, Types.GET, dispatch);
			
			console.log('🔍 [SIDEBAR] API response:', response);
			
			if (response?.success && response?.sessions) {
				setQuoteSessions(response.sessions);
				console.log('✅ [SIDEBAR] Quote sessions loaded:', response.sessions.length, response.sessions);
				
				// Debug: Check what's in each session's label
				response.sessions.forEach((session, i) => {
					console.log(`  Session ${i + 1}:`, {
						sessionId: session.sessionId,
						labelPrimary: session.label?.primary,
						labelSecondary: session.label?.secondary,
						isActive: session.isActive
					});
				});
			} else {
				console.warn('⚠️ [SIDEBAR] No sessions in response:', response);
			}
		} catch (error) {
			console.error('❌ [SIDEBAR] Error fetching quote sessions:', error);
		} finally {
			setLoadingSessions(false);
		}
	};
	
	// Handle quote session switch
	const handleSessionSwitch = async (sessionId) => {
		try {
			const response = await setRequest(
				Types.USER, 
				{}, 
				activateQuoteSessionUrl(sessionId), 
				Types.PUT, 
				dispatch
			);
			
			if (response?.success) {
				toast.success('Session de soumission activée');
				// Refresh sessions
				await fetchQuoteSessions();
				// Redirect to home to show new quote data and leave limit page if necessary
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Error switching session:', error);
			toast.error('Erreur lors du changement de session');
		}
	};

	// Helper function to create menu labels with badges
	const createMenuLabel = (label, badgeCount = null) => {
		if (badgeCount) {
			return (
				<>
					<span>{label}</span>
					<span className={styles.menuItemBadge}>{badgeCount}</span>
				</>
			);
		}
		return label;
	};

	async function handleLogout() {
		try {
			setLogoutLoading(true)
			const response = await setRequest(Types.LOGOUT, {}, logoutUrl, Types.POST, dispatch)
			if (response?.success) {
				toast.success(t('logoutSucessful'));
				setTimeout(() => {
					window.location.href = '/login';
				}, 500);
			}
			setLogoutLoading(false)

		} catch (error) {
			toast.error(t('logoutFailed'));
			setLogoutLoading(false)
		}
	}

	useEffect(() => {
		setCollapsed(propsCollapsed);
	}, [propsCollapsed])
	const getAdminMenuItems = () => {
		return [
			{},
			{},
			...(userType === 'admin' && superAdmin ? [{
				key: 'quote-generator',
				selectPaths: [],
				icon: <Link onClick={() => setIsGetQuoteModalOpen(!isGetQuoteModalOpen)}>
					<Flash />
				</Link>,
				label: <Link onClick={() => setIsGetQuoteModalOpen(!isGetQuoteModalOpen)}>{t('quoteGenerator')}</Link>,
			}] : []),
			{
				key: 'logs',
				selectPaths: ['/logs'],
				icon: (
					<Link to='/logs'>
						<File04 />
					</Link>
				),
				label: <Link to='/logs'>{t('logs')}</Link>,
			},
		];
	};

	const menuItemsOther = [
		{
			key: 'notifications',
			selectPaths: ['/notifications'],
			icon: (
				<Link to='/notifications'>
					<Bell01 />
				</Link>
			),
			label: (
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
					<Link to='/notifications' style={{ color: 'inherit', textDecoration: 'none' }}>
						Notifications
					</Link>
					<span className={styles.menuItemBadge}>10</span>
				</div>
			),
		},
		{
			key: 'help',
			selectPaths: ['/help'],
			icon: (
				<Link to='/help'>
					<LifeBuoy01 />
				</Link>
			),
			label: (
				<Link to='/help' style={{ color: 'inherit', textDecoration: 'none' }}>
					Help
				</Link>
			),
		},
		{
			key: 'settings',
			selectPaths: ['/settings', '/settings/*'],
			icon: (
				<Link to='/settings'>
					<Settings01 />
				</Link>
			),
			label: (
				<Link to='/settings' style={{ color: 'inherit', textDecoration: 'none' }}>
					Paramètres
				</Link>
			),
		},
	];

	useEffect(() => {
		// Build submenu items if multiple quote sessions exist
		console.log('🔍 [SIDEBAR] Building menu with quoteSessions:', quoteSessions.length, quoteSessions);
		
		let assuranceAutoChildren = null;
		
		if (quoteSessions.length > 1) {
			console.log('✅ [SIDEBAR] Creating submenu with', quoteSessions.length, 'sessions');
			assuranceAutoChildren = quoteSessions.map((session, index) => {
				// Extract date and time from session data
				const createdDate = new Date(session.createdAt);
				const dateStr = createdDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
				const timeStr = createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', 'h');
				
				return {
					key: `quote-session-${session.sessionId}`,
					label: (
						<div 
							onClick={() => !session.isActive && handleSessionSwitch(session.sessionId)}
							className={`${styles.sessionItem} ${session.isActive ? styles.sessionItemActive : ''}`}
						>
							<div className={styles.sessionIconWrapper}>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M8.74992 1.16699H3.49992C3.1905 1.16699 2.89375 1.28991 2.67496 1.5087C2.45617 1.72749 2.33325 2.02424 2.33325 2.33366V11.667C2.33325 11.9764 2.45617 12.2732 2.67496 12.4919C2.89375 12.7107 3.1905 12.8337 3.49992 12.8337H10.4999C10.8093 12.8337 11.1061 12.7107 11.3249 12.4919C11.5437 12.2732 11.6666 11.9764 11.6666 11.667V4.08366L8.74992 1.16699Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M8.16675 1.16699V3.50033C8.16675 3.80974 8.28966 4.10649 8.50846 4.32528C8.72725 4.54408 9.024 4.66699 9.33341 4.66699H11.6667" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M5.83341 5.25H4.66675" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M9.33341 7.58301H4.66675" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M9.33341 9.91699H4.66675" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div className={styles.sessionContent}>
								<span className={styles.sessionDate}>{dateStr}</span>
								<span className={styles.sessionTime}>{timeStr}</span>
							</div>
						</div>
					)
				};
			});
		} else {
			console.log('ℹ️ [SIDEBAR] Not enough sessions for submenu:', quoteSessions.length);
		}
		
		const menuItemsAdvisor = [
			{
				key: 'home',
				selectPaths: [
					'/result', 
					'/', 
					'/result/product-order/*', 
					'/confirmation-call/*', 
					'/result-expired/*', 
					'/schedule-call/*', 
					'/confirmation-meeting/*',
					'/result-fallback'
				],
				icon: assuranceAutoChildren ? <img src="/images/Assurance-Auto_new.svg" className={styles.sidebarIcon} alt="" /> : (
					<Link to='/result'>
						<img src="/images/Assurance-Auto_new.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: assuranceAutoChildren ? 'Assurance auto' : (
					<Link to='/result' style={{ color: 'inherit', textDecoration: 'none' }}>
						Assurance auto
					</Link>
				),
				// Add submenu children if multiple quote sessions exist
				...(assuranceAutoChildren && { children: assuranceAutoChildren })
			},
			{
				key: 'habitation',
				selectPaths: ['/habitation'],
				icon: (
					<Link to='/explore'>
						<img src="/images/Assurance-Habitation.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/explore' style={{ color: 'inherit', textDecoration: 'none' }}>
						Assurance habitation
					</Link>
				),
			},
			{
				key: 'overview',
				selectPaths: ['/life-insurance'],
				icon: (
					<Link to='/life-insurance'>
						<img src="/images/NORGA-Assurance-Vie.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/life-insurance' style={{ color: 'inherit', textDecoration: 'none' }}>
						Assurance vie
					</Link>
				),
			},
			{
				key: 'mortgage',
				selectPaths: ['/mortgage-insurance'],
				icon: (
					<Link to='/mortgage-insurance'>
						<img src="/images/NORGA-Assurance-Hypothécaire.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/mortgage-insurance' style={{ color: 'inherit', textDecoration: 'none' }}>
						Assurance hypothécaire
					</Link>
				),
			},
			{
				key: 'mortgage-expert',
				selectPaths: ['/mortgage'],
				icon: (
					<Link to='/mortgage'>
						<img src="/images/Prêt-Hypothécaire.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/mortgage' style={{ color: 'inherit', textDecoration: 'none' }}>
						Hypothèque
					</Link>
				),
			},
			{
				key: 'disability',
				selectPaths: ['/disability'],
				icon: (
					<Link to='/disability'>
						<img src="/images/Assurance-Salaire.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/disability' style={{ color: 'inherit', textDecoration: 'none' }}>
						Assurance salaire
					</Link>
				),
			},
			{
				key: 'critical-illness',
				selectPaths: ['/critical-illness'],
				icon: (
					<Link to='/critical-illness'>
						<img src="/images/NORGA-Assurance-Maladie-Grave.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/critical-illness' style={{ color: 'inherit', textDecoration: 'none' }}>
						Assurance maladies graves
					</Link>
				),
			},
			{
				key: 'quoteLimitExceeded',
				selectPaths: ['/quote-limit-exceeded'],
				icon: (
					<Link to='/quote-limit-exceeded'>
						<LifeBuoy01 />
					</Link>
				),
				label: (
					<Link to='/quote-limit-exceeded' style={{ color: 'inherit', textDecoration: 'none' }}>
						Limite atteinte
					</Link>
				),
			},
			{
				key: 'advisors',
				selectPaths: ['/advisors', '/my-advisors'],
				icon: (
					<Link to='/my-advisors'>
						<img src="/images/icon-people.svg" className={styles.sidebarIcon} alt="" />
					</Link>
				),
				label: (
					<Link to='/my-advisors' style={{ color: 'inherit', textDecoration: 'none' }}>
						Mes conseillers
					</Link>
				),
			},
			{
				key: 'messages',
				selectPaths: ['/messages'],
				icon: (
					<Link to='/messages'>
						<MessageChatSquare />
					</Link>
				),
				label: (
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
						<Link to='/messages' style={{ color: 'inherit', textDecoration: 'none' }}>
							Messages
						</Link>
						<span className={styles.menuItemBadge}>10</span>
					</div>
				),
			},
			{
				key: 'explore',
				selectPaths: ['/explore'],
				icon: (
					<Link to='/explore'>
						<FileSearch02 />
					</Link>
				),
				label: (
					<Link to='/explore' style={{ color: 'inherit', textDecoration: 'none' }}>
						Explore
					</Link>
				),
			},
			{
				key: 'boost-savings',
				selectPaths: ['/boost-savings'],
				icon: (
					<Link to='/boost-savings'>
						<CurrencyDollarCircle />
					</Link>
				),
				label: (
					<Link to='/boost-savings' style={{ color: 'inherit', textDecoration: 'none' }}>
						Boost Your Savings
					</Link>
				),
			},
			{
				key: 'settings',
				selectPaths: ['/settings'],
				icon: (
					<Link to='/settings'>
						<Settings01 />
					</Link>
				),
				label: (
					<Link to='/settings' style={{ color: 'inherit', textDecoration: 'none' }}>
						Paramètres
					</Link>
				),
			},
			{
				key: 'call-confirmation',
				selectPaths: ['/confirmation-call'],
				icon: (
					<Link to='/confirmation-call'>
						<InfoCircle />
					</Link>
				),
				label: (
					<Link to='/confirmation-call' style={{ color: 'inherit', textDecoration: 'none' }}>
						Call Confirmation
					</Link>
				),
			},
			{
				key: 'schedule-call',
				selectPaths: ['/schedule-call'],
				icon: (
					<Link to='/schedule-call'>
						<InfoCircle />
					</Link>
				),
				label: (
					<Link to='/schedule-call' style={{ color: 'inherit', textDecoration: 'none' }}>
						Schedule Call
					</Link>
				),
			},
			{
				key: 'schedule-confirmation',
				selectPaths: ['/confirmation-meeting'],
				icon: (
					<Link to='/confirmation-meeting'>
						<InfoCircle />
					</Link>
				),
				label: (
					<Link to='/confirmation-meeting' style={{ color: 'inherit', textDecoration: 'none' }}>
						Schedule Confirmation
					</Link>
				),
			},
			{
				key: 'result-expired',
				selectPaths: ['/result-expired'],
				icon: (
					<Link to='/result-expired'>
						<InfoCircle />
					</Link>
				),
				label: (
					<Link to='/result-expired' style={{ color: 'inherit', textDecoration: 'none' }}>
						15 Minutes Redirect
					</Link>
				),
			},
			// {
			// 	key: 'complete-form',
			// 	selectPaths: ['/question'],
			// 	icon: (
			// 		<Link to='/'>
			// 			<Cube01 />
			// 		</Link>
			// 	),
			// 	label: (
			// 		<Link to='/' style={{ color: 'inherit', textDecoration: 'none' }}>
			// 			Current Offerings
			// 		</Link>
			// 	),
			// },
			// {
			// 	key: 'complete-form',
			// 	selectPaths: ['/question'],
			// 	icon: (
			// 		<Link to='/'>
			// 			<InfoCircle />
			// 		</Link>
			// 	),
			// 	label: (
			// 		<Link to='/' style={{ color: 'inherit', textDecoration: 'none' }}>
			// 			Question form
			// 		</Link>
			// 	),
			// },


		];

		// Previous full sidebar logic (kept for reference):
		// if (userType === 'admin') {
		// 	setSideMenu([...menuItemsAdvisor, ...getAdminMenuItems(), ...menuItemsOther]);
		// } else {
		// 	setSideMenu([...menuItemsAdvisor, ...menuItemsOther]);
		// }

		// Active behavior: showing Assurance auto, Mes conseillers, and Explore at the top.
		console.log('🔍 [SIDEBAR] Setting menu, first item has children:', !!menuItemsAdvisor[0].children);
		console.log('🔍 [SIDEBAR] Menu items:', menuItemsAdvisor.slice(0, 1));
		setSideMenu(menuItemsAdvisor.filter(item => [
			'home'
		].includes(item.key)));
		
		// Auto-open 'home' only once when sessions first appear
		if (assuranceAutoChildren && !hasAutoOpened.current) {
			setOpenKeys(['home']);
			hasAutoOpened.current = true;
		}
	}, [userType, leadDefaultPath, quoteSessions]);

	useEffect(() => {
		setCollapsed(!sidebar);
		propsSetCollapsed(!sidebar);
	}, [sidebar]);

	useEffect(() => {
		if (sidebarBehavior === 'auto') {
			setCollapsed(true);
			propsSetCollapsed(true);
		}
	}, [location.pathname]);

	useEffect(() => {
		if (collapsed) {
			document.body.classList.add('collapsed');
		} else {
			document.body.classList.remove('collapsed');
		}
	}, [collapsed]);

	const setLocalDefaultSetting = async (value) => {
		let _userAppLocalConfig = localSettings
			? { ...localSettings }
			: { ...userAppLocalConfig };
		_userAppLocalConfig['sidebar'] = !value;
		setUserAppLocalConfig(_userAppLocalConfig);
		dispatch(action(Types.USER_LOCAL_CONFIG, _userAppLocalConfig));
	};

	// Find the item based on the current path
	const selectedItem = React.useMemo(() => {
		return sideMenu?.find((item) => {
			const pathMatches = item.selectPaths.some((path) =>
				location.pathname.startsWith(path),
			);
			if (!pathMatches) return false;

			if (item.queryString) {
				return location.search.includes(item.queryString);
			}

			return !sideMenu.some(
				(otherItem) =>
					otherItem.queryString &&
					location.search.includes(otherItem.queryString) &&
					otherItem.selectPaths.some((path) =>
						location.pathname.startsWith(path),
					),
			);
		});
	}, [location.pathname, location.search, sideMenu]);


	const getSelectedMenuKey = () => {
		if (location.pathname === '/') return ['home'];
		
		// Combine top and bottom menus to check for the active path
		const allMenuItems = [...(sideMenu || []), ...menuItemsOther];

		const selectedKey = allMenuItems.find((item) => {
			if (!item.selectPaths) return false;
			return item.selectPaths.some((path) => {
				if (path.endsWith('/*')) {
					const basePath = path.slice(0, -2); // Remove the '/*'
					return location.pathname.startsWith(basePath);
				}
				return location.pathname === path;
			});
		})?.key;

		return selectedKey ? [selectedKey] : [];
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth <= 763) {
				document.body.classList.add('collapsed');
			} else {
				document.body.classList.remove('collapsed');
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	const userMenuItems = [
		{
			key: 'profile-name',
			label: (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667085', maxWidth: '200px' }}>
					<User01 style={{ width: 16, height: 16, flexShrink: 0 }} />
					<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName} {lastName}</span>
				</div>
			),
			disabled: true,
		},
		...(userType === 'admin' ? [{
			key: 'access-admin',
			label: (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#101828' }}>
					<Shield01 style={{ width: 16, height: 16 }} />
					<span>Accès administrateur</span>
				</div>
			),
		}] : []),
		{
			key: 'profile-email',
			label: (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667085', maxWidth: '200px' }}>
					<Mail01 style={{ width: 16, height: 16, flexShrink: 0 }} />
					<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
				</div>
			),
			disabled: true,
		},
		{ type: 'divider' },
		{
			key: 'settings',
			label: (
				<Link to='/settings' style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#101828' }}>
					<Settings01 style={{ width: 16, height: 16 }} />
					<span>Paramètres</span>
				</Link>
			),
		},
		{ type: 'divider' },
		{
			key: 'logout',
			label: (
				<div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#101828' }}>
					<LogOut01 style={{ width: 16, height: 16 }} />
					<span>Déconnexion</span>
				</div>
			),
		},
	];

	return (
		<>
			<Sider
				theme='light'
				collapsed={collapsed}
				className={`${styles.appSidebar} ${collapsed ? styles.collapse : ''} ${!showProgressSection ? styles.hideProgressSection : ''}`}
				breakpoint='sm'
				style={{ position: 'fixed', left: 0, top: 0, bottom: 0 }}
				width={320} collapsedWidth={80}
				onCollapse={(value) => {
					setCollapsed(value);
					propsSetCollapsed(value);
					setLocalDefaultSetting(value);
				}}>

				<div className="app-sidebar-header">
					<div className={`${styles.logoHeader} flex justify-content-between flex-wrap`}>
						<div className={`${styles.logoWithVersion} flex align-items-end`}>
							<Link to='/' style={{ display: 'flex', alignItems: 'flex-end' }}>
								<img src={!collapsed ? '/images/norga-blue-logo.png' : '/images/logo-single.png'}
									className={`mob-none ${collapsed ? 'collapsed' : ''}`} alt='Norga' style={{ maxWidth: '100px' }}
								/>
								{!collapsed && <div className={styles.version}>Beta</div>}
							</Link>
						</div>
						{onMobileClose && <button className="mobile-sidebar-close mobile-only" onClick={onMobileClose} aria-label="Close menu" type="button"><XClose style={{ width: 20, height: 20, color: '#697586' }} /></button>}
						{/* {
							sidebarBehavior !== 'fixed' && !collapsed && (
								<div className={`${styles.menuIcon} ${collapsed ? 'collapsed' : ''}`} onClick={() => { propsSetCollapsed(!collapsed); setCollapsed(!collapsed) }}>
									<ChevronLeftDouble style={{ color: '#697586' }} />
								</div>

							)
						} */}
					</div>
				</div>


				<div className="app-menus">
					<Menu 
						className={styles.appMenu} 
						expandIcon={(props) => (
							<span style={{ 
								display: 'flex', 
								alignItems: 'center', 
								transition: 'transform 0.3s ease',
								transform: props.isOpen ? 'rotate(0deg)' : 'rotate(180deg)'
							}}>
								<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
									<path d="M8.66406 4.66602L4.66406 0.666016L0.664062 4.66602" stroke="#697586" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</span>
						)}
						theme="light" 
						selectedKeys={getSelectedMenuKey()} 
						openKeys={openKeys}
						onOpenChange={(keys) => setOpenKeys(keys)}
						style={{ borderInlineEnd: 'none' }} 
						mode='inline' 
						items={sideMenu} 
					/>
					

				</div>

				<div className={styles.sidebarFooter}>
					<Dropdown 
						menu={{ items: userMenuItems }} 
						trigger={['click']} 
						placement="topLeft" 
						arrow={false}
						overlayStyle={{ maxWidth: '260px' }}
					>
						<div className={styles.userProfile} style={{ cursor: 'pointer', width: '100%' }}>
							<img
								src={profilePic ? (profilePic.startsWith('http') ? profilePic : serverUrl + profilePic) : '/images/user-placeholder.png'}
								alt="Avatar"
								className={styles.userAvatar}
							/>
							{!collapsed && (
								<div className={styles.userInfo}>
									<div className={styles.userNameRow}>
										<p className={styles.userName}>{firstName} {lastName}</p>
									</div>
									<p className={styles.userEmail}>{email}</p>
								</div>
							)}
						</div>
					</Dropdown>
				</div>

			</Sider>

		</>
	);
};

export default Sidebar;
