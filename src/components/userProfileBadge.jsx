import { Avatar, Tag } from 'antd';
import { serverUrl } from '../apis/sharedApi'
import { useTranslation } from 'react-i18next';


function UserProfileBadge(data) {
  //const { t } = useTranslation();
  const getInitials = (str) => {
    return str
      .split(" ") // Split into words
      .filter(word => /^[a-zA-Z]+$/.test(word)) // Only keep words with letters
      .slice(0, 2) // Get only first 2 words
      .map(word => word[0].toUpperCase()) // Extract first letter & uppercase
      .join("");
  };
  const url = serverUrl + data?.profilePic;
  return <span className={data?.active === false && 'user inactive'} style={{ display: 'flex', alignItems: 'center', padding: '5px 0' }}>
    {url.includes("avatar-default.png") || url === '' || url === null ?
      <div className='default-avatar'>{getInitials(data?.firstName + '' + data?.lastName)}</div>
      :
      <Avatar className='avatar' shape="circle" size={32} src={<img src={serverUrl + data?.profilePic} alt="avatar" />} />
    }
    <span style={{ display: 'flex', flexDirection: 'column', marginLeft: 12 }}>
      <span><span className='user-name'>{`${data?.firstName || ''} ${data?.lastName || ''}`}</span> {data?.active === false && <Tag bordered={false} color="error"> Inactive </Tag>}</span>
      <span className='user-email'>{data?.email}</span>
    </span>
  </span>
}

export default UserProfileBadge;