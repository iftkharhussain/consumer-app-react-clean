import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { useParams } from 'react-router-dom'
import { Types, setRequest } from '../../utils/helper'
import React, { useState, useEffect, useRef } from 'react'
import { Form, Input, Button, Layout, Spin, List, Progress } from 'antd'
import { ResetPasswordUrl, verifyTokenUrl } from '../../apis/sharedApi'
import { CheckCircleFilled, ExclamationCircleOutlined, CloseCircleFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Content } = Layout;

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

const ResetPassword = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm()
  const { token } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const initialized = useRef(false)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const passwordStrength = verifyPasswordStrength(newPassword)
  const [verifyTokenLoading, setVerifyTokenLoading] = useState(true)

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

  async function verifyToken() {
    try {
      setVerifyTokenLoading('validating...')
      const verifyTokenRes = await setRequest(Types.VERIFY_TOKEN, null, verifyTokenUrl + '/' + token, Types.GET, dispatch);
      if (verifyTokenRes?.success && verifyTokenRes?.data?.type === 'resetToken') {
        setIsTokenValid(true)
        document.title = t('resetPassword') + ' - Norga';
      } else {
        setIsTokenValid(false)
        document.title = t('invalidOrExpiredInvitation');
      }
      setTimeout(() => {
        setVerifyTokenLoading(false)
      }, 1500);

    } catch (error) {
      setIsTokenValid(false)
      document.title = t('invalidOrExpiredInvitation');
    } finally {
      setVerifyTokenLoading(false)
    }
  }

  useEffect(() => {
    if (!initialized.current) {
      verifyToken()
      initialized.current = true
      document.title = t('loading') + ' - Norga';
    }
  }, []);

  const onFinish = async (values) => {
    try {
      const password = values.newPassword;
      const confirmPassword = values.reenterPassword;

      if (password === confirmPassword) {
        setLoading(true)
        const formData = new URLSearchParams()
        formData.append('token', token)
        formData.append('newPassword', password)
        formData.append('reEnterPassword', confirmPassword)

        const resetPasswordRes = await setRequest(Types.AUTH, formData, ResetPasswordUrl, Types.POST, dispatch);
        setLoading(false);

        if (resetPasswordRes?.success) {
          setTimeout(() => {
            navigate('/login')
          }, 2000);
          setVerifyTokenLoading('redirecting...')
          toast.success(resetPasswordRes?.message)
        } else {
          toast.error(resetPasswordRes?.message || t('passwordResetFailed'));
        }
      } else {
        toast.error(t('thePasswordsDoNotMatch'));
      }
    } catch (error) {
      toast.error(t('passwordResetFailedTryAgain'));
    }
  };

  return (
    <Layout style={{ height: '97vh' }}>
      {
        verifyTokenLoading ?
          <div className='loading-full-bg'>
            <span><Spin /> &nbsp;&nbsp;&nbsp; <h3>{verifyTokenLoading}</h3></span>
          </div> :
          <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {
              !isTokenValid ?
                <div className='loading-full-bg'>
                  <span><ExclamationCircleOutlined style={{ color: 'red' }} /> &nbsp;&nbsp;&nbsp; <h3>{t('invalidOrExpiredToken')}</h3></span>
                </div> :
                <span style={{ textAlign: 'center' }}>
                  <a href="https://norga.io">
                    <img src="/images/norga_logo_noir-resized.svg" alt="Logo" style={{ marginBottom: 60, width: 200 }} />
                  </a>
                  <Form
                    form={form}
                    name="passwordForm"
                    onFinish={onFinish}
                    layout="vertical"
                    disabled={loading}
                  >
                    <div className='reset-password-auth-page'>
                      <div className='input-content'>
                        <Form.Item
                          label="Nouveau mot de passe"
                          name="newPassword"
                          rules={[
                            {
                              required: true,
                              message: 'Veuillez saisir un nouveau mot de passe.',
                            },
                            {
                              validator: async (_, value) => {
                                if (value) {
                                  const passwordStrength = verifyPasswordStrength(value);
                                  if (!passwordStrength.minLength ||
                                    !passwordStrength.hasUppercase ||
                                    !passwordStrength.hasLowercase ||
                                    !passwordStrength.hasNumber) {
                                    return Promise.reject('Password does not meet the required criteria');
                                  }
                                }
                              },
                            },
                          ]}
                        >
                          <Input.Password
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
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
                                { content: t('passwordUppercase'), check: passwordStrength.hasUppercase },
                                { content: t('pwdMustContainLowercase'), check: passwordStrength.hasLowercase },
                                { content: t('passwordNumber'), check: passwordStrength.hasNumber },
                                { content: t('passwordSpecial'), check: passwordStrength.hasSpecialChar },
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

                        <Form.Item
                          label={t('reenterPassword')}
                          name="reenterPassword"
                          rules={[
                            {
                              required: true,
                              message: 'Veuillez saisir à nouveau votre mot de passe.',
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (value && value !== getFieldValue('newPassword')) {
                                  return Promise.reject(t('thePasswordsDoNotMatch'));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <Input.Password />
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'center' }}>
                          <Button style={{ display: 'inline-block' }} type="primary" disabled={loading} loading={loading} htmlType="submit">Update Password </Button>
                        </Form.Item>
                      </div>
                      {/* <div className='input-feedback'>
                      <List
                        header={<b>Please choose a password as:</b>}
                        dataSource={[
                          { content: 'Password must be 12 characters', check: passwordStrength.minLength },
                          { content: 'At least one uppercase letter', check: passwordStrength.hasUppercase },
                          { content: 'At least one lowercase letter', check: passwordStrength.hasLowercase },
                          { content: 'At least one number', check: passwordStrength.hasNumber },
                          { content: 'At least one special character (optional)', check: passwordStrength.hasSpecialChar },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            {item.check ? 
                              <CheckCircleFilled style={{ color: '#52c41a', marginRight: 5 }} /> : 
                              <CloseCircleFilled style={{ color: '#ff4d4f', marginRight: 5 }} />
                            }
                            {item.content}
                          </List.Item>
                        )}
                      />
                    </div> */}
                    </div>
                  </Form>
                </span>
            }

          </Content>
      }
    </Layout>
  );
};

export default ResetPassword;