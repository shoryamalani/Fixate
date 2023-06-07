import React, { useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setLogging,setClosingApps} from '../features/LoggerSlice';
import { Grid } from '@mui/material';
function FrontPage() {
  const logging = useSelector(state => state.logger.logging);
  const closingApps = useSelector(state => state.logger.closingApps);
  const dispatch = useDispatch();
  // const [logging, setlogging] = useState(false);
  // const [closingApps, setclosingApps] = useState(false);
  setInterval(function () {
      fetch('http://127.0.0.1:5005/logger_status').then(response => response.json()).then(data => {
        console.log(data);
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
        console.log(logging)
        console.log(closingApps)
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
    }, 2000)

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
  return (
    <div>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
      <h1 style={css.h1}>Server Controls</h1>
    <Stack direction="row" spacing={3} style={css.body}>
      <div style={css.contrastContent}>
      <Button style={{margin:5}} variant='contained' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>{logging ? 'Stop': 'Start'} Server</span></Button>
      <Button style={{margin:5}} variant='contained' color={closingApps ? 'success': 'error'} onClick={toggle_blocking}><span>{closingApps ? 'Stop': 'Start'} blocking</span></Button>
      {/* <Button variant='contained' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>Start Server</span></Button> */}
      <Button style={{margin:5}} variant='contained' color='error' onClick={restart_server}><span>Restart Server</span></Button>
      </div>
    </Stack>
    <div style={css.contrastContent}>
    <p>
      When the server is running, it will automatically start logging data about what applications you are using. <br></br>
      This data is stored locally on your computer and is not sent anywhere. <br></br>
      If you want to start blocking apps from running, click the "Start Blocking" button. <br></br>
      You can stop the server at any time by clicking the "Stop Server" button.

    </p>
    </div>
    </div>
  )
}

export default FrontPage
