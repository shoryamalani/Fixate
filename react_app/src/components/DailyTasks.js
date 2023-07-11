
import React, { useEffect, useState } from 'react';
import { Avatar, Button, Container, Icon, IconButton, Input, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import css from '../Style';
import { useSelector } from 'react-redux';
import { setUserData } from '../features/UserSlice';
import { useDispatch } from 'react-redux';
import { CircularProgressWithLabel } from './CircularProgressBar';
import { blue } from '@mui/material/colors';
// import { Icon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AspectRatio, Refresh } from '@mui/icons-material';
import { setCurrentTasks } from '../features/TasksSlice';
import SmartTaskList from './SmartTaskList';
import { color, maxHeight, maxWidth } from '@xstyled/styled-components';
import { useNavigate } from 'react-router-dom';
import StartFocusModeOverlay from './StartFocusModeOverlay';
import AddTaskOverlay from './AddTaskOverlay';
// import AddIcon from '@mui/icons-material/Add';

const  DailyTasks = () => {
    const currentTasks = useSelector(state => state.tasks.currentTasks);
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentFocusModeData, setCurrentFocusModeData] = useState({});
    const [showAddFocusOverlay, setShowAddFocusOverlay] = useState(false);
    const getTaskData = async () => {
        fetch('http://localhost:5005/get_daily_tasks').then(response => response.json()).then(data => {
            console.log(data)
            data = data['tasks']
            if (data != null) {
                dispatch(setCurrentTasks(data));
            }
        }).catch(error => { console.log(error)});
    }
    useEffect(() => {
        if (currentTasks == null) {
            getTaskData();
        }
    }, [currentTasks])
    const checkName = (name) => {
        if (name.length < 3) {
            alert("Name must be at least 3 characters long")
            return true;
        }
        return false;
    }
    const setCompleted = async (id) => {
        console.log("Set completed for task: " + id)
        fetch('http://localhost:5005/complete_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "id": id
        })
        }).then(response => response.json()).then(data => {
            getTaskData();
        }).catch(error => {
        console.log(error);
        alert('Error')
        });
    }
    
    const deleteTask = async (id) => {
        console.log("Delete task: " + id)
        fetch('http://localhost:5005/stop_showing_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
          "id": id
          })
        }).then(response => response.json()).then(data => {
          getTaskData();
        }
        ).catch(error => {
          console.log(error);
          alert('Error')
        })
    }
    const handleStartFocusModeFromOverlay = async (data) => {
        setOverlayOpen(false);
        if(data.type === 'cancel'){
            return;
        }
        startFocusModeBackend(data.name,data.id, data.duration, data.type)
    }

    const startFocusModeBackend = async (focusModeName,id,duration,type) => {
        fetch('http://localhost:5005/start_focus_mode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            "name": focusModeName,
            "task_id": id,
            "duration": duration,
            "type": type
            })
        }).then(response => response.json()).then(data => {
            console.log(data)
            getTaskData();
        }
        ).catch(error => {
            console.log(error);
            alert('Error')
        })
    }



    const startFocusModeForTask = async (name,id) => {
        setCurrentFocusModeData({"name":name,"id":id})
        setOverlayOpen(true);

    }
    const seeFocusModesForFunction = async (focusModeList) => {
        navigate('/timeSpent',{state:{"focusModes":focusModeList}})
    }

    const handleAddFocusModeFromOverlay = async (data) => {
        setShowAddFocusOverlay(false);
        if(data.type === 'cancel'){
            return;
        }
        addTaskBackend(data.name,data.duration,data.type)

    }

    const addTaskBackend = async (name,duration,type) => {
        fetch('http://localhost:5005/add_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            "name": name,
            "duration": duration,
            "type": type
            })
        }).then(response => response.json()).then(data => {
            console.log(data)
            getTaskData();
        }
        ).catch(error => {
            console.log(error);
            alert('Error')
        })
    }

    

    return (
        <>
        <StartFocusModeOverlay open={overlayOpen} handleClose={handleStartFocusModeFromOverlay} focusModeData={currentFocusModeData} ></StartFocusModeOverlay>
        <AddTaskOverlay open={showAddFocusOverlay} handleClose={handleAddFocusModeFromOverlay}></AddTaskOverlay>
        <Stack direction="column" spacing={2} style={css.contrastContent}>
        
        

        <div style={css.contrastContent}>
            <Stack direction="column" spacing={2} style={{...css.contrastContent}}>
            <h2>Todays Tasks</h2>
            <Stack direction='row' spacing={2} style={{justifyContent:'center'}}>
            <Button variant='contained' color='success' style={{maxWidth:'3em'}} > <AddIcon onClick={()=>{setShowAddFocusOverlay(true)}}  color='white'/></Button>
            <Button variant='contained' color='success' onClick={() => getTaskData()} style={{aspectRatio:1,maxHeight:'2vw',maxWidth:'2vw'} }>
                <Refresh style={css.refreshIcon}/>
            </Button>
            </Stack>
            <SmartTaskList 
                tasks={currentTasks}  
                setCompletedFunction={setCompleted}
                deleteTaskFunction={deleteTask}
                seeFocusModesFunction={seeFocusModesForFunction}
                startFocusModeForTaskFunction={startFocusModeForTask}
                checkFilterFunction={()=>true} />
                </Stack>
            </div>
        </Stack>
            </>
    )
}

export { DailyTasks };