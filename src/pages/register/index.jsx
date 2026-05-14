import toast from 'react-hot-toast'
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { MailOutlined, LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, Layout } from 'antd'
import { Types, setRequest } from '../../utils/helper'
import { useTranslation } from 'react-i18next'
import { RegisterUrl } from '../../apis/sharedApi'
import { PhoneInput } from '../../components'
import styles from '../login/Login.module.css' // Reuse login styles

const { Content } = Layout;

const Register = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const { email, password, phone, firstName, lastName } = values;

      if (email && password && phone) {
        setLoading(true)
        
        const formData = new URLSearchParams()
        formData.append("email", email?.toString()?.toLowerCase());
        formData.append("password", password);
        formData.append("phone", phone?.toString()?.trim());
        if (firstName) formData.append("firstName", firstName?.toString()?.trim());
        if (lastName) formData.append("lastName", lastName?.toString()?.trim());

        // Use the register endpoint
        const registerRes = await setRequest(Types.AUTH, formData, RegisterUrl, Types.POST, dispatch)
        setLoading(false)
        
        if (registerRes?.success) {
          toast.success(registerRes?.message || 'Account created successfully!')
          setTimeout(() => {
            // Redirect to dashboard or reload to trigger auth check
            window.location.href = '/';
          }, 1000);
        } else {
          return toast.error(registerRes?.message || 'Registration failed');
        }
      } else {
        toast.error('All fields are required');
      }
    } catch (error) {
      setLoading(false);
      toast.error('Registration failed');
    }
  };

  return (
    <div className={styles.container}>
      <img src="/images/norga-blue-logo.png" alt="Logo" className={styles.logo} />
      
      <div className={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            Create Account
          </h2>
          <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Join us to get started with your insurance journey
          </p>
        </div>

        <Form
          form={form}
          name="register"
          loading={loading}
          className={styles.form}
          onFinish={onFinish}
          layout="vertical"
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>First Name</label>
              <Form.Item 
                name="firstName" 
                style={{ marginBottom: 16 }}
              >
                <Input 
                  placeholder="First name" 
                  className={styles.input}
                  readOnly={loading}
                />
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Last Name</label>
              <Form.Item 
                name="lastName" 
                style={{ marginBottom: 16 }}
              >
                <Input 
                  placeholder="Last name" 
                  className={styles.input}
                  readOnly={loading}
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Email</label>
            <Form.Item 
              name="email" 
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input 
                placeholder="Enter your email" 
                className={styles.input}
                readOnly={loading}
              />
            </Form.Item>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Phone Number</label>
              <Form.Item 
                name="phone" 
                style={{ marginBottom: 0 }}
                rules={[
                  { required: true, message: 'Phone number is required' },
                ]}
              >
                <PhoneInput />
              </Form.Item>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontSize: '14px', fontWeight: '500' }}>Password</label>
            <Form.Item 
              name="password" 
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password 
                placeholder="Create a password" 
                className={styles.passwordInput}
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
              Create Account
            </Button>
          </Form.Item>

          {/* Login Link */}
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;