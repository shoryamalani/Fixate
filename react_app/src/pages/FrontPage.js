import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setLogging,setClosingApps,setFocusMode,setWhitelist,setWorkflow, setShowGetChromeExtension, setRingsData, setCurrentImprovement, setImprovementData} from '../features/LoggerSlice';
import { Avatar, Divider, Grid, Input, LinearProgress, colors, duration, useTheme } from '@mui/material';
import { UserProfileCard } from '../components/UserProfileCard';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { BrowseGallery, Refresh, VisibilityOutlined } from '@mui/icons-material';
import { DailyTasks } from '../components/DailyTasks';
import { ProgressBars } from '../components/ProgressBars';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { justifyItems } from '@xstyled/styled-components';
import { clearWorkflowData } from '../features/AppSlice';
import ConfettiExplosion from 'confetti-explosion-react';


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

            // GET ICON
            var picked = Math.floor(Math.random() * final_improvements_data.length);
            dispatch(setCurrentImprovement(final_improvements_data[picked]))
            dispatch(setImprovementData(final_improvements_data))
            pickCurrentImprovement()
            


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

  return (
    <div style={{
      ...css.mainContent,
      maxWidth: '100%',
      justifyContent:'center',
      justifyItems:'center'
    }}>
      
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
    <Stack direction="row" spacing={3} style={{justifyContent:'center',justifyItems:'center',width:'100%'}}>
    <Stack direction="column" spacing={3} style={{flex:6,justifyContent:'center',justifyItems:'center',marginLeft:'1em',height:'fit-content'}} >
    {pieChartData && 
        <Stack direction='column' spacing={3} style={{alignItems:'center'}}>
       
        <div style={{...css.contrastContent,margin: '0em',marginTop:'1em',marginBottom:'1em',padding: '1em',maxWidth:'100%',minWidth:'100%', aspectRatio:1}} > 
        {/* make the width the same as the height */}

          
        <Pie data={pieChartData}
        id = "pieChart"
        options={{
          plugins: {
            legend:{
              display:false
            },
            title: {
              display: true,
              text: "Minutes Spent per App",
              color: 'white',
              font: {
                size: 20
              }
              
            }
            
          }
        
        }} />
        </div>
        </Stack>
        }
        {lineChartData &&
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
        }
        </Stack>
      <Stack direction="column" spacing={3} style={{flex:8,justifyContent:'center',justifySelf:'center',height:'fit-content'}} > {/* make this column start from the top*/}
      {/* <div style={{...css.contrastContent}}> */}
        <Stack direction="row" spacing={3} style={{justifyContent:'center',justifySelf:'center'}} >
    <h2 >Fixate Dashboard</h2>
      <Button variant='contained' color='success' style={{aspectRatio:1,height:'4vw',width:'2vw'}} onClick={() => {window.location.reload()}}><Refresh style={{aspectRatio:1}} color='white'></Refresh></Button>
    </Stack>
    {/* <Stack direction='row' spacing={2} style={{justifyContent:'center'}}>
            <h2>Todays Tasks</h2>
            <Button variant='contained' color='success' style={{aspectRatio:1,height:'3vw',width:'3vw'}} > <Refresh  style={{aspectRatio:1}} color='white'/></Button>
            </Stack> */}
    {/* </div> */}
      {/* <h1 style={css.h1}>Tasks</h1> */}
      {currentFocusMode['status'] === false ?
    <>
   
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
      <Stack direction="row" spacing={3} >
    <Stack direction="column"  spacing={0} >
      <h2 style={{marginTop:'0em',marginBottom:'0em'}}>Logger Controls</h2>
    <Grid2 direction="row" spacing={3}>
      <Button style={{margin:5}} variant='contained' color={logging ? 'error': 'success'} onClick={logging ? stop_logger : start_logger}><span>Logger</span></Button>
      <Button style={{margin:5}} variant='contained' color={closingApps ? 'error': 'success'} onClick={toggle_blocking}><span>blocking</span></Button>
      <Button style={{margin:5}} variant='contained' color={whitelist ? 'error': 'success'} onClick={toggle_white_list}><span>Lockdown</span></Button>
      {/* <Button variant='contained' color={logging ? 'success': 'error'} onClick={logging ? stop_logger : start_logger}><span>Start Server</span></Button> */}
      <Button style={{margin:5}} variant='contained' color='error' onClick={restart_server}><span>Restart</span></Button>
    </Grid2>
    </Stack>
    <Divider orientation="vertical" flexItem />
    <Stack direction="column" spacing={0}>
    <h2 style={{marginTop:'0em',marginBottom:'0em'}}>Workflows</h2>
    {/* <Stack direction="row" spacing={3}> */}
    <Grid2>
    <Button style={{margin:5}} variant='contained' color={workflow === 1 ? 'success': 'error'} onClick={()=>{set_new_workflow(1)}}><span>Work</span></Button>
      <Button style={{margin:5}} variant='contained' color={workflow === 2 ? 'success': 'error'} onClick={()=>{set_new_workflow(2)}}><span>Custom</span></Button> 
      </Grid2>
      {/* </Stack> */}
      </Stack>

    </Stack>
      </div>

    </>
    :
    <>
      <div style={css.contrastContent}>
    <Stack direction="column" spacing={3} >
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
    <div style={{justifyContent:'center',flex:2,display: 'flex'}}>
    
      { showConfetti && <ConfettiExplosion style={{justifyContent:'center'}} height={2000}></ConfettiExplosion>}
    </div>
    <div style={css.contrastContent}>
      <DailyTasks showAllTasks={false} ref={taskDataRef}> </DailyTasks>
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
    <Stack direction="column" spacing={3} style={{flex:5,marginTop:'1em',marginRight:'1em',height:'fit-content'}} >
    {/* <Stack direction="row">  */}
    {barChartData  &&
          <div style={{...css.contrastContent,flex:0,height:'fit-content',padding: '1em'}}>
            <Bar data={barChartData} options={{
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
                    size: 20
                  }
                },
                legend: {
                  display: false,
                }
                
                
              }
            }}></Bar>
      
          </div>
            }
    {/* <Stack direction="row" spacing={1} style={{height:'fit-content'}}> */}
    <div style={{...css.contrastContent,flex:2,marginRight:'0em'}}>
      <Stack direction="column" spacing={0}>
      <h1>Progress Orbits</h1>
      <ProgressBars></ProgressBars>
      </Stack>
      </div>
      <Stack direction="column" spacing={0} style={{flex:0,height:'fit-content',padding: '0em'}}>
          <Stack direction="column" spacing={0}>
            { currentImprovement !== null ?
          <>
          <div style={{...css.contrastContent,flex:0,height:'fit-content',padding: '1em'}}>
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
          {improvementData.length > 0 ? <Button variant='contained' color='success' onClick={pickCurrentImprovement}><Refresh></Refresh></Button>: null}
          </Stack>
          <h2>{currentImprovement[0]}</h2>
          </Stack>
          </div>
          </>
          :
          <>
          </>

            }
          

    
    
          </Stack>
      {/* </Stack> */}
    {/* </Stack> */}
    </Stack>
   
    
   
    
    </Stack>



    </Stack>
    </div>
  )
}

export default FrontPage
