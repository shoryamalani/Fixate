import React, { useEffect } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { FaCalendarCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {setCurrentTasks, setOldProgressOrbits} from '../features/TasksSlice'
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import { CircularProgressWithLabel } from '../components/CircularProgressBar';
import ContentDivUnstyled from '../components/ContentDivUnstyled';
import OldProgressOrbitsCalendar from '../components/progressOrbits/OldProgressOrbitsCalendar';
import ContentDiv from '../components/ContentDiv';
import CheckIcon from '@mui/icons-material/Check';
import { display } from '@xstyled/styled-components';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}));
function FocusModes() {
  const [name, setName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState(0);
  const [taskDuration, setTaskDuration] = useState(0);
  const dispatch = useDispatch();
  const currentTasks = useSelector(state => state.tasks.currentTasks);
  console.log(currentTasks)
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [followUp, setFollowUp] = useState(false);
  const [dataForStartFocusMode, setDataForStartFocusMode] = useState(null);
  const oldProgressOrbitsData = useSelector(state => state.tasks.oldProgressOrbits);
  const openTimeModal = (data) => {
    setOpen(true);
    setDataForStartFocusMode(data);


  };

  const handleClose = (data) => {
    console.log("Closing modal")
    setOpen(false);
    console.log(dataForStartFocusMode)
    setName(dataForStartFocusMode['name'])
    startFocusMode(duration,dataForStartFocusMode['name'],dataForStartFocusMode['taskId'])
  };
    
  const get_all_apps = async () => {
    const response = await fetch('http://localhost:5005/get_daily_tasks').then(
      response => response.json()
    ).then(data => {
      console.log(data['tasks'])
    dispatch(setCurrentTasks(data['tasks']));
    }
    ).catch(error => {
      console.log(error)
      return null;
    });

  }
  useEffect(() => {
    get_all_apps()
    getAllOldProgressOrbits()
  }, [])
  useEffect(() => {
    console.log(name)
    console.log(duration)
    if(name.length > 20){
      setName(name.substring(0,20))
    }
    if(duration < 0){
      setDuration(0)
    }else if(duration > 120){
      setDuration(120)
    }
  }, [name,duration])
  useEffect(() => {
    console.log(taskName)
    console.log(taskDuration)
    if(taskName.length > 20){
      setTaskName(taskName.substring(0,20))
    }
    if(taskDuration < 0){
      setTaskDuration(0)
    }else if(taskDuration > 120){
      setTaskDuration(120)
    }
  }, [taskName,taskDuration])

  const startFocusMode = (d=duration,n=name,taskId=null) => {
    console.log("Starting focus mode")
    console.log("Name: " + name)
    console.log("Duration: " + duration)
    var data = {
      "name": n,
      "duration": d,
      "task_id": taskId
    }
    console.log(data)
    fetch('http://localhost:5005/start_focus_mode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
      alert('Success')
    }).catch(error => {
      console.log(error);
      alert('Error')
    })
  }
  const getAllOldProgressOrbits = () => {
    console.log("Get all old progress orbits")
    fetch('http://localhost:5005/get_all_progress_orbits', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()).then(data => {
      console.log(data)
      dispatch(setOldProgressOrbits(data['progress_orbits']));

    }).catch(error => {
      console.log(error);
      alert('Error')
    })
  }
  const waitUntil = (condition, checkInterval=100) => {
    return new Promise(resolve => {
        let interval = setInterval(() => {
            if (!condition()) return;
            clearInterval(interval);
            resolve();
        }, checkInterval)
    })
}
  const seeFocusModes = (taskId) => {
    console.log("See focus modes for task: " + taskId)
    var task = {}
    for(var i = 0; i < currentTasks.length; i++){
      if(currentTasks[i]['id'] === taskId){
        task = currentTasks[i];
        break;
      }
    }
    console.log(task)
    navigate('/timeSpent',{state:{"focusModes":task['ids_of_focus_modes']}})
  }
  const startFocusModeForTask = async (name,taskId) => {
    // ask the user for duration through a dialog
    openTimeModal({
      "name":name,
      "taskId":taskId
    });
    // console.log(followUp)
    // await waitUntil(_ => followUp===true)
    // console.log("Start focus mode for task: " + taskId)
    // setFollowUp(false);
    // startFocusMode(duration,name,taskId);



  }
  const setCompleted = (taskId) => {
    console.log("Set completed for task: " + taskId)
    fetch('http://localhost:5005/complete_task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "id": taskId
      })
    }).then(response => response.json()).then(data => {
      get_all_apps()
    }).catch(error => {
      console.log(error);
      alert('Error')
    })
  }
  const createTask = () => {
    console.log("Create task")
    console.log("Name: " + taskName)
    console.log("Duration: " + taskDuration)
    fetch('http://localhost:5005/add_daily_task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "name": taskName,
        "task_estimate_time": taskDuration,
        "task_repeating":false
      })
    }).then(response => response.json()).then(data => {
      alert('Added')
      get_all_apps()
      // window.location.reload();
    }).catch(error => {
      console.log(error);
      alert('Error')
      window.location.reload();
    })
    //refresh the page
    
  }
  
  const deleteTask = (taskId) => {
    console.log("Delete task: " + taskId)
    fetch('http://localhost:5005/stop_showing_task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": taskId
          })
        }).then(response => response.json()).then(data => {
          alert('Success')
        }
        ).catch(error => {
          console.log(error);
          alert('Error')
        })
        //refresh the page
        window.location.reload();
  }
  const checkFilter = (taskId) => {
    return true;
  }

  return (

    <div>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      {/* <ContentDivUnstyled style={{borderRadius:'3em',padding:'1em'}}> */}
      <h1 style={{fontSize:44,textAlign:'center',color:'white'}}>Tasks and Orbit History</h1>
      {/* </ContentDivUnstyled> */}
     
    <Stack direction="row" spacing={3}>
      <Stack direction="column" flex={1} spacing={3}>
        { oldProgressOrbitsData != null ?
        <ContentDiv>
        <OldProgressOrbitsCalendar progressOrbits={oldProgressOrbitsData} changeSelection={()=>{}}  />
        </ContentDiv>
        :
        <CircularProgress></CircularProgress>
        }
      </Stack> 
      <Divider orientation="vertical" flexItem />
      <Stack direction="column" flex={1} spacing={3}>
    <ContentDiv>
      <Stack direction={'column'} style={{display:'flex'}}>
      <h2 style={{textAlign:"center",}}>Current Tasks</h2>
      <TableContainer component={Paper} style={{  maxWidth:'inherit', maxHeight:'60vh' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell style={{fontSize:20}}>Task name</TableCell>
            <TableCell align="center" style={{fontSize:20}}>Estimated Duration</TableCell>
            <TableCell align="center" style={{fontSize:20}}>Current Time Spent</TableCell>
            <TableCell align="center" style={{fontSize:20}}>Progress</TableCell>
            {/* <TableCell align="right">See Focus Modes</TableCell>
            <TableCell align="right">Start Focus Mode</TableCell> */}
            <TableCell align="center" style={{fontSize:20}}>Actions</TableCell>
            {/* <TableCell align="right">Delete</TableCell> */}
          </TableRow>
        </TableHead>
        {currentTasks!= null &&
        <TableBody>
          {Object.keys(currentTasks).reverse().map((task) => (
            <TableRow
              key={currentTasks[task].id}
              style={{visibility: checkFilter(currentTasks[task].id) ? 'visible':'collapse', backgroundColor: currentTasks[task]['complete'] ? 'rgba(29,55,19,0.54)':'inherit'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{currentTasks[task]['name']}</TableCell>
              <TableCell align="center">{currentTasks[task]['estimated_time']}</TableCell>
              <TableCell align="center">{currentTasks[task]['time_completed']}</TableCell>
              <TableCell align="center"><CircularProgressWithLabel value={(currentTasks[task]['time_completed']/currentTasks[task]['estimated_time'])*100} /></TableCell>
              {/* <TableCell align="right"><Button variant='contained'  onClick={()=>{seeFocusModes(currentTasks[task]['id'])}}>See Focus Modes</Button></TableCell> */}
              {/* <TableCell align="right"><Button variant='contained' onClick={()=>{startFocusModeForTask(currentTasks[task]['name'],currentTasks[task]['id'])}}>Start Focus Modes</Button></TableCell> */}
              <TableCell align="center">
                <Stack direction='row' spacing={1}>
                  <Button  variant='outlined' color='success' onClick={()=>{setCompleted(currentTasks[task]['id'])}}><CheckIcon></CheckIcon></Button>
                  <Button variant='outlined' color='error' onClick={()=>{deleteTask(currentTasks[task]['id'])}}><DeleteIcon></DeleteIcon></Button>
                </Stack>
                </TableCell>
              {/* <TableCell align="right"></TableCell> */}
              
              </TableRow>
            ))}
        </TableBody>}

        </Table>
      </TableContainer>
      </Stack>
      
    </ContentDiv>
    </Stack>
    {/* </div> */}
      </Stack>
    
    </div>
  )
}

export default FocusModes
