import React from 'react';
import PropTypes from 'prop-types';
import { Input, InputNumber } from 'antd';
import './index.css';

const CustomInput = ({ type, value, prefixIcon, onChange, placeholder, ...rest }) => {
  if (type === 'number') {
    return (
      <InputNumber
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

  return (
    prefixIcon ?
      <div className='custom-input-prefix-wrapper'>
        <div className="input-prefix-icon">{prefixIcon}</div>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          {...rest} />
      </div> :
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...rest}
      />
  );
};

CustomInput.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'number', 'password']).isRequired,
  prefixIcon: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

CustomInput.defaultProps = {
  placeholder: '',
};

export default CustomInput;