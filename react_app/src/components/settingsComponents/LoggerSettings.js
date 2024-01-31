import React from "react";
import SingleSettingView from "./SingleSettingView";
import MobileAppConnection from "../mobile/MobileAppConnection";

function LoggerSettings(props) {

    return (
        <div style={{width:'100%'}}>
            <h2>Mobile Controls</h2>
            <MobileAppConnection/>
            <h2 >Logger Controls</h2>
        <SingleSettingView value={0} onChange={(e)=>{console.log(e)}} title="Closing Time" description="The number of seconds has to be active before the app is hidden" type="integer" options={{'min':0,'max':60}}/>
        </div>
    )
}

export default LoggerSettings;