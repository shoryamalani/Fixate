
import React, { useEffect, useState } from 'react';
import { Button, Container, Input, Stack, Switch, TextField } from '@mui/material';
import css from '../Style';
import { useSelector } from 'react-redux';
import { setUserData } from '../features/UserSlice';
import { useDispatch } from 'react-redux';

function UserProfileCard() {
    const userData = useSelector(state => state.user.userData);
    const [displayName, setDisplayName] = useState('');
    const [privacy, setPrivacy] = useState(true);
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
                dispatch(setUserData(data));
            }
        }).catch(error => { console.log(error)});
    }
    useEffect(() => {
        if (userData == null) {
            getUserData();
        }
    }, [userData])

    const changeName = async () => {
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
        }).catch(error => { alert("Name Change Failed") });
    }
    const createUser = () => {
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
            setDisplayName(data['user_data']['name'])
            dispatch(setUserData(data['user']))
            console.log(userData)
        }).catch(error => { alert("User Creation Failed") });
    }


    const changePrivacy = async () => {
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


    return (
        <>
        <div>
        <Stack direction='column' spacing={2}>
        <h1 style={css.h1}>User Profile</h1>
      {userData != null ?
      <>
        <p>Current Display Name: {displayName}</p>
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
      <Switch defaultChecked value={privacy} onChange={(e)=>{setPrivacy(e.target.value)}} />
      </Stack>
        <Stack direction={'row'} spacing={3} justifyContent='center'>
      <p>To be clear it will never show what you have spent your time on,<br></br> only stats like average time between distractions, your efficiency in work, and the longest time you have gone without distractions. </p>
       </Stack>
         {userData == null && <Button color='success' variant='contained' onClick={()=>{createUser()}}>Create User</Button>}
         {userData != null ?
      <>
        <h2>Add Friends</h2>
        <Stack direction={'row'} justifyContent={'center'} spacing={3}>
            <TextField label='Enter Display name' />
            <TextField label='Enter Share Code' />
            <Button color='success' variant='contained'>Add Friend</Button>

        </Stack>
        
        </>
        :
        null
        
    }
      </Container>
    </Stack>
    </div>

      </>
      
    )
}

export { UserProfileCard };