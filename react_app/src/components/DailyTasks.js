
import React, { useEffect, useImperativeHandle, useState } from 'react';
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
import { setCurrentTasks, setOldTasks, setTodaysTasks } from '../features/TasksSlice';
import SmartTaskList from './SmartTaskList';
import { color, maxHeight, maxWidth } from '@xstyled/styled-components';
import { useNavigate } from 'react-router-dom';
import StartFocusModeOverlay from './StartFocusModeOverlay';
import AddTaskOverlay from './AddTaskOverlay';
import { forwardRef } from 'react';
// import AddIcon from '@mui/icons-material/Add';
var _DATE_FORMAT_REGXES = {
    'Y': new RegExp('^-?[0-9]+'),
    'd': new RegExp('^[0-9]{1,2}'),
    'm': new RegExp('^[0-9]{1,2}'),
    'H': new RegExp('^[0-9]{1,2}'),
    'M': new RegExp('^[0-9]{1,2}'),
    'S': new RegExp('^[0-9]{1,2}'), 
}

/*
 * _parseData does the actual parsing job needed by `strptime`
 */
function _parseDate(datestring, format) {
    var parsed = {};
    for (var i1=0,i2=0;i1<format.length;i1++,i2++) {
    var c1 = format[i1];
    var c2 = datestring[i2];
    if (c1 == '%') {
        c1 = format[++i1];
        var data = _DATE_FORMAT_REGXES[c1].exec(datestring.substring(i2));
        if (!data.length) {
            return null;
        }
        data = data[0];
        i2 += data.length-1;
        var value = parseInt(data, 10);
        if (isNaN(value)) {
            return null;
        }
        parsed[c1] = value;
        continue;
    }
    if (c1 != c2) {
        return null;
    }
    }
    return parsed;
}

/*
 * basic implementation of strptime. The only recognized formats
 * defined in _DATE_FORMAT_REGEXES (i.e. %Y, %d, %m, %H, %M)
 */
function strptime(datestring, format) {
    var parsed = _parseDate(datestring, format);
    if (!parsed) {
    return null;
    }
    // create initial date (!!! year=0 means 1900 !!!)
    var date = new Date(0, 0, 1, 0, 0);
    date.setFullYear(0); // reset to year 0
    if (parsed.Y) {
    date.setFullYear(parsed.Y);
    }
    if (parsed.m) {
    if (parsed.m < 1 || parsed.m > 12) {
        return null;
    }
    // !!! month indexes start at 0 in javascript !!!
    date.setMonth(parsed.m - 1);
    }
    if (parsed.d) {
    if (parsed.m < 1 || parsed.m > 31) {
        return null;
    }
    date.setDate(parsed.d);
    }
    if (parsed.H) {
    if (parsed.H < 0 || parsed.H > 23) {
        return null;
    }
    date.setHours(parsed.H);
    }
    if (parsed.M) {
    if (parsed.M < 0 || parsed.M > 59) {
        return null;
    }
    date.setMinutes(parsed.M);
    }
    return date;

}


const  DailyTasks = forwardRef((props,ref) => {
    const {showAllTasks} = props;
    useImperativeHandle(ref, () => ({
        refresh() {
            getTaskData();
        }
    }));

    const currentTasks = useSelector(state => state.tasks.currentTasks);
    const todaysTasks = useSelector(state => state.tasks.todaysTasks);
    const oldTasks = useSelector(state => state.tasks.oldTasks);
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [currentFocusModeData, setCurrentFocusModeData] = useState({});
    const [showAddFocusOverlay, setShowAddFocusOverlay] = useState(false);
    const getTaskData = async () => {
        fetch('http://localhost:5005/get_daily_tasks').then(response => response.json()).then(data => {
            console.log(data)
            data = data['tasks']
            var tempTodaysTasks = [];
            var tempOldTasks = 0;
            if (data != null) {
                for (var task in data) {
                    console.log(data[task]['date_created'])
                    var date_created = strptime(data[task]['date_created'], '%Y-%m-%d %H:%M:%S')
                    // var date_created = Date.parse(data[task]['date_created'])
                    // var date_4am_today = new Date();
                    var date_4am_today = new Date();
                    if (date_4am_today.getHours() < 4) {
                        date_4am_today.setDate(date_4am_today.getDate() - 1);
                    }
                    console.log(date_4am_today.getTime())
                    date_4am_today.setHours(4, 0, 0, 0);
                    console.log(date_4am_today.getTime())
                    if (date_created < date_4am_today) {
                        tempOldTasks += 1;
                    } else {
                        tempTodaysTasks.push(data[task])
                        console.log(date_created)
                    }
                }
                dispatch(setTodaysTasks(tempTodaysTasks));
                dispatch(setOldTasks(tempOldTasks));
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
    const setNotCompleted = async (id) => {
        console.log("Set completed for task: " + id)
        fetch('http://localhost:5005/uncomplete_task', {
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
        addTaskBackend(data.name,data.duration)

    }

    const addTaskBackend = async (name,duration) => {
        fetch('http://localhost:5005/add_daily_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            "name": name,
            "task_estimate_time": duration,
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
        <Stack direction="column" spacing={2} >
        <div >
            <Stack direction="column" spacing={2}>


            <Stack direction='row' spacing={2} style={{justifyContent:'center'}}>
            <h2>Todays Tasks</h2>
            <Button variant='contained' color='success' style={{aspectRatio:1,height:'4vw',width:'2vw'}} onClick={()=>{setShowAddFocusOverlay(true)}} > <AddIcon  style={{aspectRatio:1}} color='white'/></Button>
            </Stack>
            
            {/* <Button variant='contained' color='success' onClick={() => getTaskData()}>
                <Refresh style={css.refreshIcon}/>
            </Button> */}
            <SmartTaskList 
                tasks={showAllTasks ? currentTasks : todaysTasks}  
                setCompletedFunction={setCompleted}
                deleteTaskFunction={deleteTask}
                seeFocusModesFunction={seeFocusModesForFunction}
                startFocusModeForTaskFunction={startFocusModeForTask}
                setNotCompletedFunction={setNotCompleted}
                checkFilterFunction={()=>true} />
                {!showAllTasks && <Button variant='contained' color='success' onClick={()=>{navigate('/focusModes')}}>See All Tasks</Button>}

                </Stack>
            </div>

        </Stack>
            </>
    )
})

export { DailyTasks };