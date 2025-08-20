import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { ForgotPasswordUrl } from '../../apis/sharedApi'; // Update with your API URL
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Layout, Checkbox } from 'antd';
import { Types, setRequest } from '../../utils/helper'; // Update with your helper functions
import { useTranslation } from 'react-i18next';

const { Content } = Layout;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)

  const onFinish = async (values) => {
    try {
      const email = values.email;

      if (email) {
        setLoading(true);
        const formData = new URLSearchParams()
        formData.append('email', email);

        const forgotPasswordRes = await setRequest(Types.AUTH, formData, ForgotPasswordUrl, Types.POST, dispatch);
        setLoading(false);

        if (forgotPasswordRes?.success) {
          toast.success(t(forgotPasswordRes?.message));
          // Redirect user to success message or another page
          setLinkSent(true)
          // navigate('/reset-password');
        } else {
          toast.error(t(forgotPasswordRes?.message) || t('emailRequired'));
        }
      } else {
        toast.error(t('emailRequired'));
      }
    } catch (error) {
      setLoading(false)
      toast.error(t('forgotPasswordFailure'));
    }
  };

  return (
    <Layout style={{ height: '97vh' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 350 }}>
          <img src="/images/forgot-password.png" alt="Logo" style={{ width: 80 }} />
          {
            !linkSent && 
            <div className='two-step-info'>
              <h3>{t('forgotPassword')}</h3>
              <p>{t('pleaseEnterEmail')}</p>
            </div>
          }
          {
            linkSent && 
            <div className='two-step-info'>
              <h3>{t('checkEmailResetLink')}</h3>
              <p><b>{t('emailSentTo')} {form?.getFieldValue('email')},</b> {t('checkSpam')} </p>
            </div>
          }
          {
            !linkSent && 
            <Form
              form={form}
              name="forgot-password"
              loading={loading}
              disabled={loading}
              style={{ width: 330 }}
              onFinish={onFinish}
              initialValues={{
                email: '',
              }}
            >
              <Form.Item readOnly={loading} name="email" style={{ marginBottom: 15 }}
                rules={[
                  { required: true, message: t('inputEmailRequired') },
                  { type: 'email', message: t('invalidEmail') },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" loading={loading} htmlType="submit" block> {t('sendResetLinkButton')} </Button>
              </Form.Item>
              <Form.Item>
                <Link to="/login">{t('backToLoginLink')}</Link>
              </Form.Item>
            </Form>
          }
        </div>
      </Content>
    </Layout>
  );
};

export default ForgotPassword;