import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setLogging,setClosingApps,setFocusMode} from '../features/LoggerSlice';
import { Grid, Input, LinearProgress, duration } from '@mui/material';
import { UserProfileCard } from '../components/UserProfileCard';
import { Line, Pie } from 'react-chartjs-2';
import { Refresh } from '@mui/icons-material';
function FrontPage() {
  const logging = useSelector(state => state.logger.logging);
  const closingApps = useSelector(state => state.logger.closingApps);
  const currentFocusMode = useSelector(state => state.logger.currentFocusMode);
  const dispatch = useDispatch();
  const [pieChartData, setPieChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const fetchTimeSpentConstrained = async (time_constraint,taskId=null) => {
    var data = {}
    if(taskId){
      data = {
        "id": taskId,
        "time": time_constraint
      }
    }else{
      data = {
        "time": time_constraint
      }
    }
    const response = await fetch('http://localhost:5005/get_time_log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => response.json()
    ).then(data => {
      console.log(data)
      setPieChartData({
        labels: Object.keys(data['time']).map((i) => i), 
        datasets: [
          {
            label: "Time Spent",
            data: Object.keys(data['time']).map((i) => data['time'][i]/60),
            borderColor: "black",
            backgroundColor:Object.keys(data['time']).map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
            borderWidth: 0
          }
        ]
      })
      setLineChartData({
        labels: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => i),
        datasets: [
          {
            label: "Distractions",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => data['distractions']['distracted_percentage_over_time'][i]['distractions']),
            borderColor: "yellow",
            backgroundColor: "yellow",
            borderWidth: 2,
            yAxisID: 'A',
          },
          {
            label: "Percent Distracted",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['distracted']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
            borderColor: "red",
            backgroundColor: "red",
            borderWidth: 2,
            yAxisID: 'B',
          },
          {
            label: "Percent Focused",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['focused']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
            borderColor: "green",
            backgroundColor: "green",
            borderWidth: 2,
            yAxisID: 'B',

          }
          
          
        ],
        options: {
          scales: {
            A: {
              type: 'linear',
              position: 'left'
            }, 
            B:{
              type: 'linear',
              position: 'right',
            }
          }
        }
      })
    // console.log(
    //   {
    //     labels: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => i),
    //     datasets: [
    //       {
    //         label: "Distractions",
    //         data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => data['distractions']['distracted_percentage_over_time'][i]['distractions']),
    //         borderColor: "black",
    //         borderWidth: 2
    //       },
    //       {
    //         label: "Percent Distracted",
    //         data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['distracted']/(data['distractions']['distracted_percentage_over_time'][i]['not_distracted']+data['distractions']['distracted_percentage_over_time'][i]['distracted']))),
    //         borderColor: "black",
    //         borderWidth: 2
    //       },
          
    //     ]
    //   }
    // )
    
    // console.log({
    //   labels: data['time'].map((i) => i[0]), 
    //   datasets: [
    //     {
    //       label: "Time Spent",
    //       data: data['time'].map((i) => i[1]/60),
    //       borderColor: "black",
    //       backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
    //       borderWidth: 2
    //     }
    //   ]
    // })
    return data;
    }).catch(error => {console.log(error)});
    
  }
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
  useEffect(() => {
    fetchTimeSpentConstrained("today")
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
    <div style={css.mainContent}>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      <h1 style={css.h1}>Fixate</h1>
    <Stack direction="row" spacing={3} style={css.body}>
      <Stack direction="column" spacing={3} > {/* make this column start from the top*/}
      {pieChartData && 
        <Stack direction='column' spacing={3} style={{alignItems:'center'}}>
        <h2>How you have spent today</h2>
        <Button variant='contained' color='success' style={{maxWidth:'3em'}} onClick={() => {fetchTimeSpentConstrained("today")}}><Refresh></Refresh></Button>
        <div style={{...css.contrastContent,margin: '0em',padding:0,minWidth:'100%', aspectRatio:1}} > 
        {/* make the width the same as the height */}

          
        <Pie data={pieChartData}
        id = "pieChart"
        options={{
          plugins: {
            title: {
              display: true,
              text: "Minutes Spent per App",
              
            }
            
          }
        
        }} />
        </div>
        </Stack>
        }
        {lineChartData &&
        <div style={{...css.contrastContent,margin: '0em',padding:0,minWidth:'30%'}} >
        <Line data={lineChartData}
        id = "lineChart"
        options={{
          plugins: {
            title: {
              display: true,
              text: "Distractions Over Time",
            }
          }
        }} /></div>
        }

        <>
    {currentFocusMode['status'] === false ?
    <>
    <h2 style={css.h1}>Server Controls</h2>
      
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
    </>
    </Stack>
    <div style={css.contrastContent}>
      {/* This is a user profile box where users can set their display name and find a share button for friends */}
      <UserProfileCard></UserProfileCard>

    </div>
    </Stack>
    </div>
  )
}

export default FrontPage
