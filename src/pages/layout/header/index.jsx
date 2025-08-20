import { useTranslation } from 'react-i18next';
import React from 'react';
import AppSearch from '../appSearch';
import toast from 'react-hot-toast';
import Notification from './notification';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Layout, Dropdown, theme, Avatar, Select } from 'antd';
import { logoutUrl, serverUrl } from 'apis/sharedApi';
import { Types, eraseCookie, setRequest } from 'utils/helper';
import {
	SettingOutlined,
	InfoCircleOutlined,
	UserOutlined,
	LogoutOutlined,
	SafetyCertificateOutlined,
	MailOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = ({ children, collapsed }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { profilePic } = useSelector((state) => state.app.user_profile);
	const pageHeading = useSelector((state) => state.app.pageHeading);
	const {
		token: { colorBgContainer, headerHeight },
	} = theme.useToken();
	const { firstName, lastName, email, type } = useSelector((state) => state.app.user_profile);

	const onClick = async ({ key }) => {
		if (key === 'logout') {
			const promiseFunction = () =>
				new Promise((resolve) => {
					setTimeout(async () => {
						eraseCookie('--auth');
						const logout = await setRequest( Types.LOGOUT, null, logoutUrl, Types.GET, dispatch );
						navigate('/login');
						window.location.reload();
						resolve();
					}, 1000);
				});

			toast.promise(promiseFunction(), {
				loading: (
					<div style={{ fontFamily: 'sans-serif' }}>
						{t('loggedOutLoadingMessage')}
					</div>
				),
				success: (
					<b style={{ fontFamily: 'sans-serif' }}>
						{t('loggedOutSuccessMessage')}
					</b>
				),
				error: (
					<b style={{ fontFamily: 'sans-serif' }}>
						{t('loggedOutErrorMessage')}
					</b>
				),
			});
		}
	};

	const items = [
		{
			key: '1',
			label: (
				<div>
					<UserOutlined style={{ marginRight: 8 }} /> {firstName + ' ' + lastName}
				</div>
			),
			disabled: true,
		},
		{
			key: '2',
			label: (
				<div>
					<SafetyCertificateOutlined style={{ marginRight: 8 }} />
					{t('userAccessLabel')} {type}
				</div>
			),
			disabled: true,
		},
		{
			key: '3',
			label: (
				<div>
					<MailOutlined style={{ marginRight: 8 }} /> {email}
				</div>
			),
			disabled: true,
		},
		{ type: 'divider' },
		{
			key: 'settings',
			label: (
				<Link to={'/settings/profile'}>
					<div>
						<SettingOutlined style={{ marginRight: 8 }} /> {t('settings')}{' '}
					</div>
				</Link>
			),
		},
		{
			key: 'help',
			label: (
				<Link to={'/feedback'}>
					<div>
						<InfoCircleOutlined style={{ marginRight: 8 }} /> {t('helpLink')}{' '}
					</div>
				</Link>
			),
		},
		{ type: 'divider' },
		{
			key: 'logout',
			label: (
				<div style={{ minWidth: 160 }}>
					<LogoutOutlined style={{ marginRight: 8 }} /> {t('logoutLink')}{' '}
				</div>
			),
		},
	];

	return (
		<Header
			className='app-header'
			style={{
				padding: 0,
				background: colorBgContainer,
			}}>
			<div className='wrapper-content'>
				<div className='left-wrapper'>
					{pageHeading?.title && (
						<div className="page-heading m-0">
							<h1 className="m-0 p-0">{pageHeading.title}</h1>
							{pageHeading.subtitle && <p className="sub-heading">{pageHeading.subtitle}</p>}
						</div>
					)}
				</div>
				<div className='right-wrapper'>
					<AppSearch />
					<Notification />
					<Dropdown menu={{ items, onClick }} trigger={['click']}>
						<Avatar
							size={40}
							src={`${serverUrl}${profilePic}`}
							style={{
								backgroundColor: '#87d068',
								border: '1px solid #fff',
								cursor: 'pointer',
							}}
							icon={<UserOutlined />}
						/>
					</Dropdown>
				</div>
			</div>
		</Header>
	);
};

export default AppHeader;
