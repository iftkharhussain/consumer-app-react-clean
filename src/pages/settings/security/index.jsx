import PhoneForm from './phoneForm';
import shieldsImage from './images/shields.png';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import { resetPasswordAuthUrl } from '../../../apis/sharedApi';
import { connect, useDispatch } from 'react-redux';
import { CheckCircleFilled, CloseCircleFilled, LockOutlined } from '@ant-design/icons';
import { Types, setRequest } from '../../../utils/helper';
import { Row, Col, Input, Form, Button, Typography, List, Progress } from 'antd';
import SecuritySkeleton from '../../skeltons/securitySkeleton';
import { PageHeading, PageContent, PageBanner } from 'components';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import styles from '../Settings.module.css';

const { Title } = Typography;

function verifyPasswordStrength(password) {
	const points = {
		minLength: password?.length >= 12,
		hasUppercase: /[A-Z]/.test(password),
		hasLowercase: /[a-z]/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecialChar: /[@#$%^&+=]/.test(password),
	}

	// Calculate strength percentage (each criteria is worth 20%)
	const strength = Object.values(points).filter(Boolean).length * 20;

	return {
		...points,
		strength,
		level: strength < 40 ? 'weak' : strength < 80 ? 'medium' : 'strong'
	};
}

const SecurityPage = ({ section, pageHeading }) => {
	const { t } = useTranslation();
	const initialized = useRef(false);
	const dispatch = useDispatch();
	const [form] = Form.useForm();

	const [loading, setLoading] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [twoFactorAuth, setTwoFactorAuth] = useState(false);
	const passwordStrength = verifyPasswordStrength(newPassword);

	// Get color for password strength bar
	const getStrengthColor = (level) => {
		switch (level) {
			case 'weak':
				return '#ff4d4f';
			case 'medium':
				return '#faad14';
			case 'strong':
				return '#52c41a';
			default:
				return '#d9d9d9';
		}
	};
	useEffect(() => {
		if (!initialized.current) {
			dispatch({
				type: Types.PAGE_HEADING,
				payLoad: {
					title: t('settings'),
					subtitle: t(section)
				}
			});
			document.title = `${t('settings')} - ${t(section)}`;
			initialized.current = true;
		}
	}, [t, dispatch, section]);

	const onFinish = async (values) => {
		setLoading(true);
		const formData = new URLSearchParams();
		formData.append('currentPassword', values?.currentPassword);
		formData.append('newPassword', values?.newPassword);
		formData.append('newPassword2', values?.reenterPassword);

		try {
			const response = await setRequest(
				Types.RESET_PASSWORD_AUTH,
				formData,
				resetPasswordAuthUrl,
				Types.POST,
				dispatch,
			);

			if (response?.success) {
				form.resetFields();
				setNewPassword('');
				toast.success(t('passwordHasBeenUpdated'));
			} else {
				toast.error(t('passwordHasBeenUpdatedFailed'));
			}
		} catch (error) {
			toast.error(t('passwordHasBeenUpdatedFailed'));
		}
		setLoading(false);
	};

	return (
		<>
			{loading ? (
				<SecuritySkeleton />
			) : (
				<>
					<PageContent pageType={'Settings-Profile'}>
						<PageBanner styles={{ paddingLeft: '0px' }} classNames={'pl-0'} heading={t('passwordUpdate')} />

						<div className='w-full'>

							<Form size={'large'} name='passwordForm' onFinish={onFinish} layout="horizontal" className={`${styles.settingsProfile} w-full`} initialValues={{ currentPassword: '', newPassword: '', reenterPassword: '', }} disabled={loading} validateTrigger={['onBlur']}>
								<Row gutter={[{ xs: 8, sm: 16, md: 16, lg: 32 }, 0]}>
									<Col className="label-res" xs={24} sm={8} md={8} lg={7}>
										<div className="form-label-td">
											<span className='form-label'>{t('currentPassword')}</span>
										</div>
									</Col>
									<Col xs={24} sm={16} md={16} lg={12}>
										<div className='flex'>
											<Form.Item style={{ marginBottom: 10 }} name='currentPassword' rules={[{ required: true, message: t('pleaseEnterYourCurrentPassword') }]}>
												<Input.Password
													placeholder="**********"
													iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
												/>
											</Form.Item>
										</div>
									</Col>

									<Col className="label-res" xs={24} sm={8} md={8} lg={7}>
										<div className="form-label-td">
											<span className='form-label'>{t('newPassword')}</span>
										</div>
									</Col>
									<Col xs={24} sm={16} md={16} lg={12}>
										<div className='d-flex'>
											<Form.Item name='newPassword'
												rules={[
													{ required: true, message: t('pleaseEnterANewPassword') },
													{
														validator: async (_, value) => {
															if (value) {
																const passwordStrength = verifyPasswordStrength(value);
																if (!passwordStrength.minLength ||
																	!passwordStrength.hasUppercase ||
																	!passwordStrength.hasLowercase ||
																	!passwordStrength.hasNumber) {
																	return Promise.reject(
																		t('passwordDoesNotMeetTheRequiredCriteria'),
																	);
																}
															}
														},
													},
												]}>
												<Input.Password
													onChange={(e) => setNewPassword(e.target.value)}
													onFocus={() => setPasswordFocused(true)}
													onBlur={() => setPasswordFocused(false)}
													placeholder="**********"
													iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
												/>
											</Form.Item>

											{/* Password strength indicator - only shown when password field is focused */}
											{newPassword && passwordFocused && (
												<div style={{ marginBottom: 16 }}>
													<Progress
														percent={passwordStrength.strength}
														strokeColor={getStrengthColor(passwordStrength.level)}
														style={{ marginBottom: 8 }}
														status={passwordStrength.strength >= 80 ? 'success' : null}
													/>
													<List
														size="small"
														dataSource={[
															{ content: t('passwordMinLength'), check: passwordStrength.minLength },
															{ content: t('pwdMustContainUppercase'), check: passwordStrength.hasUppercase },
															{ content: t('pwdMustContainLowercase'), check: passwordStrength.hasLowercase },
															{ content: t('pwdMustContainNumber'), check: passwordStrength.hasNumber },
															{ content: t('pwdMustContainSpecialChar'), check: passwordStrength.hasSpecialChar },
														]}
														renderItem={(item) => (
															<List.Item style={{ padding: '0px 0px 4px 0px' }}>
																{item.check ?
																	<CheckCircleFilled style={{ color: '#52c41a', marginRight: 5 }} /> :
																	<CloseCircleFilled style={{ color: '#ff4d4f', marginRight: 5 }} />
																}
																<span style={{ fontSize: '12px' }}>{item.content}</span>
															</List.Item>
														)}
													/>
												</div>
											)}
										</div>
									</Col>

									<Col className="label-res" xs={24} sm={8} md={8} lg={7}>
										<div className="form-label-td">
											<span className='form-label'>{t('reenterPassword')}</span>
										</div>
									</Col>
									<Col xs={24} sm={16} md={16} lg={12}>
										<div className='flex'>
											<Form.Item name='reenterPassword'
												rules={[{ required: true, message: t('pleaseReenterYourNewPassword'), },
												({ getFieldValue }) => ({
													validator(_, value) {
														if (
															value &&
															value !== getFieldValue('newPassword')
														) {
															return Promise.reject(
																t('thePasswordsDoNotMatch'),
															);
														}
														return Promise.resolve();
													},
												}),
												]}>
												<Input.Password iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
											</Form.Item>
										</div>
									</Col>

									<Col className="label-res" xs={24} sm={8} md={8} lg={7}></Col>
									<Col xs={24} sm={16} md={16} lg={12}>
										<Button className='update-pass-sm' style={{ float: 'right' }} type="primary" htmlType="submit">{ t('update')}</Button>
									</Col>
								</Row>
							</Form>
						</div>


						<PageBanner styles={{ paddingLeft: '0px' }} classNames={'pl-0'} heading={t('twoStepAuthentication')} />
						<Row>
							<Col xs={24} sm={19}>
								<PhoneForm />
							</Col>
						</Row>

						{/* <Button className='mt-16'>Change Number</Button> */}

					</PageContent>
				</>
			)}
		</>
	);
};

export default SecurityPage;
