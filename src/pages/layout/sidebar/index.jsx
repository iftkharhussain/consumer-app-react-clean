import { useTranslation } from 'react-i18next';
import { Layout, Menu, Tag, Input, Dropdown, Space } from 'antd';
import { BarChartSquare02, LayersThree01, Users01, CheckDone01, PieChart03, Flash, LifeBuoy01, Settings01, Bell01, ChevronLeftDouble, File04, Home01, ImageUser, MessageChatSquare, FileSearch02, Cube01 } from "utils/icons";
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUrl, serverUrl } from '../../../apis/sharedApi';
import styles from './Sidebar.module.css';
import Button from '../../../components/button';

import { userAppLocalConfig, setUserAppLocalConfig, getUserAppLocalConfig, action, Types, setRequest } from '../../../utils/helper';
import toast from 'react-hot-toast';

const { Sider } = Layout;
const leadPageQueryParams = '?pipeline=prospection&advisor=all&filter=all-open'

const Sidebar = ({ collapsed: propsCollapsed, setCollapsed: propsSetCollapsed, children }) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const location = useLocation();
	const localSettings = getUserAppLocalConfig();
	const [logoutLoading, setLogoutLoading] = useState(false);
	const [collapsed, setCollapsed] = useState(propsCollapsed);
	const [adminMenuItems, setAdminMenuItems] = useState([]);
	const [showProgressSection, setShowProgressSection] = useState(true); // Control progress section visibility
	const { firstName, lastName, email, type: userType, superAdmin, profilePic } = useSelector((state) => state.app.user_profile);
	const [isGetQuoteModalOpen, setIsGetQuoteModalOpen] = useState(false);
	const { sidebar } = useSelector(
		(state) => state.app.user_local_config,
	);
	const { leadDefaultPath, sidebarBehavior } = useSelector((state) => state.app.user_local_config);

	const [sideMenu, setSideMenu] = useState();

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

	const profileMenuItems = [
		{
			key: 'profile',
			label: (
				<Link to='/settings/profile'> {t('profile')} </Link>
			),
		},
		{ key: 'settings', label: <Link to='/settings/security'> {t('security')}</Link> },
		{
			key: 'logout',
			label: <Link style={{ color: 'red' }} block danger onClick={handleLogout} > {logoutLoading ? t('loggedOutLoadingMessage') : t('logoutLink')}</Link>,
		},
	];

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
				<Link to='/settings/profile'>
					<Settings01 />
				</Link>
			),
			label: (
				<Link to='/settings/profile' style={{ color: 'inherit', textDecoration: 'none' }}>
					Account Settings
				</Link>
			),
		},
	];

	useEffect(() => {
		const menuItemsAdvisor = [
			{
				key: 'home',
				selectPaths: ['/'],
				icon: (
					<Link to='/'>
						<Home01 />
					</Link>
				),
				label: (
					<Link to='/' style={{ color: 'inherit', textDecoration: 'none' }}>
						Overview
					</Link>
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
						Shop for more
					</Link>
				),
			},
			{
				key: 'complete-form',
				selectPaths: ['/complete-form'],
				icon: (
					<Link to='/complete-form'>
						<LayersThree01 />
					</Link>
				),
				label: (
					<Link to='/complete-form' style={{ color: 'inherit', textDecoration: 'none' }}>
						Complete your Form
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
		];

		if (userType === 'admin') {
			setSideMenu([...menuItemsAdvisor, ...getAdminMenuItems(), ...menuItemsOther]);
		} else {
			setSideMenu([...menuItemsAdvisor, ...menuItemsOther]);
		}
	}, [userType, leadDefaultPath]);

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
				width={292} collapsedWidth={80}
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
								{!collapsed && <div className={styles.version}>&nbsp; v2.0</div>}
							</Link>
						</div>
						{/* <img src='/images/log-out-01.svg' className="mob-logout" title='menu-collapsed-icon' /> */}
						{
							sidebarBehavior !== 'fixed' && !collapsed && (
								<div className={`${styles.menuIcon} ${collapsed ? 'collapsed' : ''}`} onClick={() => { propsSetCollapsed(!collapsed); setCollapsed(!collapsed) }}>
									{/* <img src='/images/log-out-01.svg' title='menu-collapsed-icon' /> */}
									<ChevronLeftDouble style={{ color: '#697586' }} />
								</div>

							)
						}
					</div>
				</div>


				<div className="app-menus">
					<Menu className={styles.appMenu} expandIcon={null} theme="light" selectedKeys={getSelectedMenuKey()} style={{ borderInlineEnd: 'none' }} mode='inline' items={sideMenu} />
					{!collapsed && (
						<div className={styles.sidebarFooter}>
							{/* Progress Section - Conditional */}
							{showProgressSection && (
								<div className={styles.progressSection}>
									<div className={styles.progressTitle}>
										<span>Intake Completion</span>
										<span className={styles.progressPercentage}>14%</span>
									</div>
									<div className={styles.progressBar}>
										<div className={styles.progressFill} style={{ width: '14%' }}></div>
									</div>
									<Button 
										color="secondary" 
										size="md" 
										stretch={true}
										onClick={() => {/* Handle click */}}
									>
										Complete your Profile
									</Button>

								</div>
							)}

							{/* User Profile Section */}
							<div className={styles.userProfile}>
								<img 
									src={profilePic || '/images/Avatar.png'} 
									alt="User Avatar" 
									className={styles.userAvatar}
								/>
								<div className={styles.userInfo}>
									<div className={styles.userName}>
										{firstName+ ' '+ lastName || 'No Name'}
									</div>
									<div className={styles.userEmail}>
										{email || 'No Email Provided'}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

			</Sider>

		</>
	);
};

export default Sidebar;
