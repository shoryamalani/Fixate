
import React, { useEffect, useState } from 'react';
import { Avatar, Button, Container, Icon, IconButton, Input, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, private_createTypography } from '@mui/material';
import css from '../Style';
import { useSelector } from 'react-redux';
import { setUserData } from '../features/UserSlice';
import { useDispatch } from 'react-redux';
import { CircularProgressWithLabel } from './CircularProgressBar';
import { blue } from '@mui/material/colors';
// import { Icon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Refresh } from '@mui/icons-material';
import ContentDiv from './ContentDiv';
// import { Divider, Space } from 'antd';
// import AddIcon from '@mui/icons-material/Add';

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
                    
                if (data['user_data']['server_data']['friends_data'] == null){
                    getFriendDataNow();
                    return;
                }
                if(data['user_data']['server_data']['user_data'] == null){
                    data['user_data']['server_data']['user_data'] = data['user_data']['server_data']['data'] 
                }
                dispatch(setUserData(data));
                getFriendDataNow();
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
            window.location.reload();
        }).catch(error => { alert("Friend Add Failed") });
    }
    return (
        <>
            <Stack direction='row' flex={1} spacing={2} style={{textAlign:'center',justifyContent:'center',alignItems:'center',borderRadius:'3em',alignContent:'center'}}>

        <Stack direction='column' spacing={2}>
            <ContentDiv>
        <h1 style={{fontSize:44}}>User Profile</h1>
      {userData != null ?
      <>
        <p style={{fontSize:30}}><strong >Current Display Name:</strong> {userData['user_data']['name']}</p>
        { userData['user_data']['server_data'] != null &&
        <p style={{fontSize:30}}>Share Code: {userData['user_data']['server_data']['user_data']['share_code']}</p>
    }
        
        </>
        :
        <>
        <p>Having an account can allow you to be able to have live focus modes with your friends </p>
        </>
        
    }

        {/* center items in the stack */}
    <Stack direction={'row'} spacing={3} justifyContent='center'>
    {/* <label id='display_name'>Set Display Name</label> */}
      <TextField label='Set Display Name' value={displayName} onChange={(e)=>{setDisplayName(e.target.value)}}  />
      {userData != null ? <Button color='info' variant='outlined' onClick={()=>changeName()}>Change Name</Button>: null}
      {userData == null && <Button color='success' variant='outlined' onClick={()=>{createUser()}}>Create User</Button>}
      </Stack>
      <p>Show on public leader board</p>
        <Stack direction={'row'} spacing={3} justifyContent='center'>
      <Switch checked={privacy}  id='privacyChecked' onChange={(e)=>{
    
        changePrivacy(e.target.checked)
        }} />
      </Stack>
        <Stack direction={'row'} spacing={3} justifyContent='center' style={{fontSize:30}}>
      <p>To be clear it will never show what you have spent your time on,<br></br> only stats like average time between distractions, your efficiency in work, and the longest time you have gone without distractions. </p>
       </Stack>
         
         {userData != null ?
      <>
        <h2>Add Friends</h2>
        <Stack direction={'row'} justifyContent={'center'} spacing={3}>
            <TextField value={friendDisplayName} onChange={(e)=>setFriendDisplayName(e.target.value)} label='Enter Display name' />
            <TextField value={friendShareCode} onChange={(e)=>setFriendShareCode(e.target.value)} label='Enter Share Code' />
            <Button color='success' variant='outlined' onClick={addFriend}><AddIcon/></Button>
        </Stack>
        
        </>
        :
        null
        
    }
      </ContentDiv>
    </Stack>
    {/* { userData['user_data'] != undefined && */}
    
        <Stack>
            <ContentDiv>
    <Container>
        <Stack direction={"row"} style={{display:'flex',justifyContent:'center'}}>
        <h1>Friends <Button color='success' style={{height:'3em',width:'3em'}} variant='outlined' onClick={()=>{getFriendDataNow()}}><Refresh></Refresh></Button></h1>
        
        </Stack>
        <TableContainer component={Paper} style={{ minWidth: 650, maxHeight:'60vh' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell style={{fontSize:20}}>Friend Display Name</TableCell>
            <TableCell align="center" style={{fontSize:20}}>Time logged In the last half hour (min)</TableCell>
            <TableCell align="center" style={{fontSize:20}}>Percent Focused</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
        { userData != null && userData['user_data']['server_data']['friends_data'] != null && 
          userData['user_data']['server_data']['friends_data'].map((friend) => (
            <TableRow
              key={friend['id']}
            //   style={{visibility: checkFilter(currentTasks[task].id) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Stack direction="row"><p style={{fontSize:16,padding:0}}> {friend['name']}</p></Stack></TableCell>
                <TableCell align="center"> {friend['data'] != null && friend['data']['live'] ? (friend['data']['live']['total_time_spent']/60).toFixed(0): 0 }</TableCell>
                <TableCell align="center">
                {friend['data'] != null && friend['data']['live'] ? 
                friend['data']['live']['total_time_spent'] !== 0 ?
                <>
                <CircularProgressWithLabel value={[100*((friend['data']['live']['total_time_spent']-(friend['data']['live']['distractions_time_total']*60))/friend['data']['live']['total_time_spent'])]}></CircularProgressWithLabel></>:null: null}</TableCell>
              </TableRow>
            ))
        }
        </TableBody>

        </Table>
      </TableContainer>

    </Container>
    </ContentDiv>
    </Stack>
  {/* } */}
    {/* } */}
    </Stack>
      
      </>
    )
}

export { UserProfileCard };