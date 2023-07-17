
import React, { useEffect, useState } from 'react';
import { Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { CircularProgressWithLabel } from './CircularProgressBar';
import { CheckBoxOutlineBlank } from '@mui/icons-material';
import { CheckBoxIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
const  SmartTaskList = (props) => {
    const { tasks, seeFocusModesFunction,setNotCompletedFunction, setCompletedFunction, deleteTaskFunction, startFocusModeForTaskFunction, checkFilterFunction } = props;
    return (
        <TableContainer component={Paper} style={{ maxWidth:'inherit' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell>Task name</TableCell>
            {/* <TableCell align="right">Estimated Duration</TableCell>
            <TableCell align="right">Status</TableCell> */}
            {/* <TableCell align="right">Current Time Spent</TableCell> */}
            <TableCell align="right">Progress</TableCell>
            {/* <TableCell align="right">See Focus Modes</TableCell> */}
            {/* <TableCell align="right">Start Focus Mode</TableCell> */}
            <TableCell align="right">Actions</TableCell>
            {/* <TableCell align="right">Delete</TableCell> */}
          </TableRow>
        </TableHead>
        {tasks!= null &&
        <TableBody>
          {Object.keys(tasks).map((task) => (
            <TableRow
              key={tasks[task].id}
              style={{visibility: checkFilterFunction(tasks[task].id) ? 'visible':'collapse', backgroundColor: tasks[task]['complete'] ? 'green':'inherit'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Stack direction='row'>
                <h3>{tasks[task]['name']}</h3>
              {/* <IconButton variant='contained' onClick={()=>{startFocusModeForTaskFunction(tasks[task]['name'],tasks[task]['id'])}} color='success'>
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
              <TableCell align="right">
                <Stack direction='row' spacing={1} style={{display:'flex',flex:1,justifyItems:'center',justifyContent:'center'}}>
                <Button variant='contained'  onClick={()=>{startFocusModeForTaskFunction(tasks[task]['name'],tasks[task]['id'])}}><PlayArrowIcon></PlayArrowIcon></Button>
                 <p style={{textAlign:'left'}}>{tasks[task]['time_completed']} mins</p>
                 <div>
                <CircularProgressWithLabel right={0}  value={(tasks[task]['time_completed']/tasks[task]['estimated_time'])*100} />
                </div>
                </Stack>
                </TableCell>
              {/* <TableCell align="right"><Button variant='contained'  onClick={()=>{seeFocusModesFunction(tasks[task]['ids_of_focus_modes'])}}>See Time</Button></TableCell> */}
              {/* <TableCell align="right"><Button variant='contained' onClick={()=>{startFocusModeForTaskFunction(tasks[task]['name'],tasks[task]['id'])}}>Start Focus Mode</Button></TableCell> */}
              <TableCell align="right">
                <Stack direction='row' spacing={1}>
              
                {
                !tasks[task]['complete'] ?
                <Button variant='contained' color='success' onClick={()=>{setCompletedFunction(tasks[task]['id'])}}>
                    <CheckIcon></CheckIcon>
                </Button>
                :
                <Button variant='contained' color='failure' onClick={()=>{setNotCompletedFunction(tasks[task]['id'])}}>
                    <CloseIcon></CloseIcon>
                  </Button>

                }
                <Button variant='contained' color='failure' onClick={()=>{deleteTaskFunction(tasks[task]['id'])}} >
                    <DeleteIcon></DeleteIcon>
                </Button>
                </Stack>
            </TableCell>
              </TableRow>
            ))}
        </TableBody>}

        </Table>
      </TableContainer>
    )
}
export default SmartTaskList;