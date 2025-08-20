import ImgCrop from 'antd-img-crop'
import toast from 'react-hot-toast'
import { Upload, Button, Avatar } from 'antd'
import React, { useEffect, useState, useRef } from 'react'
import { serverUrl } from 'apis/sharedApi'
import { Types, action } from 'utils/helper'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

const ProfileDP = () => {
  const { t } = useTranslation()

  const uploadRef = useRef(null)
  const dispatch = useDispatch()
  const [profilePic, setProfilePic] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)
  const { profilePic: ProfilePicSrc, _id: currentUserId } = useSelector((state) => state.app.user_profile)

  useEffect(() => {
    if (ProfilePicSrc) {
      setProfilePic({
        uid: '-1', name: 'image.png', status: 'done',
        url: serverUrl + ProfilePicSrc,
      })
    }
  }, [ProfilePicSrc])

  const onPreview = async () => {

    const src = profilePic?.url
    if (src) {
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };

  const onSuccess = (file) => {
    if (file?.success) {
      setIsUpdating(false)
      toast.success(t('profilePictureHasBeenUpdated'))
      dispatch(action(Types.UPDATE_PROFILE, { profilePic: file?.data?.profilePic }))
    }
  };

  const beforeUpload = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.height > 350 || img.width > 350) {
          // Instead of rejecting, resize the image automatically
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions maintaining aspect ratio
          const maxSize = 350;
          let { width, height } = img;
          
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
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new file with resized image
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              
              URL.revokeObjectURL(objectUrl);
              setIsUpdating(true);
              toast.success(t('imageResizedAutomatically') || 'Image has been automatically resized to fit requirements');
              resolve(resizedFile); // return the resized file
            } else {
              URL.revokeObjectURL(objectUrl);
              reject(false);
            }
          }, file.type, 0.9); // 0.9 quality for JPEG compression
        } else {
          URL.revokeObjectURL(objectUrl);
          setIsUpdating(true);
          resolve(file); // return original file if within limits
        }
      };

      img.onerror = () => {
        toast.error(t('invalidImageFile'));
        URL.revokeObjectURL(objectUrl);
        reject(false);
      };

      img.src = objectUrl;
    });
  };

  const onError = (err) => {
    setIsUpdating(false)
    toast.error(t('profilePictureWasFailedToUpdate'))
  };

  return (
    <div className='mb-16'>
      <ImgCrop
        aspect={1}
        grid
        quality={0.9}
        modalTitle={t('cropProfilePicture') || 'Crop Profile Picture'}
        modalOk={t('ok') || 'OK'}
        modalCancel={t('cancel') || 'Cancel'}
      >
        <Upload
          action={`${serverUrl}/app/profile-pic?userId=${currentUserId}`}
          maxCount={1}
          beforeUpload={beforeUpload}
          onSuccess={onSuccess}
          onError={onError}
          className='upload-list-inline'
          withCredentials={true}
          fileList={isUpdating ? [profilePic] : []}  // Set fileList based on isUpdating
          accept={['image/png', 'image/jpeg', 'image/jpg']}
        >
          <div ref={uploadRef}></div>
          <div className="flex upload-container settings-profile settings-profile-input">
            <div className="profile-picture mr-20" style={{ background: `url('${profilePic?.url}') lightgray 50% / cover no-repeat` }}></div>
            <div className='ant-upload-wrapper'>
              <div className='ant-upload ant-upload-drag flex'>
                <div className='ant-upload-drag-container w-full'>
                  <div className="ant-upload-drag-icon">
                    <img src='/images/upload-cloud-02.svg' alt="Upload" />
                  </div>
                  <div className="ant-upload-text"><span>{t('clickToUpload')}</span> {t('orDragAndDrop')}</div>
                  <div className="ant-upload-hint">SVG, PNG, JPG {t('or')} GIF</div>
                  <div className="ant-upload-hint">{t('maxHeight')} 350px</div>

                </div>
              </div>
            </div>
          </div>

        </Upload>
      </ImgCrop>
    </div>
  );
};
export default ProfileDP;