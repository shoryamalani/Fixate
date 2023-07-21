import { QuestionMark } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton,Button } from "@mui/material";
import React from "react";

function ContextualHelp(props){
    const {styles} = props;
    const [open, setOpen] = React.useState(false);
    return (
        <>
         <IconButton style={styles ==undefined? {height:'2em',width:'2em',display:"block",position:'absolute',right:'0.5em',top:'0.5em'}: styles} onClick={()=>{
            setOpen(true);
         }}><QuestionMark></QuestionMark></IconButton>
        <Dialog open={open} onClose={()=>setOpen(false)} style={{padding:'1em'}}>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {props.children}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={()=>setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        

        </>
    );
}
export default ContextualHelp;