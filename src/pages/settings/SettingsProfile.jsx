import React from 'react';
import { Form, Input, Button, Select, Upload, Row, Col, Typography } from 'antd';
import styles from './Settings.module.css';
import { Mail01 } from 'utils/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsProfile = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Profile form values:', values);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload',
    onChange(info) {
      // hook up to API later
      // console.log(info);
    },
    showUploadList: false,
  };

  return (
    <div className={styles.profileSection}>
      <div className={styles.sectionHeader}>
        <Title level={3} className={styles.sectionTitle}>Profile</Title>
        <Text className={styles.sectionDescription}>
          Update your photo and personal details here.
        </Text>
      </div>

      <Form
        form={form}
        layout="horizontal"
        onFinish={onFinish}
        className={styles.profileForm}
        initialValues={{
          firstName: 'Nicolas',
          lastName: 'HM',
          email: 'nicolashm@norgaapp.com',
          phone: '123 456 7890',
          role: 'Developer',
          language: 'English'
        }}
      >
        {/* Name Row */}
        <Row gutter={[24, 0]} align="top" className={styles.formRow}>
          <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
            <div className={styles.labelTitle}>Name</div>
          </Col>
          <Col xs={24} sm={16} md={16} lg={12}>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item name="firstName">
                  <Input placeholder="Nicolas" className={styles.nameInput} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="lastName">
                  <Input placeholder="HM" className={styles.nameInput} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Email */}
        <Row gutter={[24, 0]} align="top" className={styles.formRow}>
          <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
            <div className={styles.labelTitle}>Email address</div>
          </Col>
          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item name="email" rules={[{ type: 'email', message: 'Please enter a valid email!' }]}> 
              <Input placeholder="nicolashm@norgaapp.com" disabled readOnly prefix={<Mail01 className='input-icon' />} className={`custom-icon-input ${styles.singleInput}`} />
            </Form.Item>
          </Col>
        </Row>        
        {/* Photo Upload */}
        <Row gutter={[24, 0]} align="top" className={styles.formRow}>
          <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
            <div className={styles.labelTitle}>Your photo</div>
            <div className={styles.subDescription}>This will be displayed on your profile.</div>
          </Col>
          <Col xs={24} sm={16} md={16} lg={12}>
            <div className={styles.photoUpload}>
              <div className={styles.currentPhoto}>
                <img src="/images/Avatar.png" alt="Current profile" className={styles.profileAvatar} />
              </div>
              <div className={styles.uploadArea}>
                <Upload.Dragger {...uploadProps} className={styles.uploadDragger}>
                  <div className={styles.draggerInner}>
                    <div className="ant-upload-drag-icon">
                      <img src='/images/upload-cloud-02.svg' alt='Upload' />
                    </div>
                    <div className="ant-upload-text"><span>Click to upload</span> or drag and drop</div>
                    <div className="ant-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</div>
                  </div>
                </Upload.Dragger>
              </div>
            </div>
          </Col>
        </Row>

        {/* Phone Number */}
  <Row gutter={[24, 0]} align="top" className={styles.formRow}>
          <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
            <div className={styles.labelTitle}>Phone Number</div>
          </Col>
          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item name="phone" rules={[{ required: true, message: 'Please input your phone number!' }]}> 
              <Input placeholder="123 456 7890" className={styles.singleInput} />
            </Form.Item>
          </Col>
        </Row>

        {/* Role */}
  <Row gutter={[24, 0]} align="top" className={styles.formRow}>
          <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
            <div className={styles.labelTitle}>Role</div>
          </Col>
          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item name="role" rules={[{ required: true, message: 'Please select your role!' }]}> 
              <Select placeholder="Developer" className={styles.singleInput}>
                <Option value="Developer">Developer</Option>
                <Option value="Designer">Designer</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Analyst">Analyst</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Language */}
        <Row gutter={[24, 0]} align="top" className={styles.formRow}>
          <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
            <div className={styles.labelTitle}>Language</div>
          </Col>
          <Col xs={24} sm={16} md={16} lg={12}>
            <Form.Item name="language" rules={[{ required: true, message: 'Please select your language!' }]}> 
              <Select placeholder="English" className={styles.singleInput}>
                <Option value="English">English</Option>
                <Option value="French">French</Option>
                <Option value="Spanish">Spanish</Option>
                <Option value="German">German</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <Button className={styles.cancelButton}>Cancel</Button>
          <Button type="primary" htmlType="submit" className={styles.saveButton}>Save</Button>
        </div>
      </Form>
    </div>
  );
};

export default SettingsProfile;
