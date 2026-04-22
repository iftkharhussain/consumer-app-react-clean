import toast from 'react-hot-toast'
import React, { useState } from 'react'
import { LoginUrl } from '../../apis/sharedApi'
import { useDispatch } from 'react-redux'
import { Form, Button, Typography } from 'antd'
import { Types, setRequest } from '../../utils/helper'
import { useTranslation } from 'react-i18next'
import { PhoneInput } from '../../components'
import styles from './Login.module.css'

const { Text } = Typography;

const Login = props => {
  const { t } = useTranslation();
  const [phoneForm] = Form.useForm()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

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
          return toast.error(loginRes?.message || t('phoneLoginFailed'));
        }
      } else {
        toast.error(t('phoneNumberRequired'));
      }
    } catch (error) {
      setLoading(false);
      toast.error(t('phoneLoginFailed'));
    }
  };

  return (
    <div className={styles.container}>
      <img src="/images/norga-blue-logo.png" alt="Logo" className={styles.logo} />
      
      <div className={styles.card}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            {t('signInWithPhone')}
          </h2>
        </div>

        {/* Phone Login Form */}
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
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              {t('phoneNumber')}
            </label>
            <Form.Item 
              name="phone" 
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: t('phoneNumberRequired') },
              ]}
            >
              <PhoneInput />
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
              {t('signIn')}
            </Button>
          </Form.Item>
          
          <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
            {t('phoneLoginVerifiedAccountsOnly')}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login