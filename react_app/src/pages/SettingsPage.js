import React from "react";
import ContentDiv from "../components/ContentDiv";
import LoggerSettings from "../components/settingsComponents/LoggerSettings";

const SettingsPage =() => {

    return (
        <div style={{
            height:'100%',
            width:'100%',
        }}>
        <p style={{
            color:'white',
            fontSize: 44,
            fontWeight: 'bold',
            textAlign: 'center',
        }}>Settings</p>
        <ContentDiv style={{
            display:'flex',
            flexDirection:'column',
            justifyContent:'center',
            alignItems:'center',
            height:'100%',
        }}>

            <LoggerSettings></LoggerSettings>
            </ContentDiv>
    </div>
        );
}

export default SettingsPage;