import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setLogging,setClosingApps,setFocusMode,setWhitelist,setWorkflow, setShowGetChromeExtension} from '../features/LoggerSlice';
import { Grid, Input, LinearProgress, colors, duration, useTheme } from '@mui/material';
import { UserProfileCard } from '../components/UserProfileCard';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Refresh } from '@mui/icons-material';
import { DailyTasks } from '../components/DailyTasks';
import { ProgressBars } from '../components/ProgressBars';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { justifyItems } from '@xstyled/styled-components';
import { clearWorkflowData } from '../features/AppSlice';
function FrontPage() {
  const logging = useSelector(state => state.logger.logging);
  const closingApps = useSelector(state => state.logger.closingApps);
  const currentFocusMode = useSelector(state => state.logger.currentFocusMode);
  const dispatch = useDispatch();
  const [pieChartData, setPieChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const whitelist = useSelector(state => state.logger.whitelist);
  const workflow = useSelector(state => state.logger.workflow);
  const showGetChromeExtension = useSelector(state => state.logger.showGetChromeExtension);
  // const [showGetChromeExtension, setShowGetChromeExtension] = useState(false);
  const updateHasChromeExtension = () => {
    fetch('http://localhost:5005/check_chrome_extension_installed').then(response => response.json()).then(data => {
      console.log(data)
      if (data['status'] === true) { 
        dispatch(setShowGetChromeExtension(false))
      } else {
        dispatch(setShowGetChromeExtension(true))
      }
    }).catch(error => {console.log(error)});
  }
  useEffect(() => {
    updateHasChromeExtension()
  },[])


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
      var all_lookaway_apps = []
      for (var key in data['distractions']['lookaway_apps']) {
        all_lookaway_apps.push([key,data['distractions']['lookaway_apps'][key]])
      }
      all_lookaway_apps.sort((a,b) => b[1]-a[1])
      setBarChartData({
        labels: all_lookaway_apps.map((i) => i[0]).slice(0,3),
        // labels: Object.keys(data['distractions']['lookaway_apps']).map((i) => i),
        datasets: [
          {
            label: "Apps",
            data: all_lookaway_apps.map((i) => i[1]).slice(0,3),
            borderColor: "black",
            backgroundColor:Object.keys(data['distractions']['lookaway_apps']).map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
            borderWidth: 0
          }
        ],
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
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
        console.log(data)
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
        if (data['whitelist'] !== undefined) {
          dispatch(setWhitelist(data['whitelist']))
        }
        if (data['workflow'] !== undefined) {
          dispatch(setWorkflow(data['workflow']['id']))
          console.log(data['workflow'])
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
  function toggle_white_list(){
    if(!closingApps){
      start_logger()
    }
    fetch(`http://127.0.0.1:5005/toggle_white_list`)
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

  // const  setWorkflow =  => (workflow_id) =>{
  //   fetch(`http://127.0.0.1:5005/set_workflow`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       "workflow_id": workflow_id
  //     })
  //   }).catch(error => {console.log(error)})
  // }
  function set_new_workflow(workflow_id){
    fetch(`http://127.0.0.1:5005/set_workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "workflow_id": workflow_id
      })})
      .then(response => response.json()).then(data => {
        console.log("SETTING WORKFLOW")
        console.log(data);
        dispatch(clearWorkflowData())
      } ).catch(error => {});
    
  }

  return (
    <div style={{
      ...css.mainContent,
      maxWidth: '100%',
      justifyContent:'center',
      justifyItems:'center'
    }}>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      <h1 style={css.h1}>Fixate Dashboard</h1>
    <Stack direction="row" spacing={3}>
      <Stack direction="column" spacing={3} style={{flex:0,height:'fit-content'}} > {/* make this column start from the top*/}
      {/* <h1 style={css.h1}>Tasks</h1> */}
      
    <div style={css.contrastContent}>
      <DailyTasks showAllTasks={false}> </DailyTasks>
    </div>
        <>
       
    
{/* 
    <div style={css.contrastContent}>
    <p>
      When the server is running, it will automatically start logging data about what applications you are using. <br></br>
      This data is stored locally on your computer and is not sent anywhere. <br></br>
      If you want to start blocking apps from running, click the "Start Blocking" button. <br></br>
      You can stop the server at any time by clicking the "Stop Server" button.
    </p>
    </div> */}
    </>
    </Stack>
    {/* {Tasks in general} */}
    <Stack direction="column" spacing={3} style={{flex:0,height:'fit-content'}} >
    <Stack direction="row"> 
    <div style={{...css.contrastContent,width:'20vw',maxWidth:'20vw'}}>
      <Stack direction="column" spacing={0}>
      <h1 style={css.h1}>Progress Orbits</h1>
      <ProgressBars></ProgressBars>
      </Stack>
      </div>
      <Stack direction="column" spacing={0} style={{flex:0,height:'fit-content',padding: '1em'}}>
          <Stack direction="column" spacing={0}>
      <div style={{...css.contrastContent,flex:0,height:'fit-content',padding: '1em'}}>
    <Stack direction="column" spacing={3}>
    <h1>Workflows</h1>
    <Stack direction="row" spacing={3}>
    <Button style={{margin:5}} variant='contained' color={workflow === 1 ? 'success': 'error'} onClick={()=>{set_new_workflow(1)}}><span>Work</span></Button>
      <Button style={{margin:5}} variant='contained' color={workflow === 2 ? 'success': 'error'} onClick={()=>{set_new_workflow(2)}}><span>Custom</span></Button> 
      </Stack>
      </Stack>
      

    
    </div>
    {barChartData  &&
    <div style={{...css.contrastContent,flex:0,height:'fit-content',padding: '1em'}}>
      <Bar data={barChartData} options={{
        plugins: {
          title: {
            display: true,
            text: 'Lookaways per App'
          }
        }
      }}></Bar>

    </div>
      }
          </Stack>
    </Stack>
    </Stack>
    {currentFocusMode['status'] === false ?
    <>
   
    <h2 style={css.h1}>Logger Controls</h2>
    { showGetChromeExtension ?
    <div style={{...css.contrastContent,backgroundColor:'#d1495b'}}>
      <Stack direction="column" spacing={3}>
      <h3>The chrome extension may not be installed and is needed to look </h3>
      <Button variant='contained' color='success' href="https://chrome.google.com/webstore/detail/fixate-chrome-logging/dclacnkepgdedfggmjoeidejfbdoekal?authuser=1?authuser=1&gclid=Cj0KCQjwkqSlBhDaARIsAFJANkiMaT5n2IcZOOxfWBBf3raN6Kzj6uvlEp7u58ZrRt5sBUPiP9ctPMUaAubSEALw_wcB" target="_blank" rel="noreferrer">Get Chrome Extension</Button>
      <Button variant='contained' color='success' onClick={()=>{updateHasChromeExtension()}}>Check for the Extension again</Button>
      </Stack>
    </div>:
    <></>
      }
      <div style={css.contrastContent}>
    <Grid2 direction="row" spacing={3}>
      <Button style={{margin:5}} variant='contained' color={logging ? 'error': 'success'} onClick={logging ? stop_logger : start_logger}><span>{logging ? 'Stop': 'Start'} Logger</span></Button>
      <Button style={{margin:5}} variant='contained' color={closingApps ? 'error': 'success'} onClick={toggle_blocking}><span>{closingApps ? 'Stop': 'Start'} blocking</span></Button>
      <Button style={{margin:5}} variant='contained' color={whitelist ? 'error': 'success'} onClick={toggle_white_list}><span>{whitelist ? 'Stop': 'Start'} focused apps only</span></Button>
      {/* <Button variant='contained' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>Start Server</span></Button> */}
      <Button style={{margin:5}} variant='contained' color='error' onClick={restart_server}><span>Restart Logger</span></Button>
    </Grid2>
      </div>

    </>
    :
    <>
      <div style={css.contrastContent}>
    <Stack direction="column" spacing={3}>
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
    
    </Stack>



    </Stack>
    </div>
  )
}

export default FrontPage
