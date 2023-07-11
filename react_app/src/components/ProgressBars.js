
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
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { easeQuadInOut } from 'd3-ease';
import  AnimatedProgressProvider  from './AnimatedProgressProvider';
const  ProgressBars = () => {
    const [ringsData, setRingsData] = useState(null);
    const getRingData = async () => {
        fetch('http://localhost:5005/get_ring_data').then(response => response.json()).then(data => {
            console.log(data)
            data = data['rings']
            setRingsData(data);
        }).catch(error => { console.log(error)});
    }
    useEffect(() => {
        if (ringsData == null) {
            getRingData();
        }
    }, [ringsData])
    const colors = {
        'focused_minutes': {
            'r': 0,
            'g': 255,
            'b': 0
        },
        'writing_tasks': {
            'r': 255,
            'g': 0,
            'b': 0
        },
        'completed_tasks': {
            'r': 0,
            'g': 0,
            'b': 255
        }
    }

    const createRing = (data) => {
        return (
            <Stack direction='column'>
                <Stack direction='row' style={{justifyContent:'center'}}>
            {/* <CircularProgressWithLabel value={data['value']} color='success'  /> */}
            <AnimatedProgressProvider
                valueStart={0}
                valueEnd={data['value']}
                duration={1.4}
                easingFunction={easeQuadInOut}
                >
                    {(value) => {
                        const roundedValue = Math.round(value);
                        return (
                        <CircularProgressbarWithChildren
                            value={value}
                            
                            // text={`${roundedValue}%`}
                            /* This is important to include, because if you're fully managing the
                            animation yourself, you'll want to disable the CSS animation. */
                            styles={{ pathTransition: 'none',
                            path: {
                            stroke:`rgba(${data['rgb']['r']},${data['rgb']['g']} ,${data['rgb']['b']} , ${value / 100})`,
                            backgroundColor: "green",
                            textColor: "green",
                            pathColor: "green",
                            trailColor: "green" 
                            }}}
                        >
                        <h1 style={{textAlign:'right'}}>{roundedValue}%</h1>
                        <h2 style={{textAlign:'center'}}>{data['label']}</h2>
                        </CircularProgressbarWithChildren>
                    );
                }}
            </AnimatedProgressProvider>
            </Stack>
            </Stack>
        )
    }

    return (
        <>
        
       <Stack direction='column' spacing={2}>
        <Stack direction='row' spacing={2} style={{justifyContent:'center',textAlign:'right'}}>
        {createRing({value:50, label : 'Writing Tasks', rgb:colors['writing_tasks']})}
        </Stack>
        <Stack direction='row' spacing={2}>
            {createRing({value:50, label : 'Focused Minutes', rgb:colors['focused_minutes']})}
            {createRing({value:80, label : 'Completed Tasks', rgb:colors['completed_tasks']})}
            </Stack>
        </Stack>

            </>
    )
}

export { ProgressBars };