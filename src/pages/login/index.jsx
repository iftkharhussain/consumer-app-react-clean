import toast from 'react-hot-toast'
import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { LoginUrl } from '../../apis/sharedApi'
import { LoginOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, Layout, Checkbox, Flex } from 'antd'
import { Types, setRequest } from '../../utils/helper'
import { useTranslation } from 'react-i18next'
import styles from './Login.module.css'


const { Content } = Layout;

const Login = props => {
  const { t } = useTranslation();
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
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

  return (
    <div className={styles.container}>
      <img src="/images/norga-blue-logo.png" alt="Logo" className={styles.logo} />
      
      <div className={styles.card}>
        <Form
          form={form}
          name="login"
          loading={loading}
          className={styles.form}
          onFinish={onFinish}
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
          
          <Form.Item style={{ marginBottom: 0 }}>
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
        </Form>
      </div>
    </div>
  );
};

export default Login