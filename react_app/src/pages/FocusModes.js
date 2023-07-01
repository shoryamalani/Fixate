import React, { useEffect } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { FaCalendarCheck } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {setCurrentTasks} from '../features/TasksSlice'
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import { CircularProgressWithLabel } from '../components/CircularProgressBar';
import { Check, CheckBoxOutlineBlank } from '@mui/icons-material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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
  useEffect(() => {
    
    // add no-cors to the fetch request
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
    get_all_apps()

  },[dispatch])
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
      alert('Success')
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
      window.location.reload();
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

    <div style={css.mainContent}>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
      <h1 style={css.h1}>Focus Modes and Tasks</h1>
      <div style={css.contrastContent}>
      <h3>
        Focus modes are a way to block distracting apps and websites for a set amount of time.<br></br> They can be especially useful when you need to work on something that is boring.
      </h3>
    </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Set focus mode length</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the duration of the focus mode in minutes
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Duration"
            type="number"
            value={duration}
            onChange={(e)=>{setDuration(e.target.value)}}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>handleClose('submit')}>Submit</Button>
        </DialogActions>
      </Dialog>
    <Stack direction="row" spacing={3}>
    {/* <div> */}
      <Stack direction="column" spacing={3}>
      {/* make a description of focus modes later */}
        <div style={css.contrastContent}>
          <Stack direction="column" spacing={3} style={css.body}>
        <h2 style={css.h2}>Create Focus Mode</h2>
      <Stack direction="row" spacing={3} style={css.body}>
        {/* <InputLabel id="Name">Name</InputLabel> */}
        <TextField id="Name" label='Name' value={name} onChange={(e) =>{setName(e.target.value)}}/>
        {/* <InputLabel id="Duration"></InputLabel> */}
        <TextField aria-label='Duration (Minutes)' label='Duration (Minutes)' id="Duration" type="number" value={duration} onChange={(e)=>{setDuration(e.target.value)}} />
    </Stack>
        <Button style={{margin:5}} variant='contained' color='success' onClick={()=>{startFocusMode()}}><span>Start Focus Mode</span></Button>
    </Stack>
    </div>
   
    
      
    <div style={{...css.contrastContent,minWidth:320}}>
      <Stack direction='column' spacing={3}>
      <h2 style={css.h2}>Create Task</h2>
      <Stack direction="row" spacing={3} style={css.body}>
        {/* <InputLabel id="Name">Name</InputLabel>
        <BootstrapInput id="Name" value={taskName} onChange={(e) =>{setTaskName(e.target.value)}}/>
        <InputLabel id="Duration">Estimated Duration (Minutes)</InputLabel>
        <BootstrapInput id="Duration" type="number" value={taskDuration} onChange={(e)=>{setTaskDuration(e.target.value)}} /> */}
        <TextField id="Name" label='Name' value={taskName} onChange={(e) =>{setTaskName(e.target.value)}}/>
        <TextField aria-label='Duration (Minutes)' label='Estimated Duration (Minutes)' id="Duration" type="number" value={taskDuration} onChange={(e)=>{setTaskDuration(e.target.value)}} />
      </Stack>
        <Button style={{margin:5}} variant='contained' color='success' onClick={()=>{createTask()}}><span>Create Task</span></Button>
      </Stack>
      </div>
      </Stack> 
      <Divider orientation="vertical" flexItem />
      <Stack direction="column" spacing={3}>
    <div style={{...css.contrastContent,minWidth:550}}>
      <Stack direction={'column'}>
      <h2>Current Tasks</h2>
      <TableContainer component={Paper} style={{ minWidth: 350, maxWidth:'inherit', maxHeight:'60vh' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell>Task name</TableCell>
            <TableCell align="right">Estimated Duration</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">Current Time Spent</TableCell>
            <TableCell align="right">Progress</TableCell>
            <TableCell align="right">See Focus Modes</TableCell>
            <TableCell align="right">Start Focus Mode</TableCell>
            <TableCell align="right">Actions</TableCell>
            {/* <TableCell align="right">Delete</TableCell> */}
          </TableRow>
        </TableHead>
        {currentTasks!= null &&
        <TableBody>
          {Object.keys(currentTasks).map((task) => (
            <TableRow
              key={currentTasks[task].id}
              style={{visibility: checkFilter(currentTasks[task].id) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{currentTasks[task]['name']}</TableCell>
              <TableCell align="right">{currentTasks[task]['estimated_time']}</TableCell>
              
              <TableCell align="right">{currentTasks[task]['complete'] ? <CheckBoxIcon></CheckBoxIcon> : <CheckBoxOutlineBlank></CheckBoxOutlineBlank> }</TableCell>
              <TableCell align="right">{currentTasks[task]['time_completed']}</TableCell>
              <TableCell align="right"><CircularProgressWithLabel value={(currentTasks[task]['time_completed']/currentTasks[task]['estimated_time'])*100} /></TableCell>
              <TableCell align="right"><Button variant='contained'  onClick={()=>{seeFocusModes(currentTasks[task]['id'])}}>See Focus Modes</Button></TableCell>
              <TableCell align="right"><Button variant='contained' onClick={()=>{startFocusModeForTask(currentTasks[task]['name'],currentTasks[task]['id'])}}>Start Focus Modes</Button></TableCell>
              <TableCell align="right"><Button variant='contained' color='success' onClick={()=>{setCompleted(currentTasks[task]['id'])}}>Complete</Button><Button variant='contained' color='failure' onClick={()=>{deleteTask(currentTasks[task]['id'])}}>Delete</Button></TableCell>
              {/* <TableCell align="right"></TableCell> */}
              
              </TableRow>
            ))}
        </TableBody>}

        </Table>
      </TableContainer>
      </Stack>
      
    </div>
    </Stack>
    {/* </div> */}
      </Stack>
    
    </div>
  )
}

export default FocusModes
