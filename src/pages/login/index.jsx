import toast from 'react-hot-toast'
import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { LoginUrl } from '../../apis/sharedApi'
import { PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, Layout, Checkbox, Flex, Typography } from 'antd'
import { Types, setRequest } from '../../utils/helper'
import { useTranslation } from 'react-i18next'
import styles from './Login.module.css'

const { Text } = Typography;


const { Content } = Layout;

const Login = props => {
  const { t } = useTranslation();
  const [form] = Form.useForm()
  const [phoneForm] = Form.useForm()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('email') // 'email' or 'phone'

  const onEmailLogin = async (values) => {
    try {
      const email = values.email
      const password = values.password

      if (email && password) {
        setLoading(true)
        const formData = new URLSearchParams()
        formData.append("email", email?.toString()?.toLocaleLowerCase());
        formData.append("password", password);

        const loginRes = await setRequest(Types.AUTH, formData, LoginUrl, Types.POST, dispatch)
        setLoading(false)
        if (loginRes?.success) {
          toast.success(loginRes?.message)
          setTimeout(() => {
            window.location.reload();
            // props.setIsAuth(true)
          }, 500);
        } else {

          if (loginRes?.authType === '2FA needed') {
            props.twoStepNeeded(loginRes?.authMobileNumber)
          } else if (loginRes?.authType === t('twoFactorNeededPhoneMissing')) {
            props.twoStepPhoneNeeded(true)
          } else {
            return toast.error(loginRes?.message || t('emailOrPasswordInvalid'));
          }
        }
      } else {
        toast.error(t('emailAndPasswordRequired'));
      }
    } catch (error) {
      toast.error(t('loginFailed'));
    }
  };

  const onPhoneLogin = async (values) => {
    try {
      const phone = values.phone

      if (phone) {
        setLoading(true)
        const formData = new URLSearchParams()
        formData.append("phone", phone?.toString()?.trim());

        const phoneLoginUrl = LoginUrl.replace('/login', '/phone-login');
        const loginRes = await setRequest(Types.AUTH, formData, phoneLoginUrl, Types.POST, dispatch)
        setLoading(false)
        if (loginRes?.success) {
          toast.success(loginRes?.message)
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          return toast.error(loginRes?.message || 'Phone login failed');
        }
      } else {
        toast.error('Phone number is required');
      }
    } catch (error) {
      setLoading(false);
      toast.error('Phone login failed');
    }
  };

  const renderEmailLogin = () => (
    <Form
      form={form}
      name="login"
      loading={loading}
      className={styles.form}
      onFinish={onEmailLogin}
      initialValues={{
        email: '',
        password: '',
        remember: true
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Email</label>
        <Form.Item 
          name="email" 
          style={{ marginBottom: 0 }}
          rules={[
            { required: true, message: t('inputEmailRequired') },
            { type: 'email', message: t('invalidEmail') },
          ]}
        >
          <Input 
            placeholder="Enter your email" 
            className={styles.input}
            readOnly={loading}
          />
        </Form.Item>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Password</label>
        <Form.Item 
          name="password" 
          style={{ marginBottom: 0 }}
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password 
            placeholder="••••••••" 
            className={styles.passwordInput}
            readOnly={loading}
          />
        </Form.Item>
      </div>

      <Form.Item>
        <Flex justify="space-between" align="center">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox disabled={loading}>Remember me</Checkbox>
          </Form.Item>
          <Link className={styles.forgotLink} to={'/forgot-password'}>{t('forgotPassword')}</Link>
        </Flex>
      </Form.Item>
      
      <Form.Item style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          loading={loading} 
          htmlType="submit" 
          block 
          className={styles.button}
        > 
          Sign in
        </Button>
      </Form.Item>

      {/* Login type links */}
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Or sign in with{' '}
          <Text 
            style={{ color: '#1a1aba', cursor: 'pointer', fontSize: '14px' }} 
            onClick={() => setLoginType('phone')}
          >
            <PhoneOutlined style={{ marginRight: 4 }} />
            Phone
          </Text>
        </Text>
      </div>
    </Form>
  );

  const renderPhoneLogin = () => (
    <Form
      form={phoneForm}
      name="phone-login"
      loading={loading}
      className={styles.form}
      onFinish={onPhoneLogin}
      initialValues={{
        phone: ''
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Phone Number</label>
        <Form.Item 
          name="phone" 
          style={{ marginBottom: 0 }}
          rules={[
            { required: true, message: 'Please input your phone number!' },
          ]}
        >
          <Input 
            placeholder="Enter your phone number" 
            className={styles.input}
            readOnly={loading}
          />
        </Form.Item>
      </div>
      
      <Form.Item style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          loading={loading} 
          htmlType="submit" 
          block 
          className={styles.button}
        > 
          Sign in
        </Button>
      </Form.Item>
      
      <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
        Phone login is available for verified accounts only
      </div>

      {/* Login type links */}
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Or sign in with{' '}
          <Text 
            style={{ color: '#1a1aba', cursor: 'pointer', fontSize: '14px' }} 
            onClick={() => setLoginType('email')}
          >
            <MailOutlined style={{ marginRight: 4 }} />
            Email
          </Text>
        </Text>
      </div>
    </Form>
  );

  return (
    <div className={styles.container}>
      <img src="/images/norga-blue-logo.png" alt="Logo" className={styles.logo} />
      
      <div className={styles.card}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            {loginType === 'email' ? 'Sign in with Email' : 'Sign in with Phone'}
          </h2>
        </div>

        {/* Render appropriate form based on login type */}
        {loginType === 'email' ? renderEmailLogin() : renderPhoneLogin()}
      </div>
    </div>
  );
};

export default Login