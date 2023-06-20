
import React, { useEffect, useState } from 'react';
import { Button, Container, Input, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, private_createTypography } from '@mui/material';
import css from '../Style';
import { useSelector } from 'react-redux';
import { setUserData } from '../features/UserSlice';
import { useDispatch } from 'react-redux';
import { CircularProgressWithLabel } from './CircularProgressBar';

function UserProfileCard() {
    const userData = useSelector(state => state.user.userData);
    const [displayName, setDisplayName] = useState('');
    const [privacy, setPrivacy] = useState(true);
    const [friendDisplayName, setFriendDisplayName] = useState('');
    const [friendShareCode, setFriendShareCode] = useState('');
    const dispatch = useDispatch();

    const getUserData = async () => {
        fetch('http://localhost:5005/get_current_user').then(response => response.json()).then(data => {
            console.log(data)
            data = data['user']
            if (data['user_id'] != null) {
                console.log(data)
                if (data['user_data']['name'] != null) {
                    setDisplayName(data['user_data']['name'])
                }
                if (data['user_data']['privacy_level'] != null) {
                    console.log(data['user_data']['privacy_level'] == false)
                    setPrivacy(data['user_data']['privacy_level'] == 'public')
                    // document.getElementById('privacyChecked')
                }
                    

                dispatch(setUserData(data));
            }
        }).catch(error => { console.log(error)});
    }
    useEffect(() => {
        if (userData == null) {
            getUserData();
        }
    }, [userData])
    const checkName = () => {
        if (displayName.length < 3) {
            alert("Display name must be at least 3 characters long")
            return true;
        }
        return false;
    }
    const changeName = async () => {
        if(checkName()){
            return;
        }
        const response = await fetch('http://localhost:5005/set_display_name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "display_name": displayName
            })
        }).then(
            response => response.json()
        ).then(data => {
            console.log(data)
            getUserData();
        }).catch(error => { alert("Name Change Failed") });
    }
    const createUser = () => {
        if(checkName()){
            return;
        }
        // var privacy = document.getElementById('privacyChecked').checked
        console.log("http://localhost:5005/create_user")
        const response = fetch('http://localhost:5005/create_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": displayName,
                "privacy_level": privacy ? 'public' : 'private'

            })
        }).then(
            response => response.json()
        ).then(data => {
            console.log(data)
            // reload window
            window.location.reload();
            setDisplayName(data['user_data']['name'])
            dispatch(setUserData(data['user']))
            console.log(userData)
        }).catch(error => { window.location.reload(); });
    }
    const getFriendDataNow = async () => {
        const response = await fetch('http://localhost:5005/get_friend_data_now').then(response => response.json()).then(data => {
            console.log(data)
            getUserData();
        }).catch(error => { console.log(error) });
    }



    const changePrivacy = async (e) => {
        // var privacy = document.getElementById('privacyChecked').checked
        setPrivacy(e)
        var privacy = e
        const response = await fetch('http://localhost:5005/set_privacy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "privacy_level": privacy ? 'public' : 'private'
            })
        }).then(
            response => response.json()
        ).then(data => {
            console.log(data)

        }).catch(error => { alert("Privacy Change Failed") });
    }
    const addFriend = async () => {
        if (friendDisplayName.length < 3) {
            alert("Display name must be at least 3 characters long")
            return;
        }
        if (friendShareCode.length < 6) {
            alert("Share code must be 6 characters long")
            return;
        }
        const response = await fetch('http://localhost:5005/add_friend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "friend_name": friendDisplayName,
                "friend_share_code": friendShareCode
            })
        }).then(
            response => response.json()
        ).then(data => {
            console.log(data)
        }).catch(error => { alert("Friend Add Failed") });
    }
    return (
        <>
            <Stack direction='column' spacing={2}>
        <div>
        <Stack direction='column' spacing={2}>
        <h1 style={css.h1}>User Profile</h1>
      {userData != null ?
      <>
        <p>Current Display Name: {userData['user_data']['name']}</p>
        <p>Share Code: {userData['user_data']['server_data']['user_data']['data']['share_code']}</p>
        
        </>
        :
        <>
        <p>Having an account can allow you to be able to have live focus modes with your friends </p>
        </>
        
    }

    <Container  >
        {/* center items in the stack */}
    <Stack direction={'row'} spacing={3} justifyContent='center'>
    {/* <label id='display_name'>Set Display Name</label> */}
      <TextField label='Set Display Name' value={displayName} onChange={(e)=>{setDisplayName(e.target.value)}}  />
      {userData != null ? <Button color='info' variant='contained' onClick={()=>changeName()}>Change Name</Button>: null}
      </Stack>
      <p>Show on public leader board</p>
        <Stack direction={'row'} spacing={3} justifyContent='center'>
      <Switch checked={privacy}  id='privacyChecked' onChange={(e)=>{
    
        changePrivacy(e.target.checked)
        }} />
      </Stack>
        <Stack direction={'row'} spacing={3} justifyContent='center'>
      <p>To be clear it will never show what you have spent your time on,<br></br> only stats like average time between distractions, your efficiency in work, and the longest time you have gone without distractions. </p>
       </Stack>
         {userData == null && <Button color='success' variant='contained' onClick={()=>{createUser()}}>Create User</Button>}
         {userData != null ?
      <>
        <h2>Add Friends</h2>
        <Stack direction={'row'} justifyContent={'center'} spacing={3}>
            <TextField value={friendDisplayName} onChange={(e)=>setFriendDisplayName(e.target.value)} label='Enter Display name' />
            <TextField value={friendShareCode} onChange={(e)=>setFriendShareCode(e.target.value)} label='Enter Share Code' />
            <Button color='success' variant='contained' onClick={addFriend}>Add Friend</Button>
        </Stack>
        
        </>
        :
        null
        
    }
      </Container>
    </Stack>
    </div>
    {/* { userData['user_data'] != undefined && */}
    { userData != null && userData['user_data']['server_data']['friends_data'] != null &&
    <div style={css.contrastContent}>
        <Stack>
    <Container>
        <h1>Friends</h1>
        <Button color='success' variant='contained' onClick={()=>{getFriendDataNow()}}>Refresh</Button>
        <TableContainer component={Paper} style={{ minWidth: 650, maxHeight:'60vh' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell>Friend Display Name</TableCell>
            <TableCell align="right">Time logged In the last half hour (min)</TableCell>
            <TableCell align="right">Percent Focused</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
        
          {userData['user_data']['server_data']['friends_data'].map((friend) => (
            <TableRow
              key={friend['id']}
            //   style={{visibility: checkFilter(currentTasks[task].id) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{friend['name']}</TableCell>
                <TableCell align="right">{friend['data']['live'] != null ? friend['data']['live']['total_time_spent']/60: 0 }</TableCell>
                <TableCell align="right">{<CircularProgressWithLabel value={[100*((friend['data']['live']['total_time_spent']-(friend['data']['live']['distractions_time_min']*60))/friend['data']['live']['total_time_spent'])]}></CircularProgressWithLabel>}</TableCell>
              </TableRow>
            ))}
        </TableBody>

        </Table>
      </TableContainer>

    </Container>
    </Stack>
    </div>
    }
    </Stack>
    {/* } */}
      
      </>
    )
}

export { UserProfileCard };