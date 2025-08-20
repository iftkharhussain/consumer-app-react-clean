import { countryList } from 'utils/countryList'
import { useTranslation } from 'react-i18next'
import toast, { Toaster } from 'react-hot-toast'
import React, { useState, useEffect } from 'react'
import { NotificationMessage, CustomSwitch } from 'components/index'
import { connect, useSelector, useDispatch } from 'react-redux'
import { Form, Input, Button, Select, Row, Col, Spin, Flex, Switch } from 'antd'
import { Types, checkAuth, setAuth, setRequest } from 'utils/helper'
import { addPhoneOTPUrl, verifyPhoneOTPUrl, authUrl, manageTwoStepAuthUrl } from 'apis/sharedApi'
import { PlusOutlined, ReloadOutlined, SafetyOutlined, CheckCircleFilled } from '@ant-design/icons'

const { Option } = Select;

const PhoneForm = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [OTPForm] = Form.useForm()
  const { t, i18n } = useTranslation()
  const [seconds, setSeconds] = useState(0)
  const [OTPTries, setOTPTries] = useState(0)
  const [verifyOTP, setVerifyOTP] = useState(false)
  const [loadingOTP, setLoadingOTP] = useState(false)
  const [twoFactorAuthManage, setTwoFactorAuthManage] = useState(false)
  
  const [OTPFormVisible, setOTPFormVisible] = useState(false)
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(null)
  const [twoFactorAuthLoading, setTwoFactorAuthLoading] = useState(false)
  const [callingCode, setCallingCode] = useState({code: '--',phone: null})

  const { phone, twoFactorAuth } = useSelector((state) => state.app.user_profile)

  // Helper function to check if phone is empty object or not set
  const isPhoneEmpty = (phoneObj) => {
    return !phoneObj || 
           Object.keys(phoneObj).length === 0 || 
           typeof phoneObj?.verified !== 'boolean'
  }

  useEffect(() => {
    if (isPhoneEmpty(phone)) {
      setIsPhoneAvailable(false)
    } else {
      setIsPhoneAvailable(true)
    }
  }, [phone])

  useEffect(() => { setTwoFactorAuthManage(twoFactorAuth) }, [twoFactorAuth])

  const onFinish = async (values) => {
    setLoadingOTP(true)
    const formData = new URLSearchParams()
    formData.append("country", callingCode?.code)
    formData.append("phoneNumber", values?.phoneNumber)
    setCallingCode((prev) => ({...prev, phoneNumber: values?.phoneNumber}))

    const requestOTP = await setRequest(Types.ADD_PHONE_OTP, formData, addPhoneOTPUrl, Types.POST, dispatch)
    if (requestOTP?.success) {
      setLoadingOTP(false)
      setOTPFormVisible(true)
      setSeconds(20)
      setOTPTries((prevSeconds) => prevSeconds + 1)
      const intervalId = setInterval(() => { setSeconds((prevSeconds) => prevSeconds - 1) }, 1000);
      if (seconds < -2) {
        clearInterval(intervalId)
      }
    }else{
      setLoadingOTP(false)
      toast.error(requestOTP?.message)
    }
  }

  const onFinishOTP = async (values) => {
    setVerifyOTP(true)
    const formData = new URLSearchParams()
    formData.append("otpCode", values?.otpCode);

    const verifyOTP = await setRequest(Types.VERIFY_PHONE_OTP, formData, verifyPhoneOTPUrl, Types.POST, dispatch)
    if (verifyOTP?.success) {
      await setRequest(Types.AUTH_VERIFY, {}, authUrl, Types.GET, dispatch)
      setVerifyOTP(false)
    }else{
      setVerifyOTP(true)
      toast.error(verifyOTP?.message)
    }
  };

  function countryChangeHandle(country) {
    const countryObject = countryList.find((e) => e.countryCode === country);
    countryObject?.value && setCallingCode((prev) => ({...prev, code: countryObject.value}));
  }

  const resendOtp = async () => {
    if (OTPTries > 3) {
      return toast.error(t('cannotSendOtpTooManyTries'))
    }

    const formData = new URLSearchParams()
    formData.append("country", callingCode?.code)
    formData.append("phoneNumber", callingCode?.phoneNumber);

    setVerifyOTP(true)
    const requestOTP = await setRequest(Types.ADD_PHONE_OTP, formData, addPhoneOTPUrl, Types.POST, dispatch)
    if (requestOTP?.success) {
      setVerifyOTP(false)
      setSeconds(80)
      setOTPTries((prevSeconds) => prevSeconds + 1)
      const intervalId = setInterval(() => { setSeconds((prevSeconds) => prevSeconds - 1) }, 1000);
      if (seconds < -2) {
        clearInterval(intervalId)
      }
    }else{
      setVerifyOTP(false)
      toast.error(t('otpCannotSendTryAgainAfterFewMinutes'))
    }
    
  };

  function OTPExtraText() {
    if (seconds > 0) {
      return <span style={{ marginTop: '10px', display: 'block' }}>{t('resendIn')}{seconds}</span>
    }
    if (seconds <= -1) {
      return (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
          <span>{t('didNotReceiveTheCodeYet')} &nbsp;</span>
          <Button 
            type="link" 
            size={'small'} 
            onClick={resendOtp}
            style={{ padding: 0, height: 'auto', lineHeight: 'inherit' }}
          >
            {t('sendAgain')}
          </Button>
        </div>
      )
    }
  }

  const manageTwoStepAuth = async (value) => {
    try {
      const formData = new URLSearchParams()
      formData.append("twoStepAuth", value)
      setTwoFactorAuthLoading(true)
      const response = await setRequest(Types.MANAGE_TWO_STEP_AUTH, formData, manageTwoStepAuthUrl, Types.POST, dispatch)
      if (response?.success) {
        setTwoFactorAuthManage(!twoFactorAuthManage)
        if(response?.message === 'Two step auth enabled'){
          toast.success(t('twoStepAuthEnabled'))
        }else{
          toast(response?.message)
        }
      }else{
        toast.error(t('twoStepAuthUpdateFailed'))
      }
    } catch (error) {
      toast.error(t('twoStepAuthUpdateFailed'))
    } finally {
      setTwoFactorAuthLoading(false)
    }
  }

  return (
    <Flex vertical>
      {/* Loading state */}
      {typeof isPhoneAvailable !== 'boolean' && (
        <div 
          style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 100
          }} 
          className='block-area'
        >
          <Spin spinning={true} />
        </div>
      )}

      {/* OTP Verification Form - Show when OTP form is visible and phone is not available */}
      {OTPFormVisible && isPhoneAvailable === false && (
        <Form form={OTPForm} onFinish={onFinishOTP} layout="vertical" className='block-area inside-form-2'>
          <Spin spinning={verifyOTP}>
            <Row gutter={30} style={{ marginTop: 0 }}>
              <Col span={16}>
                <Form.Item
                  extra={OTPExtraText()}
                  name="otpCode"
                  label={t('mobilePhoneOtp')}
                  rules={[
                    { required: true, message: t('pleaseEnterOtp') },
                    { len: 6, message: t('otpMustBe6Digits') },
                  ]}
                >
                  <Input.OTP
                    length={6}
                    separator={(i) => <span style={{ color: i & 1 ? 'red' : 'blue' }}>—</span>}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Button 
                    loading={verifyOTP} 
                    style={{ marginTop: 31 }} 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SafetyOutlined />}
                  >
                    {t('verifyOtp')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Spin>
        </Form>
      )}

      {/* Add Phone Form - Show when OTP form is not visible and phone is not available */}
      {!OTPFormVisible && isPhoneAvailable === false && (
        <Form form={form} onFinish={onFinish} layout="vertical" className='block-area inside-form-2'>
          <Spin spinning={loadingOTP}>
            <Row gutter={30} style={{ marginTop: 0 }}>
              <Col xs={24} sm={12} md={24} lg={9}>
                <Form.Item 
                  name="country" 
                  label={t('country')} 
                  rules={[{ required: true, message: t('pleaseSelectACountry') }]}
                >
                  <Select 
                    showSearch 
                    placeholder={t('selectACountry')} 
                    onChange={countryChangeHandle} 
                    optionFilterProp="label"
                  >
                    {countryList
                      .filter((country) => country.countryCode && country.label) // Filter out null/undefined values
                      .map((country) => (
                        <Option 
                          key={country.countryCode} 
                          value={country.countryCode} 
                          label={country.label}
                        >
                          {country.label}
                        </Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={24} lg={9}>
                <Form.Item
                  name="phoneNumber"
                  label={t('phoneNumber')}
                  rules={[
                    { required: true, message: t('pleaseEnterAPhoneNumber') },
                    { pattern: /^[0-9]+$/, message: t('phoneNumberMustContainOnlyDigits') },
                  ]}
                >
                  <Input 
                    addonBefore={callingCode?.code === '--' ? callingCode?.code : '+' + callingCode?.code} 
                    placeholder={t('enterPhoneNumber')} 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6} lg={6} style={{display: 'flex', alignItems: 'flex-end'}}>
                <Form.Item>
                  <Button loading={loadingOTP} type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    {t('addPhone')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <NotificationMessage text={t('providePhoneWithCountryCode')} />
          </Spin>
        </Form>
      )}

      {/* Two-Factor Authentication Section - Show when phone is available */}
      {isPhoneAvailable === true && (
        <Spin spinning={twoFactorAuthLoading}>
          <div className='block-area phone-verification setting-section'>
            <div style={{ marginBottom: 15 }}>
              <b>{t('enableTwoStepAuthentication')}</b> &nbsp; &nbsp;
              <Switch 
                checked={twoFactorAuthManage} 
                loading={twoFactorAuthLoading} 
                onChange={(checked) => manageTwoStepAuth(checked)} 
              />
            </div>
            <div className='heading'>
              {t('phoneNumberHasBeenAdded')}: +{phone?.country}-{phone?.number} 
              <CheckCircleFilled style={{ color: 'green' }} />
            </div>
            <div className='description'>{t('twoFactorAuthenticationBenefits')}</div>
            <Button className='change-phone-sm' htmlType="submit">
              {t('changeNumber')}
            </Button>
          </div>
        </Spin>
      )}
    </Flex>
  );
};

export default PhoneForm;