import React from "react";
import {theme} from 'antd';
import { Slider, Stack } from "@mui/material";
const {useToken} = theme;
function SingleSettingView(props) {
    const {token} = useToken();
    
    const settingTitle = props.title;
    const settingDescription = props.description;
    const settingValue = props.value;
    const settingType = props.type;
    const settingOptions = props.options;
    const settingsChangeCallback = props.onChange;
    const [currentValue,setCurrentValue] = React.useState(settingValue);
    
    return (
        <div style={{backgroundColor:token.colorBgSpotlight,flex:1,padding:'2em',borderRadius:'1em'}}>
        <Stack direction='row' style={{flex:1,alignItems:'center',justifyContent:'space-between'}}>
            <Stack direction='column' spacing={0} style={{flex:1,alignItems:'flex-start'}}>
            <h3 style={{padding:'0em',margin:'0em'}}>{settingTitle}</h3>
            <p style={{padding:'0em',margin:'0em'}}>{settingDescription}</p>
            </Stack>
            { settingType === 'integer' &&
                <Stack direction='row' spacing={0} style={{flex:1,alignItems:'center',justifyContent:'flex-end'}}>
                    <Slider step={1}  min={settingOptions.min} value={currentValue} onChange={(e)=>setCurrentValue(e.target.value)} max={settingOptions.max} valueLabelDisplay="auto"  onChangeCommitted={(e)=>{props.onChange(currentValue)}} />
                </Stack>
            }
            </Stack>
        </div>
    )
}

export default SingleSettingView;
