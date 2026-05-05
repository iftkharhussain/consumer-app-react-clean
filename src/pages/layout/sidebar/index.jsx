import { useTranslation } from 'react-i18next';
import { Layout, Menu, Tag, Input, Dropdown, Space, Popover } from 'antd';
import { InfoCircle, LayersThree01, Users01, CheckDone01, CurrencyDollarCircle, Flash, LifeBuoy01, Settings01, Bell01, ChevronLeftDouble, File04, Home01, ImageUser, MessageChatSquare, FileSearch02, Cube01, Target01, Car01, LogOut01, XClose } from "utils/icons";
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
				// Reload the page to show new quote data
				window.location.reload();
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
			selectPaths: ['/settings'],
			selectPaths: ['/settings/*'],
			icon: (
				<Link to='/settings'>
					<Settings01 />
				</Link>
			),
			label: (
				<Link to='/settings' style={{ color: 'inherit', textDecoration: 'none' }}>
					Account Settings
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
							style={{ 
								cursor: session.isActive ? 'default' : 'pointer',
								padding: '12px',
								backgroundColor: session.isActive ? '#f0f7ff' : 'transparent',
								borderRadius: '8px',
								transition: 'all 0.2s ease',
								border: session.isActive ? '1px solid #d6e4ff' : '1px solid transparent',
								marginBottom: '4px'
							}}
						>
							<div style={{ 
								marginBottom: '6px'
							}}>
								<div style={{ 
									color: '#364152',
									fontFamily: 'Inter',
									fontSize: '13px',
									fontWeight: '600',
									lineHeight: '19.5px',
									letterSpacing: '-0.076px'
								}}>
									{dateStr}
								</div>
							</div>
							<div style={{ 
								color: '#697586',
								fontFamily: 'Inter',
								fontSize: '11px',
								fontWeight: '500',
								lineHeight: '16.5px',
								letterSpacing: '0.064px'
							}}>
								{timeStr}
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
				icon: assuranceAutoChildren ? <Car01 /> : (
					<Link to='/result'>
						<Car01 />
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
				key: 'overview',
				selectPaths: ['/overview'],
				icon: (
					<Link to='/overview'>
						<Flash />
					</Link>
				),
				label: (
					<Link to='/overview' style={{ color: 'inherit', textDecoration: 'none' }}>
						Life Insurance
					</Link>
				),
			},
			{
				key: 'advisors',
				selectPaths: ['/advisors', '/my-advisors'],
				icon: (
					<Link to='/my-advisors'>
						<ImageUser />
					</Link>
				),
				label: (
					<Link to='/my-advisors' style={{ color: 'inherit', textDecoration: 'none' }}>
						My Advisors
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
						Settings
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

		// Active behavior: showing only Assurance auto (Home).
		console.log('🔍 [SIDEBAR] Setting menu, first item has children:', !!menuItemsAdvisor[0].children);
		console.log('🔍 [SIDEBAR] Menu items:', menuItemsAdvisor.slice(0, 1));
		setSideMenu(menuItemsAdvisor.slice(0, 1));
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
		if (location.pathname === '/analytics' && location.search.includes('status=error')) return ['error-leads'];

		const selectedKey = sideMenu?.find((item) => {
			return item.selectPaths.some((path) => {
				if (path.endsWith('/*')) {
					const basePath = path.slice(0, -2); // Remove the '/*'
					return location.pathname.startsWith(basePath);
				}
				return location.pathname === path;
			});
		})?.key;

		return selectedKey ? [selectedKey] : []; // Fallback to an empty array if no key is found
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
	return (
		<>
			<Sider
				theme='light'
				collapsed={collapsed}
				className={`${styles.appSidebar} ${collapsed ? styles.collapse : ''} ${!showProgressSection ? styles.hideProgressSection : ''}`}
				breakpoint='sm'
				style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, }}
				width={300} collapsedWidth={80}
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
					<Menu className={styles.appMenu} theme="light" selectedKeys={getSelectedMenuKey()} style={{ borderInlineEnd: 'none' }} mode='inline' items={sideMenu} />
					{/* Profile section hidden as per user request */}
				</div>

			</Sider>

		</>
	);
};

export default Sidebar;
