import './style.css'
import InputMask from 'react-input-mask'
import React, { useState, useEffect } from 'react'
import { Input, Select, Space } from 'antd'
import { useTranslation } from 'react-i18next'

const { Option } = Select;

const countries = [
  { countryCode: 'CA', value: '1', label: 'CA +1' },
  // { countryCode: 'US', value: '1', label: 'US +1' },
  // { countryCode: 'PK', value: '92', label: 'PK +92' },
  // { countryCode: 'GB', value: '44', label: 'GB +44' }
];

const Phone = ({ value, onChange }) => {
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState('CA')
  const [phoneValue, setPhoneValue] = useState('')

  useEffect(() => {
    // If there's an initial value, try to parse it
    if (value) {
      const countryCode = countries.find(c => value.startsWith(c.value))
      if (countryCode) {
        setSelectedCountry(countryCode.countryCode)
        setPhoneValue(value.substring(countryCode.value.length))
      } else {
        setPhoneValue(value)
      }
    }
  }, [value])

  function countryChangeHandle(countryCode) {
    const country = countries.find(c => c.countryCode === countryCode)
    setSelectedCountry(countryCode)
    setPhoneValue('') // Reset phone value when country changes
    if (onChange) {
      onChange('')
    }
  }

  const getMask = (countryCode) => {
    switch (countryCode) {
      case 'CA':
      case 'US':
        return '(999) 999-9999'
      case 'PK':
        return '999-9999999'
      case 'GB':
        return '99999 999999'
      default:
        return '999-999-9999'
    }
  }

  const handlePhoneChange = (e) => {
    const newValue = e.target.value
    setPhoneValue(newValue)
    
    // Strip formatting and get just the numbers
    const numbersOnly = newValue.replace(/\D/g, '')
    const country = countries.find(c => c.countryCode === selectedCountry)
    
    if (onChange && country) {
      // Pass up the full number with country code but without formatting
      onChange(country.value + numbersOnly)
    }
  }

  return (
    <Space.Compact>
      <Select 
        style={{width: 120}} 
        placeholder="Country" 
        value={selectedCountry} 
        onChange={countryChangeHandle}
      >
        {countries.map((country) => (
          <Option key={country.countryCode} value={country.countryCode}>
            {country.label}
          </Option>
        ))}
      </Select>
      <InputMask 
        mask={getMask(selectedCountry)}
        value={phoneValue}
        onChange={handlePhoneChange}
        maskChar="_"
      >
        {(inputProps) => (
          <Input 
            {...inputProps}
            placeholder={`Ex: ${getMask(selectedCountry)}`}
          />
        )}
      </InputMask>
    </Space.Compact>
  )
}

export default Phone