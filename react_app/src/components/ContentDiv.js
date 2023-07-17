import React from 'react';
import { theme } from 'antd';
const {useToken} = theme;
function ContentDiv (props) {
    const {token} = useToken();
  return <div style={{...props.style,fontFamily: 'Manrope',fontSize:18,backgroundColor:token.colorBgElevated,color:token.colorText,borderRadius:'3em',margin:'1em',padding:'2em'}} >{props.children}</div>;
}
export default ContentDiv;