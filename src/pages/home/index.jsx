import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { PageContent, Card, Button, Badge } from 'components';
import { Types } from '../../utils/helper';
import { Row, Col, Typography, Statistic } from 'antd';
import {
  UserOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const { firstName, lastName } = useSelector((state) => state.app.user_profile);

  useEffect(() => {
    if (!initialized.current) {
      dispatch({
        type: Types.PAGE_HEADING,
        payLoad: {
          title: t('home') || 'Home',
          subtitle: t('welcome') || 'Welcome to your dashboard'
        }
      });
      document.title = `${t('home') || 'Home'} - Consumer App`;
      initialized.current = true;
    }
  }, [t, dispatch]);

  const welcomeMessage = firstName ? 
    `${t('welcome') || 'Welcome'} ${firstName} ${lastName}!` : 
    `${t('welcome') || 'Welcome'} to Consumer App!`;

  return (
    <PageContent pageType="home">
      <div style={{ padding: '24px' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            {welcomeMessage}
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            {t('homeDescription') || 'This is your dashboard where you can manage your account and access various features.'}
          </Paragraph>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Statistic
                title="Total Questions"
                value={24}
                prefix={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Statistic
                title="Completed"
                value={18}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Statistic
                title="Profile Status"
                value="Active"
                prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Statistic
                title="Settings"
                value="Updated"
                prefix={<SettingOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card style={{ height: '300px' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>
                Quick Actions
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button 
                  type="primary" 
                  icon={<QuestionCircleOutlined />}
                  size="large"
                  block
                  href="/question"
                >
                  {t('askQuestion') || 'Ask a Question'}
                </Button>
                <Button 
                  icon={<UserOutlined />}
                  size="large"
                  block
                  href="/settings/profile"
                >
                  {t('updateProfile') || 'Update Profile'}
                </Button>
                <Button 
                  icon={<SettingOutlined />}
                  size="large"
                  block
                  href="/settings/security"
                >
                  {t('securitySettings') || 'Security Settings'}
                </Button>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card style={{ height: '300px' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>
                Recent Activity
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f6ffed', borderLeft: '4px solid #52c41a', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Profile updated successfully</span>
                    <Badge color="green" text="2 hours ago" />
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#e6f7ff', borderLeft: '4px solid #1890ff', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><QuestionCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />New question submitted</span>
                    <Badge color="blue" text="1 day ago" />
                  </div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#fff7e6', borderLeft: '4px solid #fa8c16', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><SettingOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />Settings synchronized</span>
                    <Badge color="orange" text="3 days ago" />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContent>
  );
};

export default Home;
