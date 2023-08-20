import { Button, TextField } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import ContentDiv from "../ContentDiv";
import { Space } from "antd";
import { Add } from "@mui/icons-material";



const AppList = (props) => {
    console.log(props.apps)
    const appList = props.apps['apps']; // dictionary of apps
    const [updateTimer, setUpdateTimer] = React.useState(null);
    // const [searchText, setSearchText] = React.useState('');
    const [relevantApps, setRelevantApps] = React.useState([]);
    // for (const [key, value] of Object.entries(appList)) {
    //     console.log(key, value);
    // }
    function updateRelevantApps(){
        console.log("updating relevant apps")
        var searchText = document.getElementById('searchTextField').value;
        if(searchText.length > 0){
            var rApps = [];
            for (const [key, value] of Object.entries(appList)) {
                if(value['name'].toLowerCase().includes(searchText.toLowerCase())){
                    rApps.push(value);
                }
            }
            setRelevantApps([...rApps]);
        }

            
    }

    return (
        <>
        <ContentDiv style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div>
            <p style={{textAlign:'center'}}>App Search</p>
            <TextField onChange={
                (e) => {
                    clearTimeout(updateTimer);
                    setUpdateTimer(setTimeout(updateRelevantApps, 240));
                    
                }
            } id="searchTextField" ></TextField>
        </div>
        <div>
            {
                relevantApps.map((app,index) => {
                    return (

                        <Button variant='contained' id={index} style={{padding:'1em',borderRadius:'1em',background:'black',margin:'.1em',display:'flex',alignItems:'center',alignContent:'center',width:'100%'}} onClick={
                            () => {
                                props.addApp(app)
                                


                            }
                            }
                            >
                            { app['icon'] &&
                            <img style={{height:'100%',width:'2em',aspectRatio:1,verticalAlign:'center'}} src={"http://127.0.0.1:5005/images?path="+app['icon']} alt="App logo"></img>
                }
                            <p style={{verticalAlign:'top',textAlign:'center',flex:1}}>{app['name']}</p>
                            <Add></Add>
                        </Button>
                    )
                }
                )
            }
        </div>
        </ContentDiv>
        </>
        
    )
}

export default AppList;