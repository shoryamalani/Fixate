import React from 'react';
import { theme } from 'antd';
const {useToken} = theme;
function ContentDivUnstyled (props) {
    const {token} = useToken();
  return <div style={{...props.style,backgroundColor:token.colorBgElevated}} >{props.children}</div>;
}
export default ContentDivUnstyled;