import { Typography, Image } from 'antd'
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

const Logout = () => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3); // Set the initial countdown value

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);


    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(countdownInterval);
  }, []);

  return (
    <div className="logout-box">
      <div className="header-row">
        <img src={'/images/norga_logo_noir-resized.svg'} alt="logo" />
      </div>
      <div className="check-icon">
        <img src={'/images/check-mark.png'} alt="check-mark" />
      </div>
      <Title level={5}>{t('youHaveBeenLoggedOut')}.</Title>
      <Paragraph>
        {t('redirectingToLoginPageIn')} 
        <span className="countdown">{countdown}</span> {t('seconds')}.
      </Paragraph>
    </div>
  );
};

export default Logout;