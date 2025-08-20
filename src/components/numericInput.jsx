import React, { useState, useEffect } from 'react';
import { Input, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
const formatNumber = (value) => new Intl.NumberFormat().format(value);



const NumericInput = (props) => {
  const { t } = useTranslation();

  const { value, onChange } = props;
  const [inputValid, setInputValid] = useState(true)

  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      if(inputValue>0){
        onChange(inputValue);
      }else{
        setInputValid(false)
      }
    }
  }

  const handleBlur = () => {
    let valueTemp = value;
    if (value?.charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1);
    }
    onChange(valueTemp?.replace(/0*(\d+)/, '$1'));
  }
  const title = value ? (
    <span className="numeric-input-title">{value !== '-' ? formatNumber(Number(value)) : '-'}</span>
  ) : (
    t('inputANumber')
  )
  return (
    <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
      <Input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={t('inputANumber')}
        maxLength={16}
        status={inputValid?null:"error"}
        style={{ maxWidth: 88, minWidth:50 }}
      />
    </Tooltip>
  );
}



const NumberInput = props => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <NumericInput
      {...props}
      value={value}
      onChange={e => {
        setValue(e)
        props.onChange(e)
      }}
    />
  );
};
export default NumberInput;
