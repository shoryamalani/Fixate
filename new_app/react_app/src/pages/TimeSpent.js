import React from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
function TimeSpent() {
  return (
    <div>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
      <h1 style={css.h1}>Time Spent</h1>
    <Stack direction="row" spacing={2}>
      <Button variant='contained' color='success'><span>Start Server</span></Button>
      <Button variant='contained' color='error'><span>Restart Server (Shouldnt be needed)</span></Button>
    </Stack>
    </div>
  )
}

export default TimeSpent
