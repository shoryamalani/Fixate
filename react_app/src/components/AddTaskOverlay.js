import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";



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
    </DialogContent>

    <DialogActions>
      <Button variant='contained' onClick={()=>readySubmit('cancel')}>Cancel</Button>
        <Button variant='contained' onClick={()=>readySubmit('create')}>Create Focus Mode</Button>
    </DialogActions>
  </Dialog>
    )
}

export default AddTaskOverlay;