import React from 'react';
import { Form, Input, Button, Switch, Typography, Divider } from 'antd';
import styles from './Settings.module.css';

const { Title, Text } = Typography;

const SettingsSecurity = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Security form values:', values);
  };

  return (
    <div className={styles.securitySection}>
      <div className={styles.sectionHeader}>
        <Title level={3} className={styles.sectionTitle}>Security</Title>
        <Text className={styles.sectionDescription}>
          Manage your password and security settings.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className={styles.securityForm}
      >
        {/* Current Password */}
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please input your current password!' }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        {/* New Password */}
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Divider />

        {/* Two-Factor Authentication */}
        <div className={styles.securityOption}>
          <div className={styles.optionContent}>
            <Title level={5}>Two-Factor Authentication</Title>
            <Text>Add an extra layer of security to your account</Text>
          </div>
          <Switch />
        </div>

        {/* Email Notifications */}
        <div className={styles.securityOption}>
          <div className={styles.optionContent}>
            <Title level={5}>Email Notifications</Title>
            <Text>Receive security alerts via email</Text>
          </div>
          <Switch defaultChecked />
        </div>

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <Button className={styles.cancelButton}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" className={styles.saveButton}>
            Update Password
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SettingsSecurity;
