import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import tikMark from './images/double-tick-30.png';
import { getFormattedDateTime } from '../../../utils/helper';
import { BellFilled, BellOutlined } from '@ant-design/icons';
import {
	Avatar,
	Badge,
	Dropdown,
	Empty,
	Flex,
	Divider,
	Button,
	theme,
} from 'antd';

const { useToken } = theme;

function Notification({
	id,
	type,
	title,
	subHeading,
	leadId,
	message,
	timestamp,
}) {
	return (
		<Flex key={id} style={{ marginBottom: 12 }}>
			{type === 'lead' && (
				<img
					className='notification-avatar-image'
					src='/images/money-96.png'
					alt='lead-icon'
				/>
			)}
			<span
				style={{
					width: '100%',
					paddingBottom: 12,
					borderBottom: '1px solid whitesmoke',
				}}>
				<div style={{ fontSize: '12px', color: '#999' }}>{subHeading}</div>
				<Flex justify={'space-between'} align={'center'}>
					<Link to={'/lead/' + leadId}>
						<div style={{ fontSize: '12px', fontWeight: 'bold' }}>{title}</div>
					</Link>
				</Flex>
				<div style={{ fontSize: '12px', margin: '5px 0' }}>{message}</div>
				<div style={{ fontSize: '12px', color: '#999' }}>
					{timestamp ? getFormattedDateTime(timestamp) : ''}
				</div>
			</span>
		</Flex>
	);
}

const NotificationList = () => {
	const { t } = useTranslation();
	const { token } = useToken();
	const socket_notifications = useSelector(
		(state) => state.app.socket_notifications,
	);

	const contentStyle = {
		backgroundColor: token.colorBgElevated,
		borderRadius: token.borderRadiusLG,
		boxShadow: token.boxShadowSecondary,
		width: '350px',
		minHeight: '200px',
	};

	// useEffect(() => {
	//   console.log(socket_notification, '--socket_notification')
	//   if(Object.keys(socket_notification)?.length > 0){
	//     console.log(socket_notification, '--socket_notification')
	//     setNotifications([...notifications, socket_notification])
	//   }
	// }, [socket_notification])

	return (
		<Dropdown
			overlay={
				<div style={contentStyle}>
					<Flex
						justify={'space-between'}
						align={'center'}
						style={{ padding: '10px', borderBottom: '1px solid #e8e8e8' }}>
						<span style={{ fontSize: '16px', fontWeight: 'bold' }}>
							{t('notifications')}
						</span>
						{/* <Button disabled icon={<img disabled src={tikMark} alt="readAll" style={{ width: 18 }} />} style={{ display: 'flex', alignItems: 'center' }} type="link">  Mark all as read </Button> */}
						{socket_notifications?.length > 0 && (
							<Button
								disabled
								style={{ display: 'flex', alignItems: 'center' }}
								type='link'>
								{' '}
								{t('markAllAsReadButton')}{' '}
							</Button>
						)}
					</Flex>
					<div style={{ padding: '10px', maxHeight: 350, overflowY: 'auto' }}>
						{socket_notifications?.map((notification) => (
							<Notification {...notification} />
						))}
						{socket_notifications?.length === 0 && (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={t('NoNotificationFound')}
							/>
						)}
					</div>
				</div>
			}
			trigger={['click']}
			placement='bottomRight'>
			<Badge
				className='app-header-notification'
				count={
					socket_notifications?.filter((e) => e?.isRead === false)?.length
				}>
				{socket_notifications?.filter((e) => e?.isRead === false)?.length >
				0 ? (
					<BellFilled style={{ fontSize: '23px', color: 'var(--primary)' }} />
				) : (
					<BellOutlined style={{ fontSize: '23px', color: 'var(--primary)' }} />
				)}
			</Badge>
		</Dropdown>
	);
};

export default NotificationList;
