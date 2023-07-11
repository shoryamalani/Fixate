import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";



const StartFocusModeOverlay = (props) => {
    const { open, handleClose,focusModeData} = props;
    const [duration, setDuration] = React.useState(20);
    const [showTimeRequirements, setShowTimeRequirements] = React.useState(false);
    const changeDuration = (e) => {
        setDuration(e.target.value)
    }

    const readySubmit = (type) => {
        if(type === 'cancel'){   
            setDuration(20)
            setShowTimeRequirements(false)
            handleClose({duration:duration, type:type})
            return;
        }
        if(duration < 5 || duration > 120){
            setShowTimeRequirements(true)
            return false;
        }
        setShowTimeRequirements(false)
        setDuration(20)
        handleClose({duration:duration, type:type, name:focusModeData.name, id:focusModeData.id})
        return {duration:duration, type:type};
    }

    return (
    <Dialog open={open} onClose={()=>handleClose({'type':'cancel',duration:0})}>
    <DialogTitle>Set focus mode length for {focusModeData.name}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter the duration of the focus mode in minutes
      </DialogContentText>
      { showTimeRequirements &&
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
        <Button variant='contained' onClick={()=>readySubmit('focused')}>Start Focused Apps</Button>
        <Button variant='contained' onClick={()=>readySubmit('distracting')}>Start Blocking Distracting</Button>
    </DialogActions>
  </Dialog>
    )
}

export default StartFocusModeOverlay;