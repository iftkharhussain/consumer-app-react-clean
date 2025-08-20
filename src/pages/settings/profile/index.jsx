import dayjs from 'dayjs';
import ProfileDP from './profileDP';
import React, { useEffect, useState, useRef } from 'react';
import { profileUrl } from '../../../apis/sharedApi';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { PageBanner, PageHeading, PageContent } from 'components';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Form, Input, Select, Button, Row, Typography, Col, DatePicker } from 'antd';
import { Types, action, setAuth, setCookie, setRequest, userAppLocalConfig, setUserAppLocalConfig, getUserAppLocalConfig } from '../../../utils/helper';
import ProfileSkeleton from 'pages/skeltons/profileSkeleton';
import { ChevronDown, Mail01 } from 'utils/icons';
import styles from '../Settings.module.css';

const { Option } = Select;
const { Title, Text } = Typography;

const Profile = ({ section, pageHeading }) => {
	const { t, i18n } = useTranslation();
	const initialized = useRef(false);
	const [form] = Form.useForm();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { email, firstName, lastName, profilePhone, profession } = useSelector((state) => state.app.user_profile);
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

	useEffect(() => {
		const profileObject = { email, firstName, lastName, profilePhone: profilePhone, profession };

		form.setFieldsValue(profileObject);
	}, [email]);

	const onFinish = async (values) => {

		setLoading(true);
		const formData = new URLSearchParams(); formData.append('lastName', values?.lastName);
		formData.append('firstName', values?.firstName);
		formData.append('profession', values?.profession);
		formData.append('profilePhone', values?.profilePhone);

		const updateProfileResponse = await setRequest(Types.UPDATE_PROFILE, formData, profileUrl, Types.PUT, dispatch,);
		if (updateProfileResponse?.success) {
			toast.success(t('profileHasBeenUpdated'));
		} else {
			toast.error(t('profileUpdateFailed'));
		}
		setLoading(false);
	};


	return (
		<div>
			{loading ? (
				<ProfileSkeleton />
			) : (
				<>
					<PageContent pageType={'Settings-Profile'}>
						<PageBanner styles={{ paddingLeft: '0px' }} classNames={'pl-0'} heading={t('profile')} />
						{/* <SectionLinks section={section} /> */}
						<Form layout="horizontal" className={`${styles.settingsProfile} w-full`} form={form} size={'large'} name='profileUpdate' onFinish={onFinish} disabled={loading} >
							<Row gutter={[{ xs: 8, sm: 16, md: 16, lg: 32 }, 0]}>
								<Col className="label-res profile-md-label" xs={24} sm={8} md={8} lg={7}>
									<div className={styles.formLabelTd}>
										<span className='form-label'>{t('name')}</span>
									</div>
								</Col>
								<Col xs={24} sm={16} md={16} lg={12}>
									<Row gutter={[{ xs: 8, sm: 15, md: 15, lg: 24 }, 0]}>
										<Col xs={24} sm={12} md={12} lg={12}>
											<div className="form-label-td profile-sm-label">
												<span className='form-label'>{t('firstName')}</span>
											</div>
											<Form.Item name="firstName">
												<Input placeholder={t('firstName')} />
											</Form.Item>
										</Col>
										<Col xs={24} sm={12} md={12} lg={12}>
											<div className="form-label-td profile-sm-label">
												<span className='form-label'>{t('lastName')}</span>
											</div>
											<Form.Item name="lastName">
												<Input placeholder={t('lastName')} />
											</Form.Item>
										</Col>
									</Row>
								</Col>
								<Col className="label-res" xs={24} sm={8} md={8} lg={7}>
									<div className="form-label-td">
										<span className='form-label'>{t('email')}</span>
									</div>
								</Col>
								<Col xs={24} sm={16} md={16} lg={12}>
									<div className='flex'>
										<Form.Item className='w-full' name='email' rules={[{ required: true, message: t('emailIsRequired') },]}>
											<Input placeholder="example@example.com" disabled readOnly prefix={<Mail01 className='input-icon' />} className='custom-icon-input' />
										</Form.Item>
									</div>
								</Col>

								<Col className="photo-label-res" xs={24} sm={8} md={8} lg={7}>
									<div className="form-label-td w-full">
										<div className='form-label'>{t('profilePicture')}</div>
										<span className='sub-description'>{t('thisWillBeDisplayedOnYourProfile')}</span>
									</div>
								</Col>
								<Col xs={24} sm={16} md={16} lg={12}>
									<ProfileDP />
								</Col>

								<Col className="label-res" xs={24} sm={8} md={8} lg={7}>
									<div className="form-label-td">
										<span className='form-label'>{t('phoneNumber')}</span>
									</div>
								</Col>
								<Col xs={24} sm={16} md={16} lg={12}>
									<div className='flex'>
										<Form.Item className='w-full' name='profilePhone' rules={[{ required: true, message: t('phoneIsRequired') },]}>
											<Input placeholder="123 456 7890" />
										</Form.Item>
									</div>
								</Col>

								<Col className="label-res" xs={24} sm={8} md={8} lg={7}>
									<div className="form-label-td">
										<span className='form-label'>{t('role')}</span>
									</div>
								</Col>
								<Col xs={24} sm={16} md={16} lg={12}>
									<div className='flex'>
										<Form.Item name="profession" className='w-full' rules={[{ required: true, message: t('professionIsRequired') }]}>
											<Select size='middle' placeholder={t('selectARole')} suffixIcon={<ChevronDown className='select-icon' />}>
												<Option value='Developer'>{t('developer')}</Option>
												<Option value='Marketing'>{t('marketing')}</Option>
												<Option value='Assistant'>{t('assistant')}</Option>
												<Option value='Financial advisor'> {t('financialAdvisor')}</Option>
											</Select>
										</Form.Item>
									</div>
								</Col>
								<Col xs={24} sm={24} md={24} lg={19} className="flex flex-row gap-8 mt-16 justify-content-end">
									<Button htmlType="button" className="mr-8 profile-btn-sm">{t('cancel')}</Button>
									<Button type="primary" htmlType="submit">{t('save')}</Button>
								</Col>
							</Row>
						</Form>
					</PageContent>
				</>
			)}
		</div>
	);
};

export default Profile;
