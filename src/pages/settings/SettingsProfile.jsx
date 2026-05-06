import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Upload, Row, Col, Typography, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import ImgCrop from 'antd-img-crop';
import styles from './Settings.module.css';
import { Mail01 } from 'utils/icons';
import { profileUrl, serverUrl } from '../../apis/sharedApi';
import { Types, setRequest } from '../../utils/helper';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsProfile = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    email, 
    firstName, 
    lastName, 
    profilePhone, 
    phone,
    profession,
    profilePic: ProfilePicSrc,
    _id: currentUserId 
  } = useSelector((state) => state.app.user_profile);

  useEffect(() => {
    // Load profile data into form
    const profileObject = { 
      email, 
      firstName, 
      lastName, 
      phone: profilePhone || phone
    };
    form.setFieldsValue(profileObject);

    // Load profile picture
    if (ProfilePicSrc) {
      setProfilePic({
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: serverUrl + ProfilePicSrc,
      });
    }
  }, [email, firstName, lastName, profilePhone, phone, profession, ProfilePicSrc, form]);

  const onFinish = async (values) => {
    setLoading(true);
    
    const formData = new URLSearchParams();
    formData.append('firstName', values?.firstName || '');
    formData.append('lastName', values?.lastName || '');
    formData.append('profilePhone', values?.phone || '');

    try {
      const updateProfileResponse = await setRequest(
        Types.UPDATE_PROFILE,
        formData,
        profileUrl,
        Types.PUT,
        dispatch
      );
      
      if (updateProfileResponse?.success) {
        toast.success(t('profileHasBeenUpdated') || 'Profile has been updated');
        // Update Redux store with new profile data
        dispatch({
          type: Types.UPDATE_PROFILE,
          payLoad: updateProfileResponse.data
        });
      } else {
        toast.error(t('profileUpdateFailed') || 'Profile update failed');
      }
    } catch (error) {
      toast.error(t('profileUpdateFailed') || 'Profile update failed');
    }
    
    setLoading(false);
  };

  const beforeUpload = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.height > 350 || img.width > 350) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxSize = 350;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob && blob.size <= 5 * 1024 * 1024) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              URL.revokeObjectURL(objectUrl);
              setIsUpdating(true);
              resolve(resizedFile);
            } else {
              toast.error(t('fileSizeExceeded') || 'File size exceeded 5MB');
              URL.revokeObjectURL(objectUrl);
              reject(false);
            }
          }, file.type, 0.9);
        } else {
          URL.revokeObjectURL(objectUrl);
          setIsUpdating(true);
          resolve(file);
        }
      };

      img.onerror = () => {
        toast.error(t('invalidImageFile') || 'Invalid image file');
        URL.revokeObjectURL(objectUrl);
        reject(false);
      };

      img.src = objectUrl;
    });
  };

  const onUploadSuccess = (file) => {
    if (file?.success) {
      setIsUpdating(false);
      toast.success(t('profilePictureHasBeenUpdated') || 'Profile picture has been updated');
      const newPicPath = file?.data?.profilePic;
      setProfilePic({
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: serverUrl + newPicPath,
      });
      dispatch({
        type: Types.UPDATE_PROFILE,
        payLoad: { profilePic: newPicPath }
      });
    }
  };

  const onUploadError = (err) => {
    setIsUpdating(false);
    toast.error(t('profilePictureWasFailedToUpdate') || 'Profile picture failed to update');
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: `${serverUrl}/app/profile-pic?userId=${currentUserId}`,
    beforeUpload: beforeUpload,
    onChange: (info) => {
      if (info.file.status === 'done') {
        onUploadSuccess(info.file.response);
      } else if (info.file.status === 'error') {
        onUploadError(info.file.error);
      }
    },
    showUploadList: false,
    withCredentials: true,
    accept: 'image/png,image/jpeg,image/jpg',
  };

  return (
    <div className={styles.profileSection}>
      <div className={styles.sectionHeader}>
        <Title level={3} className={styles.sectionTitle}>{t('profile') || 'Profile'}</Title>
        <Text className={styles.sectionDescription}>
          {t('updateYourPhotoAndPersonalDetailsHere') || 'Update your photo and personal details here.'}
        </Text>
      </div>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={onFinish}
          className={styles.profileForm}
          disabled={loading}
        >
          {/* Name Row */}
          <Row gutter={[24, 0]} align="top" className={styles.formRow}>
            <Col xs={24} sm={8} md={8} lg={7} className={`${styles.leftLabel} ${styles.hideOnMobile}`}>
              <div className={styles.labelTitle}>{t('name') || 'Name'}</div>
            </Col>
            <Col xs={24} sm={16} md={16} lg={12}>
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <div className={styles.mobileLabel}>{t('firstName') || 'First name'}</div>
                  <Form.Item name="firstName" rules={[{ required: true, message: t('firstNameIsRequired') || 'First name is required' }]}>
                    <Input placeholder={t('firstName') || 'First Name'} className={styles.nameInput} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <div className={styles.mobileLabel}>{t('lastName') || 'Last name'}</div>
                  <Form.Item name="lastName" rules={[{ required: true, message: t('lastNameIsRequired') || 'Last name is required' }]}>
                    <Input placeholder={t('lastName') || 'Last Name'} className={styles.nameInput} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Email */}
          <Row gutter={[24, 0]} align="top" className={styles.formRow}>
            <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
              <div className={styles.labelTitle}>{t('email') || 'Email address'}</div>
            </Col>
            <Col xs={24} sm={16} md={16} lg={12}>
              <Form.Item name="email"> 
                <Input 
                  placeholder="email@example.com" 
                  disabled 
                  readOnly 
                  prefix={<Mail01 className='input-icon' style={{ marginRight: '8px' }} />} 
                  className={`custom-icon-input ${styles.singleInput}`} 
                />
              </Form.Item>
            </Col>
          </Row>    

                {/* Phone Number */}
          <Row gutter={[24, 0]} align="top" className={styles.formRow}>
            <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
              <div className={styles.labelTitle}>{t('phoneNumber') || 'Phone Number'}</div>
            </Col>
            <Col xs={24} sm={16} md={16} lg={12}>
              <Form.Item name="phone"> 
                <Input placeholder="123 456 7890" disabled readOnly className={styles.singleInput} />
              </Form.Item>
            </Col>
          </Row>
    
          
          {/* Photo Upload */}
          <Row gutter={[24, 0]} align="top" className={styles.formRow}>
            <Col xs={24} sm={8} md={8} lg={7} className={styles.leftLabel}>
              <div className={styles.labelTitle}>{t('profilePicture') || 'Your photo'}</div>
              <div className={styles.subDescription}>
                {t('thisWillBeDisplayedOnYourProfile') || 'This will be displayed on your profile.'}
              </div>
            </Col>
            <Col xs={24} sm={16} md={16} lg={12}>
              <div className={styles.photoUpload}>
                <div className={styles.currentPhoto}>
                  <Spin spinning={isUpdating}>
                    <img 
                      src={profilePic?.url || "/images/user-placeholder.png"} 
                      alt="Current profile" 
                      className={styles.profileAvatar} 
                    />
                  </Spin>
                </div>
                <div className={styles.uploadArea}>
                  <ImgCrop
                    aspect={1}
                    grid
                    quality={0.9}
                    modalTitle={t('cropProfilePicture') || 'Crop Profile Picture'}
                    modalOk={t('ok') || 'OK'}
                    modalCancel={t('cancel') || 'Cancel'}
                  >
                    <Upload.Dragger {...uploadProps} className={styles.uploadDragger}>
                      <div className={styles.draggerInner}>
                        <div className="ant-upload-drag-icon">
                          <img src='/images/upload-cloud-02.svg' alt='Upload' />
                        </div>
                        <div className="ant-upload-text">
                          <span>{t('clickToUpload') || 'Click to upload'}</span> {t('orDragAndDrop') || 'or drag and drop'}
                        </div>
                        <div className="ant-upload-hint">
                          {t('imageFileFormats') || 'SVG, PNG, JPG or GIF (max. 800×400px)'}
                        </div>
                      </div>
                    </Upload.Dragger>
                  </ImgCrop>
                </div>
              </div>
            </Col>
          </Row>

    

          {/* Action Buttons */}
          <Row gutter={[24, 0]}>
            <Col xs={0} sm={8} md={8} lg={7} />
            <Col xs={24} sm={16} md={16} lg={12}>
              <div className={styles.formActions}>
                <Button 
                  className={styles.cancelButton} 
                  onClick={() => {
                    form.setFieldsValue({ 
                      email, 
                      firstName, 
                      lastName, 
                      phone: profilePhone || phone 
                    });
                  }}
                >
                  {t('cancel') || 'Cancel'}
                </Button>
                <Button type="primary" htmlType="submit" className={styles.saveButton} loading={loading}>
                  {t('save') || 'Save'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

export default SettingsProfile;
