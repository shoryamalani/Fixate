
import React, { useEffect, useState } from 'react';
import { Avatar, Button, CircularProgress, Container, Icon, IconButton, Input, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
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
import { color, marginTop, maxHeight, maxWidth, ring } from '@xstyled/styled-components';
import { useNavigate } from 'react-router-dom';
import StartFocusModeOverlay from './StartFocusModeOverlay';
import AddTaskOverlay from './AddTaskOverlay';
// import AddIcon from '@mui/icons-material/Add';
// import { CircularProgressbarWithChildren,buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { easeQuadInOut } from 'd3-ease';
import  AnimatedProgressProvider  from './AnimatedProgressProvider';
import { ConfigProvider, Progress } from 'antd';
const  ProgressOrbits = () => {
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
        'focused_minutes': ['#FFFEED', '#CAE2E8'],
        'writing_tasks': ['#FAE0B7', '#DBACAB'],
        'completed_tasks': ['#ADA5D6', '#D8BCE6'],
    }

    const createRing = (data) => {
        return (
            <Stack direction='column' style={{width:'50%'}}>
                
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
                        // <CircularProgressbarWithChildren
                        //     value={value}
                            
                        //     // text={`${roundedValue}%`}
                        //     /* This is important to include, because if you're fully managing the
                        //     animation yourself, you'll want to disable the CSS animation. */
                        //     styles={buildStyles({ pathTransition: 'none',

                        //     stroke:`rgba(${data['rgb']['r']},${data['rgb']['g']} ,${data['rgb']['b']} , ${value / 100})`,
                        //     // stroke:'linear-gradient(#e66465, #9198e5)',
                        //     strokeWidth:8,
                        //     // backgroundColor: "linear-gradient(#e66465, #9198e5)",
                        //     // textColor: "green",
                        //     pathColor: `rgba(${data['rgb']['r']},${data['rgb']['g']} ,${data['rgb']['b']} , ${value / 100})`,
                        //     // pathColor:''
                        //     // trailColor: "green" 
                        // })}
                        // >

                        // </CircularProgressbarWithChildren>
                        <ConfigProvider
                        theme={{
                            token:{
                                colorTextBase:'white',
                                fontSizeBase:2,
                            }
                        }}>
                        <Progress type='circle' status={value > 80 ? 'success': 'normal'} percent={value}  size='large' format={()=>{return `${data['label']}`}} strokeColor={{ '0%': data['color_1'], '100%': data['color_2'] }} style={{fontSize:10}} >

                        </Progress>
                        </ConfigProvider>
                    );
                }}
            </AnimatedProgressProvider>
            </Stack>
            </Stack>
        )
    }

    return (
        <>
       { ringsData != null ?
       <Stack direction='column' spacing={1}>
        <Button variant='contained' color='success' onClick={() => getRingData()}>
                <Refresh style={css.refreshIcon}/>
            </Button>
        <Stack direction='row' spacing={1} style={{justifyContent:'center',textAlign:'right'}}>
        {createRing({value:100*ringsData['tasks_total']/3, label : 'Planning', rgb:colors['writing_tasks'], color_1:colors['writing_tasks'][0], color_2:colors['writing_tasks'][1]})}
        </Stack>
        <Stack direction='row' spacing={1}>
            {createRing({value:ringsData['total_wanted_time_spent'] != 0 ? 125*ringsData['total_time_spent']/ringsData['total_wanted_time_spent'] :100*ringsData['total_time_spent']/30 , label : 'Focus', color_1:colors['focused_minutes'][0], color_2:colors['focused_minutes'][1]})}
            {createRing({value:100*ringsData['tasks_completed']/(ringsData['tasks_total']-1), label : 'Tasks', color_1:colors['completed_tasks'][0] , color_2:colors['completed_tasks'][1]})}
            </Stack>
        </Stack>
        : 
        <CircularProgress />
        }
            </>
    )
}

export { ProgressOrbits as ProgressBars };