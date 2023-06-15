import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setLogging,setClosingApps,setFocusMode} from '../features/LoggerSlice';
import { Grid, Input, LinearProgress, duration } from '@mui/material';
import { UserProfileCard } from '../components/UserProfileCard';
function FrontPage() {
  const logging = useSelector(state => state.logger.logging);
  const closingApps = useSelector(state => state.logger.closingApps);
  const currentFocusMode = useSelector(state => state.logger.currentFocusMode);
  const dispatch = useDispatch();
  // const [logging, setlogging] = useState(false);
  // const [closingApps, setclosingApps] = useState(false);
  useEffect(() => {
  setInterval(function () {
      fetch('http://127.0.0.1:5005/logger_status').then(response => response.json()).then(data => {
        if (data['logger_running_status'] === true) {
          dispatch(setLogging(true))
        } else {
          dispatch(setLogging(false))
        }
        if (data['closing_apps'] === true) {
          dispatch(setClosingApps(true))
        } else {
          dispatch(setClosingApps(false))
        }
        if (data['in_focus_mode']['status'] === true) {
          dispatch(setFocusMode(data['in_focus_mode']))
        } else {
          dispatch(setFocusMode({status:false}))
        }
        // if (data['closing_apps'] == true && data['logger_running_status'] == true) {
        //   document.getElementById("closing_app_status").innerText = "Closing apps is enabled"
        //   document.getElementById("toggle_closing_apps").classList = ["float-child-element button-error"]
        //   document.getElementById("toggle_closing_apps").value = "Disable Closing Apps"
        // } else {
        //   document.getElementById("closing_app_status").innerText = "Closing apps is disabled"
        //   document.getElementById("toggle_closing_apps").classList = ["float-child-element button-success"]
        //   document.getElementById("toggle_closing_apps").value = "Enable Closing Apps"
        // }
      }).catch(error => {
        console.log(error);
      }
      )
    }, 1000)
  }, [])

  function start_logger() {
    console.log("clicked starting logger")
    fetch(`http://127.0.0.1:5005/start_logger`).then(response => response.json()).then(data => {console.log(data);} ).catch(error => {});
  }

  function stop_logger() {
    console.log("Stopping logger")
    fetch(`http://127.0.0.1:5005/stop_logger`)
  }

  function restart_server(){
    fetch("http://127.0.0.1:5005/kill_server")
  }

  function toggle_blocking(){
    if(!closingApps){
      start_logger()
    }
    fetch(`http://127.0.0.1:5005/toggle_closing_apps`)
  }
  function stopFocusMode(){
    fetch(`http://127.0.0.1:5005/stop_focus_mode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "id": currentFocusMode['id']
      })

    }).catch(error => {console.log(error)})
  }
  return (
    <div>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
    {currentFocusMode['status'] == false ?
    <>
      <h1 style={css.h1}>Server Controls</h1>
    <Stack direction="row" spacing={3} style={css.body}>
      <div style={css.contrastContent}>
      <Button style={{margin:5}} variant='contained' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>{logging ? 'Stop': 'Start'} Server</span></Button>
      <Button style={{margin:5}} variant='contained' color={closingApps ? 'success': 'error'} onClick={toggle_blocking}><span>{closingApps ? 'Stop': 'Start'} blocking</span></Button>
      {/* <Button variant='contained' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>Start Server</span></Button> */}
      <Button style={{margin:5}} variant='contained' color='error' onClick={restart_server}><span>Restart Server</span></Button>
      </div>
    </Stack>
    </>
    :
    <>
      <div style={css.contrastContent}>
    <Stack direction="column" spacing={3} style={css.body}>
    <h1 style={css.h1}>Focus Mode</h1>
    <LinearProgress style={{minWidth:'30em'}} variant="determinate" value={(100*((parseInt(currentFocusMode['Time Elapsed'].split(":")[0])  +parseInt((currentFocusMode['Time Elapsed'].split(":")[1]))/60)/currentFocusMode["Duration"]))}/>
        {/* stop focus mode button */}
        <p>There is {currentFocusMode["Time Remaining"]} on the clock for the focus mode: {currentFocusMode["Name"]}</p>
        <p>{currentFocusMode["Duration"]} minute focus mode </p>
        <Button style={{margin:5}} variant='contained' color='error' onClick={stopFocusMode}><span>Stop Focus Mode</span></Button>
    </Stack>
        </div>
    </>
    }
    <div style={css.contrastContent}>
    <p>
      When the server is running, it will automatically start logging data about what applications you are using. <br></br>
      This data is stored locally on your computer and is not sent anywhere. <br></br>
      If you want to start blocking apps from running, click the "Start Blocking" button. <br></br>
      You can stop the server at any time by clicking the "Stop Server" button.

    </p>
    </div>
    <div style={css.contrastContent}>
      {/* This is a user profile box where users can set their display name and find a share button for friends */}
      <UserProfileCard></UserProfileCard>

    </div>
    </div>
  )
}

export default FrontPage
