import React from 'react';
import { Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const NotificationMessage = ({text}) => {
  return (
    <Typography.Text type="secondary"> <span className='flex'> <InfoCircleOutlined className='mr-8' /> {text} </span> </Typography.Text>
  );
};

export default NotificationMessage;