import React from 'react';
import { Switch } from 'antd';
import './index.css'
import { useTranslation } from 'react-i18next';

const CustomSwitch = ({ defaultChecked = true, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="flex align-items-center mb-16 custom-form-switch">
      <span className="mr-8 text-16">{t('enableTwoStepAuthentication')}</span>
      <Switch defaultChecked={defaultChecked} onChange={onChange} />
    </div>
  );
};

export default CustomSwitch;