import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';


const ScreenResolutionAlert = () => {

  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    const checkResolution = () => {
      const { innerWidth, innerHeight } = window;
      if(innerWidth < 1300 || innerHeight < 700 && process.env.NODE_ENV !== 'development'){
        setShowAlert(true);
        document.body.classList.add('body-overflow-fixed')
      }else{
        setShowAlert(false);
        document.body.classList.remove('body-overflow-fixed')
      }
    };

    if(process.env.NODE_ENV !== 'development'){
      checkResolution();
    }
    window.addEventListener('resize', checkResolution);

    return () => window.removeEventListener('resize', checkResolution);
  }, []);

  if (!showAlert) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgb(75, 75, 75)', // semi-transparent background
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '400px',
        width: '90%',
      }}>
        <Alert
          message="Screen Resolution Alert"
          description="The minimum recommended screen resolution is 1366x768. Your current screen resolution may not provide the best experience."
          type="warning"
          showIcon
          onClose={() => setShowAlert(false)}
        />
      </div>
    </div>
  );
};

export default ScreenResolutionAlert;