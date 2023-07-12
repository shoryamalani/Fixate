import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";



const AddTaskOverlay = (props) => {
    const { open, handleClose} = props;
    const [focusModeName, setFocusModeName] = React.useState('');
    const [duration, setDuration] = React.useState(30);
    const [showTimeRequirements, setShowTimeRequirements] = React.useState(false);
    const [showNameRequirements, setShowNameRequirements] = React.useState(false);
    
    const changeDuration = (e) => {
        setDuration(e.target.value)
    }

    const readySubmit = (type) => {
        if(type === 'cancel'){   
            setDuration(20)
            setShowTimeRequirements(false)
            setFocusModeName('')
            handleClose({duration:duration, type:type})
            return;
        }
        if(duration < 5 || duration > 120){
            setShowTimeRequirements(true)
            return false;
        }
        if(focusModeName.length < 3 || focusModeName.length > 40){
            setShowNameRequirements(true)
            return false;
        }

        setShowTimeRequirements(false)
        setDuration(20)
        handleClose({duration:duration, type:type, name:focusModeName})
        return true;
    }
    return (
    <Dialog open={open} onClose={()=>handleClose('cancel')}>
    <DialogTitle>Create a task to work on</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Set a task with a definite ending. 
      </DialogContentText>
        {
            showNameRequirements &&
            <DialogContentText style={{color:'red'}}>
                The name must be at least 3 characters long but less than 40 characters
            </DialogContentText>
        }
        <TextField
        autoFocus
        margin="dense"
        label="Task Name"
        type="text"
        value={focusModeName}
        onChange={(e)=>{setFocusModeName(e.target.value)}}
        fullWidth
        variant="standard"
        />
        <Grid2 container style={{justifyContent:'center'}} spacing={2}>
        <Button variant='contained' style={{'margin':'1em'}} onClick={()=>{setFocusModeName("Writing an essay");setDuration(60)}}>Writing an Essay</Button> 
        <Button variant='contained' style={{'margin':'1em'}} onClick={()=>{setFocusModeName("Studying for a test");setDuration(60)}}>Studying for a test</Button>
        <Button variant='contained' style={{'margin':'1em'}} onClick={()=>{setFocusModeName("Doing SAT/ACT Prep");setDuration(45)}}>Doing SAT/ACT Prep</Button>
        <Button variant='contained' style={{'margin':'1em'}} onClick={()=>{setFocusModeName("Reading a Book");setDuration(30)}}>Reading a Book</Button>
        </Grid2>


      {
        showTimeRequirements &&
        <DialogContentText style={{color:'red'}}>
            The minimum duration is 5 minutes and the maximum duration is 120 minutes
        </DialogContentText>
    }
      <TextField
        autoFocus
        margin="dense"
        label="Duration"
        type="number"
        value={duration}
        onChange={(e)=>{changeDuration(e)}}
        fullWidth
        variant="standard"
      />
      <Grid2 container direction='row' style={{justifyContent:'center'}} spacing={2}>
        <Button style={{'margin':'1em'}} variant='contained' onClick={()=>setDuration(15)}>15</Button>
        <Button style={{'margin':'1em'}} variant='contained' onClick={()=>setDuration(30)}>30</Button>
        <Button style={{'margin':'1em'}} variant='contained' onClick={()=>setDuration(45)}>45</Button>
        <Button style={{'margin':'1em'}} variant='contained' onClick={()=>setDuration(60)}>60</Button>
    </Grid2>
    </DialogContent>

    <DialogActions>
      <Button variant='contained' onClick={()=>readySubmit('cancel')}>Cancel</Button>
        <Button variant='contained' onClick={()=>readySubmit('create')}>Create Focus Mode</Button>
    </DialogActions>
  </Dialog>
    )
}

export default AddTaskOverlay;