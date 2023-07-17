
import React, { useEffect, useState } from 'react';
import { Button, Divider, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider } from "@mui/material"
import { CircularProgressWithLabel } from './CircularProgressBar';
import { CheckBoxOutlineBlank, Refresh, Token } from '@mui/icons-material';
import { CheckBoxIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { theme } from 'antd';
const useToken = theme.useToken;
const  SmartTaskList = (props) => {
    const token = useToken();
    const { tasks, seeFocusModesFunction,setNotCompletedFunction, setCompletedFunction, deleteTaskFunction, startFocusModeForTaskFunction, checkFilterFunction } = props;
    return (
        <TableContainer style={{ maxWidth:'inherit' }}>
        <Table >
        <TableHead>
          <TableRow style={{fontSize:24}}>
            <TableCell align='center' style={{fontSize:20}}>Task name</TableCell>
            {/* <TableCell align="right">Estimated Duration</TableCell>
            <TableCell align="right">Status</TableCell> */}
            {/* <TableCell align="right">Current Time Spent</TableCell> */}
            <TableCell align="center" style={{fontSize:20}}>Start Focus Mode</TableCell>
            <TableCell align="center" style={{fontSize:20}}>Progress</TableCell>
            {/* <TableCell align="right">See Focus Modes</TableCell> */}
            {/* <TableCell align="right">Start Focus Mode</TableCell> */}
            <TableCell align="center" style={{fontSize:20}}>Actions</TableCell>
            {/* <TableCell align="right">Delete</TableCell> */}
          </TableRow>
        </TableHead>
        {tasks != null ?
        <TableBody>
          {Object.keys(tasks).length > 0 ?
          Object.keys(tasks).map((task) => (
            <TableRow
              key={tasks[task].id}
              style={{visibility: checkFilterFunction(tasks[task].id) ? 'visible':'collapse', backgroundColor: tasks[task]['complete'] ? 'rgba(29,55,19,0.54)' :'inherit'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" align='center' scope="row">
                <Stack direction='row'>
                <h3>{tasks[task]['name']}</h3>
              {/* <IconButton variant='outlined' onClick={()=>{startFocusModeForTaskFunction(tasks[task]['name'],tasks[task]['id'])}} color='success'>
                <PlayCircleFilledWhiteIcon></PlayCircleFilledWhiteIcon>
                </IconButton>
                <p>{tasks[task]['name']}</p>
                 */}
                 </Stack>
              </TableCell>
              {/* <TableCell align="right">{tasks[task]['estimated_time']}</TableCell> */}
              
              {/* <TableCell align="right">{tasks[task]['complete'] ? <CheckBoxIcon></CheckBoxIcon> : <CheckBoxOutlineBlank></CheckBoxOutlineBlank> }</TableCell> */}
              {/* <TableCell align="right">
                <Stack direction='column'>
                
                
                </Stack></TableCell> */}
                <TableCell align="center">
                <Button variant='outlined'  onClick={()=>{startFocusModeForTaskFunction(tasks[task]['name'],tasks[task]['id'])}}><PlayArrowIcon></PlayArrowIcon></Button>
                </TableCell>
              <TableCell align="center">
                <Stack direction='row' spacing={1} style={{display:'flex',flex:1,justifyItems:'center',justifyContent:'center'}}>
                
                 <p style={{textAlign:'left'}}>{tasks[task]['time_completed']} mins</p>
                 <Divider orientation="vertical"  flexItem />
                 <div>
                <CircularProgressWithLabel right={0}  value={(tasks[task]['time_completed']/tasks[task]['estimated_time'])*100} />
                </div>
                </Stack>
                </TableCell>
              {/* <TableCell align="right"><Button variant='outlined'  onClick={()=>{seeFocusModesFunction(tasks[task]['ids_of_focus_modes'])}}>See Time</Button></TableCell> */}
              {/* <TableCell align="right"><Button variant='outlined' onClick={()=>{startFocusModeForTaskFunction(tasks[task]['name'],tasks[task]['id'])}}>Start Focus Mode</Button></TableCell> */}
              <TableCell align="">
                <Stack direction='row' style={{justifyContent:'center'}} spacing={1}>
              
                {
                !tasks[task]['complete'] ?
                <Button variant='outlined' color='success' onClick={()=>{setCompletedFunction(tasks[task]['id'])}}>
                    <CheckIcon></CheckIcon>
                </Button>
                :
                <Button variant='outlined' color='info' onClick={()=>{setNotCompletedFunction(tasks[task]['id'])}}>
                    <Refresh></Refresh>
                  </Button>

                }
                <Button variant='outlined' color='failure' onClick={()=>{deleteTaskFunction(tasks[task]['id'])}} >
                    <DeleteIcon></DeleteIcon>
                </Button>
                </Stack>
            </TableCell>
              </TableRow>
            ))
            :
            <TableRow>
                <TableCell>
                    <h3>No Tasks</h3>
                </TableCell>
                </TableRow>
            }
        </TableBody>
        :
        <TableRow>
        <TableCell>
            <h3>Add a task ...</h3>
        </TableCell>
        </TableRow> 
        }

        </Table>
      </TableContainer>
    )
}
export default SmartTaskList;