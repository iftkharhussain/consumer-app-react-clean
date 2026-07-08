/* eslint-disable */
import React from 'react';
import { DatePicker } from 'antd';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import 'styles/carFunnel/components/CustomDatePicker.css';

const CustomDatePicker = ({ placeholder, style, picker, className, ...props }) => {
  return (
    <div className="custom-date-picker-wrapper">
      <div className="custom-date-picker__icon-container">
        <img
          src={getAssetPath('/images/calendar.svg')}
          alt="Calendar"
          className="custom-date-picker__calendar-icon"
        />
        <div className="custom-date-picker__divider" />
      </div>
      <DatePicker
        placeholder={placeholder}
        picker={picker}
        className={`custom-date-picker ${className || ''}`}
        style={style}
        suffixIcon={null}
        {...props}
      />
    </div>
  );
};

export default CustomDatePicker;
