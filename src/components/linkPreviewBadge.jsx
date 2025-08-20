import { Avatar, Tag } from 'antd';
import { serverUrl } from '../apis/sharedApi'

function LinkPreviewBadge(data) {
  return <span className={data?.active === false && 'user inactive'} style={{display:'flex', alignItems:'center', padding:'5px 0'}}>
    <Avatar className='avatar' shape="circle" size={40} src={<img src={serverUrl+data?.pic} alt="avatar" />} />
    <span style={{display:'flex', flexDirection:'column', marginLeft:10}}>
      <span>{data?.name}</span>
      <span className='user-link' style={{color:'#9b9999', fontSize:13}}> <a target="_blank" rel="noreferrer" href={data?.url}>{data?.url}</a></span>
    </span>
  </span>
}

export default LinkPreviewBadge;