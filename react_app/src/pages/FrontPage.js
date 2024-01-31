import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setLogging,setClosingApps,setFocusMode,setWhitelist,setWorkflow, setShowGetChromeExtension, setRingsData, setCurrentImprovement, setImprovementData} from '../features/LoggerSlice';
import { Alert, AlertTitle, Avatar, Divider, Grid, Input, LinearProgress, Skeleton, colors, duration, useTheme } from '@mui/material';
import { UserProfileCard } from '../components/UserProfileCard';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { BrowseGallery, ContentPasteTwoTone, Refresh, VisibilityOutlined } from '@mui/icons-material';
import { DailyTasks } from '../components/DailyTasks';
import { ProgressBars } from '../components/progressOrbits/ProgressBars';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { justifyItems, marginBottom } from '@xstyled/styled-components';
import { clearWorkflowData } from '../features/AppSlice';
import ConfettiExplosion from 'confetti-explosion-react';
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import {theme} from 'antd'
import ContentDiv from '../components/ContentDiv';
import { Store } from 'react-notifications-component';
import ContentDivUnstyled from '../components/ContentDivUnstyled';
import ContextualHelp from '../components/ContextualHelp';
// import {Button} from 'antd'
const {useToken} = theme;
var ipcRenderer = window.require('electron').ipcRenderer;
function instantGratification( fn, delay ) {
  fn();
  setInterval( fn, delay );
}
function FrontPage() {
  const logging = useSelector(state => state.logger.logging);
  const closingApps = useSelector(state => state.logger.closingApps);
  const currentFocusMode = useSelector(state => state.logger.currentFocusMode);
  const improvementData = useSelector(state => state.logger.improvementData);
  const currentImprovement = useSelector(state => state.logger.currentImprovement);
  const dispatch = useDispatch();
  const [pieChartData, setPieChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [inFocusMode, setInFocusMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const whitelist = useSelector(state => state.logger.whitelist);
  const workflow = useSelector(state => state.logger.workflow);
  const showGetChromeExtension = useSelector(state => state.logger.showGetChromeExtension);
  const taskDataRef = React.useRef();
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

  
  // const [logging, setlogging] = useState(false);
  // const [closingApps, setclosingApps] = useState(false);
  const pickCurrentImprovement = () => {
    console.log(improvementData)
    if (improvementData === null) {
      return;
    }
    if(improvementData.length > 0){
      var picked = Math.floor(Math.random() * improvementData.length);
      dispatch(setCurrentImprovement(improvementData[picked]))
      dispatch(setImprovementData(improvementData.filter((_, i) => i !== picked)))
    }
    
  }

  useEffect(() => {
  instantGratification(function () {
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
          console.log(currentFocusMode)
          setInFocusMode(true)
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
        if (data['rings'] !== undefined) {
          dispatch(setRingsData(data['rings']))
        }
      }).catch(error => {
        console.log(error);
      }
      )
    }, 1000)
  }, [])
  useEffect(() => {
    instantGratification(() => {
      const fetchImprovementsData = async () => {
        const response = await fetch('http://localhost:5005/get_improvements_data').then(response => response.json()).then(data => {
          console.log(data)
          data = data['improvement_data']
          return data;
        }).then(data => {
          console.log(data)
          var final_improvements_data = []
          for (var key in data) {
            var improvement = data[key]
            // make sure no period of time is more than 10 times the time of the other
            if(improvement['period_1_time'] > 10*improvement['period_2_time'] || improvement['period_2_time'] > 10*improvement['period_1_time']){
              continue;
            }
            //  if the improvement is less than 10 minutes, don't show it
            if(improvement['period_1_time'] < 600 || improvement['period_2_time'] < 600){
              continue;
            }
            if(improvement['all_deltas'] !== undefined){
            console.log(improvement['all_deltas']['lookaway_deltas'])
            improvement['all_deltas']['lookaway_deltas'].forEach((element) => {
                if(element['delta_percent'] < -5.0) {
                  final_improvements_data = [...final_improvements_data,[improvement['period_1_name'] + ", you switched your focus from apps to  " + element['app_name'] + " " + -Math.round(element['delta_percent']) + "% less than you did "+ improvement['period_2_name'].toLowerCase(),element['app_name']]]
                }
            });
            improvement['all_deltas']['usage_deltas'].forEach((element) => {
              if(element['delta_percent'] < -5.0) {
                // final_improvements_data.push([improvement['period_1_name'] + ", you used " + element['app_name'] + " " + -Math.round(element['delta_percent']) + "% less than you were " + improvement['period_1_name'] + " than " + improvement['period_2_name'],element['app_name']])
                final_improvements_data = [...final_improvements_data,[improvement['period_1_name'] + ", you used " + element['app_name'] + " " + -Math.round(element['delta_percent']) + "% less than you did " + improvement['period_2_name'].toLowerCase(),element['app_name']]]
              } else if (element['delta_percent'] > 5.0){
                final_improvements_data = [...final_improvements_data,[improvement['period_1_name'] + ", you used " + element['app_name'] + " " + Math.round(element['delta_percent']) + "% more than you did " + improvement['period_2_name'].toLowerCase(),element['app_name']]]
              }
            });
            if (improvement['all_deltas']['distractions_delta'] < -5.0) {
              final_improvements_data.push([improvement['period_1_name'] + ", you switched your focus from apps to " + -Math.round(improvement['all_deltas']['distractions_delta']) + "% less than you did " + improvement['period_2_name'].toLowerCase(),"__clock__"])
            }
            if (improvement['all_deltas']['lookaway_delta_percent'] < -5.0) {
              final_improvements_data.push([improvement['period_1_name'] + ", you were distracted " + -Math.round(improvement['all_deltas']['lookaway_delta_percent']) + "% less than you did " + improvement['period_2_name'].toLowerCase(),"__eyes__"])
            }
          }

            // GET ICON
            if(final_improvements_data.length !== 0){
            var picked = Math.floor(Math.random() * final_improvements_data.length);

            
            // dispatch(setCurrentImprovement(final_improvements_data[picked]))
            // dispatch(setImprovementData(final_improvements_data))
            pickCurrentImprovement()
            }
            


          }
          if(Store.getCounter() === 0){
          Store.addNotification({
            title: "Great Job!",
            message: final_improvements_data[picked][0],
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 8000,
              onScreen: true
            }
          });
          }
        })
        
        return response;
      }
      fetchImprovementsData()
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
        function componentToHex(c) {
          var hex = c.toString(16);
          return hex.length == 1 ? "0" + hex : hex;
        }
        
        function rgbToHex(r, g, b) {
          return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
          var final_data = []
          var distracting_apps = []
          var neutral_apps = []
          var focused_apps = []
          for (var key in data['time']) {
            // console.log(key)
            // console.log(data['relevant_distractions'])
            if(data['relevant_distractions'].includes(key)){
              // generate a random red
              distracting_apps.push([key,data['time'][key],rgbToHex(Math.floor(Math.random() * 100) + 150,Math.floor(Math.random() * 100),Math.floor(Math.random() * 100))])
            }else if (data['focused_apps'].includes(key)){
              // generate a random green
              focused_apps.push([key,data['time'][key],rgbToHex(Math.floor(Math.random() * 100),Math.floor(Math.random() * 100) + 150,Math.floor(Math.random() * 100))])
            } else {
              neutral_apps.push([key,data['time'][key],rgbToHex(Math.floor(Math.random() * 100),Math.floor(Math.random() * 100),Math.floor(Math.random() * 100) + 150)])
            }
          }
          distracting_apps.sort((a,b) => b[1]-a[1])
          focused_apps.sort((a,b) => b[1]-a[1])
          neutral_apps.sort((a,b) => b[1]-a[1])
          for (var key in focused_apps) {
            final_data.push(focused_apps[key])
          }
          for (var key in distracting_apps) {
            final_data.push(distracting_apps[key])
          }
          for (var key in neutral_apps) {
            final_data.push(neutral_apps[key])
          }
          console.log(final_data)
          setPieChartData({
            labels: final_data.map((i) => i[0]), 
            datasets: [
              {
                label: "Time Spent",
                data: final_data.map((i) => i[1]/60),
                borderColor: "black",
                backgroundColor:final_data.map((i) => i[2]),
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
                  position: 'left',
                }, 
                B:{
                  type: 'linear',
                  position: 'right',
                }
              }
            }
          })
        return data;
        }).catch(error => {console.log(error)});
      }
      fetchTimeSpentConstrained("today")
    }, 1000*60*5);
    }, [])
  if(currentFocusMode['status'] === false && inFocusMode === true){
    console.log("sending bring window front")
    ipcRenderer.send('bring-window-front',{})
    setInFocusMode(false)
    setShowConfetti(true)
    taskDataRef.current.refresh()
    setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
    
  }


  // useEffect(() => {
  //   fetchTimeSpentConstrained("today")
  // }, [])




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
  const token = useToken();
  console.log(token)
  return (
    <div style={{
      backgroundColor:token.token.colorBgContainer,
      justifyContent:'center',
      justifyItems:'center',
      width:'100%'
    }}>
      <Layout style={{width:'100%',backgroundColor:token.token.colorBgContainer}}>
      
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
    <Stack direction="row" spacing={3} style={{justifyItems:'center', justifyContent:'center',display:'flex',width:'100%'}}>
      <Stack direction="column" spacing={0} style={{justifyContent:'center',justifySelf:'center',height:'fit-content',width:'100%'}} > {/* make this column start from the top*/}
      {/* <div style={{...css.contrastContent}}> */}
      {/* <ContentDivUnstyled style={{padding:'0.5em',margin:'1em',borderRadius:'3em'}}> */}
        <Stack direction="row" spacing={3} style={{margin:0,justifyContent:'center',justifySelf:'center',padding:'0em'}} >
    <h1 style={{color:token.token.colorText,fontSize:44,padding:'0em'}} >Fixate Dashboard</h1>
      {/* <Button variant='outlined' color='success' style={{margin:'1em',height:'3em',alignSelf:'center',padding:'0em'}} onClick={() => {window.location.reload()}}><Refresh color='white'></Refresh></Button> */}
    </Stack>
    {/* </ContentDivUnstyled> */}
    {/* <Stack direction='row' spacing={2} style={{justifyContent:'center'}}>
            <h2>Todays Tasks</h2>
            <Button variant='outlined' color='success' style={{aspectRatio:1,height:'3vw',width:'3vw'}} > <Refresh  style={{aspectRatio:1}} color='white'/></Button>
            </Stack> */}
    {/* </div> */}
      {/* <h1 style={css.h1}>Tasks</h1> */}
      {currentFocusMode['status'] === false ?
    <>
   
    { showGetChromeExtension ?
    <div style={{...css.contrastContent,backgroundColor:'#d1495b'}}>
      
      <Stack direction="column" spacing={3}>
      <h3>The chrome extension may not be installed and is needed to look </h3>
      <Button variant='outlined' color='success' href="https://chrome.google.com/webstore/detail/fixate-chrome-logging/dclacnkepgdedfggmjoeidejfbdoekal?authuser=1?authuser=1&gclid=Cj0KCQjwkqSlBhDaARIsAFJANkiMaT5n2IcZOOxfWBBf3raN6Kzj6uvlEp7u58ZrRt5sBUPiP9ctPMUaAubSEALw_wcB" target="_blank" rel="noreferrer">Get Chrome Extension</Button>
      <Button variant='outlined' color='success' onClick={()=>{updateHasChromeExtension()}}>Check for the Extension again</Button>
      </Stack>
    </div>:
    <></>
      }
      
    <ContentDiv style={{...css.contrastContent,marginBottom:'0em',position:'relative'}}>
      <ContextualHelp title="Logger Controls">
      <p>Logger controls allow you to control what apps are hidden, as well as what data gets saved.</p>
      <p>Click the "Logger" button to start logging data about what applications you are using. When "Logger" is blue it is active</p>
      <p>Click the "Blocking" button to start blocking apps and websites that are considered distracting in your current workflow. When "Blocking" is red it is active</p>
      <p>Click the "Lockdown" button to start blocking all apps and websites except for those that are considered Focused in your current workflow. When "Lockdown" is red it is active</p>
      <p>Click the "Restart" button to restart the logger. This is useful if you are having issues with the logger.</p>
      <p>The workflow that is blue is the one that is active.</p>
         </ContextualHelp>
      <Stack direction="row" spacing={3} >
    <Stack direction="column" style={{display:'flex',alignItems:'center'}}  spacing={0} >
      <h2 style={{marginTop:'0em',marginBottom:'.5em'}}>Logger Controls</h2>

    <Grid2 direction="row" spacing={3}>
      <Button style={{margin:5}} variant='outlined' color={logging ? 'info': 'secondary'} onClick={logging ? stop_logger : start_logger}><span>Logger</span></Button>
      <Button style={{margin:5}} variant='outlined' color={closingApps ? 'error': 'secondary'} onClick={toggle_blocking}><span>blocking</span></Button>
      <Button style={{margin:5}} variant='outlined' color={whitelist ? 'error': 'secondary'} onClick={toggle_white_list}><span>Lockdown</span></Button>
      {/* <Button variant='outlined' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>Start Server</span></Button> */}
      <Button style={{margin:5}} variant='outlined' color='error' onClick={restart_server}><span>Restart</span></Button>
    </Grid2>
    </Stack>
    <Divider orientation="vertical" flexItem />
    <Stack direction="column" spacing={0} style={{display:'flex',alignItems:'center'}}>
    <h2 style={{marginTop:'0em',marginBottom:'0.5em'}}>Workflows</h2>
    {/* <Stack direction="row" spacing={3}> */}
    <Grid2>
    <Button style={{margin:5}} variant='outlined' color={workflow === 1 ? 'info': 'secondary'} onClick={()=>{set_new_workflow(1)}}><span>Work</span></Button>
      <Button style={{margin:5}} variant='outlined' color={workflow === 2 ? 'info': 'secondary'} onClick={()=>{set_new_workflow(2)}}><span>Custom</span></Button> 
      </Grid2>
      {/* </Stack> */}
      </Stack>

    </Stack>
      </ContentDiv>

    </>
    :
    <>
      <ContentDiv>
      

    <ContextualHelp title="Focus Mode">
      <p>Focus mode allows you to focus on a task for a set amount of time. </p>
      <p>Click the "Stop Focus Mode" button to stop the current focus mode.</p>
      </ContextualHelp>
    <Stack direction="column" spacing={3} >
    <h1 style={css.h1}>Focus Mode</h1>
    <LinearProgress style={{minWidth:'30em'}} variant="determinate" value={(100*((parseInt(currentFocusMode['Time Elapsed'].split(":")[0])  +parseInt((currentFocusMode['Time Elapsed'].split(":")[1]))/60)/currentFocusMode["Duration"]))}/>
        {/* stop focus mode button */}
        <p>There is {currentFocusMode["Time Remaining"]} on the clock for the focus mode: {currentFocusMode["Name"]}</p>
        <p>{currentFocusMode["Duration"]} minute focus mode </p>
        <Button style={{margin:5}} variant='outlined' color='error' onClick={stopFocusMode}><span>Stop Focus Mode</span></Button>
    </Stack>
        </ContentDiv>
    </>

    } 
    <div style={{justifyContent:'center',display: 'flex',height:'0px'}}>
    
      { showConfetti && <ConfettiExplosion style={{justifyContent:'center'}} height={2000}></ConfettiExplosion>}
    </div>
    <ContentDiv >
      <DailyTasks showAllTasks={false} ref={taskDataRef}> </DailyTasks>
    </ContentDiv>
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
    {/* <Stack direction="column" spacing={3} style={{flex:5,marginTop:'1em',marginRight:'1em',height:'fit-content'}} >
    
    </Stack> */}



    
    <Sider style={{backgroundColor:token.token.colorBgContainer,margin:0,borderRadius:'2em',minWidth:'60%', marginRight:'0em',justifyContent:'center',justifyItems:'center'}} width='30%'>
    {pieChartData ? 
        <Stack direction='column' spacing={3} style={{alignItems:'center', display:'flex',justifyItems:'center'}}>
       
        <ContentDivUnstyled style={{justifyItems:'center',justifyContent:'center',display:'flex',marginTop:'1em',marginBottom:'0em',padding: '1em',paddingBottom:'2em',width:'93%',minWidth:'90%',borderRadius:'3em',maxHeight:'30em', aspectRatio:1}} > 
        {/* make the width the same as the height */}

          
        <Pie 
        style={{justifySelf:'center',maxHeight:'30em'}}
        data={pieChartData}
        id = "pieChart"
        options={{
          plugins: {
            legend:{
              display:false
            },
            title: {
              display: true,
              text: "Focused, Distracted, and Neutral Time",
              color: 'white',
              font: {
                size: 24,
                weight: 'normal'
              }
              
            }
            
          }
        
        }} />
        </ContentDivUnstyled>
        
        </Stack>
        :
        <>
        <ContentDiv spacing={3} style={{alignItems:'center', display:'flex',justifyItems:'center',justifyContent:'center'}}>
          <Skeleton variant="circular"  height='20em' style={{justifySelf:'center',justifyContent:'center', aspectRatio:1}} />
          </ContentDiv>
        </>
        }
        {/* {lineChartData &&
        <div style={{...css.contrastContent,margin: '0em',padding:0,minWidth:'30%',paddingTop:'1em'}} >
        <Line data={lineChartData}
        id = "lineChart"
        options={{
          scales: {
            y: {
              color: 'white',
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Distractions Over Time",
              color: 'white',
              font: {
                size: 20
              }
            }
          }
        }} /></div>
        } */}
        {barChartData  ?
          <ContentDiv style={{flex:0,height:'fit-content',padding: '1em',display:'flex',justifyContent:'center'}}>
            <Bar data={barChartData} style={{maxWidth:'90%'}} options={{
              indexAxis: 'y',
              scales: {
                x: {
                  ticks: {
                    color: 'white',
                  }
                },
                y: {
                  ticks: {
                    color: 'white',
                  }
                }
              },
              legend: {
                title: {
                color: 'white'
                }
              },
              plugins: {
                
                title: {
                  display: true,
                  text: 'Lookaways per App',
                  color: 'white',
                  font: {
                    size: 24,
                    weight: 'normal'
                  }
                },
                legend: {
                  display: false,
                }
                
                
              }
            }}></Bar>
      
          </ContentDiv>
          :
          <ContentDiv spacing={3} style={{alignItems:'center', display:'flex',justifyItems:'center',justifyContent:'center'}}>
          <Skeleton variant="rectangular"  width='20em' height='10em' style={{justifySelf:'center',borderRadius:'2em',justifyContent:'center', aspectRatio:1}} />
          </ContentDiv>
            }
    {/* <Stack direction="row" spacing={1} style={{height:'fit-content'}}> */}
    <ContentDivUnstyled style={{fontFamily: 'Manrope',fontSize:18,color:'white',backgroundColor:token.colorBgElevated,borderRadius:'3em',margin:'1em',padding:'0em',paddingBottom:'1em'}}>
      <Stack spacing={0} flex={1}>
      <p style={{textAlign:'center',paddingTop:0,fontSize:24,padding:0}}>Progress Orbits</p>
      <ProgressBars></ProgressBars>
      </Stack>
      </ContentDivUnstyled>
      {/* <Stack direction="column" spacing={0} style={{flex:0,height:'fit-content',padding: '0em'}}>
          <Stack direction="column" spacing={0}>
            { currentImprovement !== null ?
          <>
          <ContentDiv style={{...css.contrastContent,flex:0,height:'fit-content',padding: '1em'}}>
            <Stack direction="column" spacing={3} style={{justifyContent:'center',justifySelf:'center'}} >
              <Stack direction="row" spacing={3} style={{justifyContent:'center',justifySelf:'center'}} >
                { currentImprovement[1] === "__clock__" ?
                <BrowseGallery style={{aspectRatio:1,height:'4vw',width:'4vw'}}></BrowseGallery>
                : currentImprovement[1] === "__eyes__" ?
                <VisibilityOutlined style={{aspectRatio:1,height:'4vw',width:'4vw'}}></VisibilityOutlined>
                :
                <Avatar style={{aspectRatio:1,height:'4vw',width:'4vw'}} src={'http://127.0.0.1:5005/getIcon/'+currentImprovement[1]}></Avatar>
                }
          <h1>Great Job!</h1>
          {improvementData.length > 0 ? <Button variant='outlined' color='success' onClick={pickCurrentImprovement}><Refresh></Refresh></Button>: null}
          </Stack>
          <h2>{currentImprovement[0]}</h2>
          </Stack>
          </ContentDiv>
          </>
          :
          <>
          </>

            }
          </Stack> */}
    {/* </Stack> */}
      </Sider>
    </Stack>
    </Layout>
    </div>
  )
}

export default FrontPage
