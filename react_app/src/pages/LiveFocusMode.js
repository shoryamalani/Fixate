// make a react page that displays friends with an invite button next to them
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Grid, Input, LinearProgress, Stack, TextField, duration } from '@mui/material';
// get the store to get user data from
import { Selector } from 'react-redux';
import { TableContainer } from '@mui/material';
import { Paper } from '@mui/material';
import { Table } from '@mui/material';
import { TableBody } from '@mui/material';
import { TableCell } from '@mui/material';
import { TableHead } from '@mui/material';
import { TableRow } from '@mui/material';
import { Avatar} from '@mui/material';
import css from '../Style';
import { CircularProgressWithLabel } from '../components/CircularProgressBar';
import { blue } from '@mui/material/colors';
import { useDispatch } from 'react-redux';
import { setUserData,setLiveFocusModeData, setLiveFocusModeCachedData } from '../features/UserSlice';
import { notInitialized } from 'react-redux/es/utils/useSyncExternalStore';
import { Line } from 'react-chartjs-2';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Content } from 'antd/es/layout/layout';
import ContentDiv from '../components/ContentDiv';
import { Check, Refresh } from '@mui/icons-material';
import { fontSize } from '@xstyled/styled-components';
import {theme} from 'antd'
const {useToken} = theme;
function LiveFocusMode(){
    const {token} = useToken();
    const userData = useSelector(state => state.user.userData);
    console.log(userData)
    const liveFocusModeData = useSelector(state => state.user.liveFocusModeData);
    const liveFocusModeCachedData = useSelector(state => state.user.liveFocusModeCachedData);
    console.log(liveFocusModeData)
    const [liveFocusModeName, setLiveFocusModeName] = useState('');
    const [userChartData, setUserChartData] = useState({
        labels: [],
    });
    const [leaderboardList, setLeaderboardList] = useState([]);
    const dispatch = useDispatch();

    if(userData!=null){
        if(userData['user_data']['server_data']['friends_data'] !== null){
            if(userData['user_data']['server_data']['friends_data'].length === 0){
                console.log("In dedication to Mark Wood, maybe you should not have said 'make me a sandwich.'")
                }
        }
    }
    const getUserData = async () => {
        fetch('http://localhost:5005/get_current_user').then(response => response.json()).then(data => {
            console.log(data)
            data = data['user']
            if (data['user_id'] != null) {
                console.log(data)
                dispatch(setUserData(data));
            }
        }).catch(error => { console.log(error)});
    }
    useEffect(() => {
        if (userData == null) {
            getUserData();
        }
        console.log(liveFocusModeData)
        if (liveFocusModeData == null) {

            getLiveModeData();
        }
    }, [userData ,liveFocusModeData])

    const getLiveModeData = async () => {
        fetch('http://localhost:5005/get_live_focus_mode_data').then(response => response.json()).then(data => {
            console.log(data)

            if(('live_focus_data' in data)){
                data = data['live_focus_data']
            }
            if (data == null) {
                console.log("data is null")
            }

            if (data['status'] === 'success') {
                console.log(data)
                dispatch(setLiveFocusModeData(data));
                getUserData();
            }
        }).catch(error => { console.log(error)});
    }

    const inviteFriend = async (friend_id) => {
        console.log(friend_id)
        const response = await fetch('http://localhost:5005/invite_friend_to_live_focus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "friend_id": friend_id
            })
        }).then(response => response.json()).then(data => {
            console.log(data)
            getUserData();
            getLiveModeData();
        }).catch(error => { console.log(error) });
    }
    function createLiveFocusMode(){
        if(liveFocusModeName.length < 3){
            alert("Live Focus Mode Name must be at least 3 characters long")
            return;
        }
        const response = fetch('http://localhost:5005/create_live_focus_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": liveFocusModeName
            })
        }).then(response => response.json()).then(data => {
            console.log(data)
            if(data['status'] === 'success'){
                alert("Live Focus Mode Created")
                getLiveModeData();
            }else{
                alert("Failed")
            }
        }).catch(error => { console.log(error) });
    }
    const joinLiveFocusMode = async (id) => {
        console.log(id)
        const response = await fetch('http://localhost:5005/join_live_focus_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id": id
            })
        }).then(response => response.json()).then(data => {
            console.log(data)
            if(data['status'] === 'success'){
                alert("Joined Live Focus Mode")
                getLiveModeData();
            }else{
                window.location.reload();
            }
        }).catch(error => { console.log(error) });
    }
    const endFocusMode = async () => {
        const response = await fetch('http://localhost:5005/end_live_focus_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            })
        }).then(response => response.json()).then(data => {
            console.log(data)
        }).catch(error => { console.log(error) });
        window.location.reload();
    }
    const leaveLiveFocusMode = async()=>{
        const response = await fetch('http://localhost:5005/leave_live_focus_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            })
        }).then(response => response.json()).then(data=>{
            console.log(data)
        }).catch(error => { console.log(error) });
        window.location.reload();
    }
    const getCachedLiveModeData = async () => {
        fetch('http://localhost:5005/get_cached_live_focus_mode_data').then(response => response.json()).then(data => {
            console.log(data)
            if (data['status'] === 'success') {
                console.log(data['data']['data']['data'])
                var newUserChartData = userChartData
                
                for(var key in data['data']['data']['data']['time_data']){
                    if(!(key in userChartData)){
                        newUserChartData[key] = []
                    }
                    if(!(key in newUserChartData['labels'])){
                        newUserChartData['labels'][key] = []
                    }
                    if(newUserChartData['labels'][key].length > 0){
                        if(newUserChartData['labels'][key][newUserChartData['labels'][key].length-1] !=data['data']['data']['data']['seconds'][key]['focused'] + data['data']['data']['data']['seconds'][key]['unfocused']){
                            newUserChartData['labels'][key].push(data['data']['data']['data']['seconds'][key]['focused'] + data['data']['data']['data']['seconds'][key]['unfocused'])
                            newUserChartData[key].push(100*(data['data']['data']['data']['seconds'][key]['focused']/(data['data']['data']['data']['seconds'][key]['focused'] + data['data']['data']['data']['seconds'][key]['unfocused'])))
                        }
                    }else{
                        newUserChartData['labels'][key].push(data['data']['data']['data']['seconds'][key]['focused'] + data['data']['data']['data']['seconds'][key]['unfocused'])
                        newUserChartData[key].push(100*(data['data']['data']['data']['seconds'][key]['focused']/(data['data']['data']['data']['seconds'][key]['focused'] + data['data']['data']['data']['seconds'][key]['unfocused'])))
                    }
                }
                var newLeaderboardList = []
                for(var key in data['data']['data']['data']['time_data']){
                    newLeaderboardList.push({
                        'name':data['data']['data']['member_names'][key],
                        'percent_focused':100*(data['data']['data']['data']['seconds'][key]['focused']/(data['data']['data']['data']['seconds'][key]['focused'] + data['data']['data']['data']['seconds'][key]['unfocused'])),
                        'id':key
                    })
                }
                // sort the leaderboard list
                newLeaderboardList.sort((a,b)=>{return b['percent_focused']-a['percent_focused']})
                setLeaderboardList(newLeaderboardList)
                setUserChartData(newUserChartData)
                console.log(newUserChartData)
                dispatch(setLiveFocusModeCachedData(data['data']));
            }
        }).catch(error => { console.log(error)});
    }

    // get cached data every 2 seconds
    useEffect(() => {
        setInterval(() => {
            console.log("getting cached data")
            if(liveFocusModeData != null){
                if(liveFocusModeData['data'] != null){
                    if(liveFocusModeData['data']['active'] == true){
                        console.log("getting cached data final")
                         getCachedLiveModeData();
                    }
                }
            }
        }, 2000);
        
    }, [liveFocusModeData]);


    return (
        <div style={{width:'100%',color:'white',display:'flex',alignItems:'center'}}>
            <Stack direction='column' style={{width:'100%',color:'white',display:'flex',alignItems:'center'}} spacing={3}>
            <h1 style={{fontSize:44}}>Live Focus Mode</h1>
                {liveFocusModeCachedData != null && liveFocusModeCachedData['data'] != null && liveFocusModeCachedData['data']['active'] == true &&
            <ContentDiv style={{marginBottom:'0em'}}>
            <Stack direction='row' spacing={10}>
                <Stack style={{padding:0,margin:0}} direction='column' spacing={3}>
            <h2 style={{padding:0,margin:0}}>Focus Mode : {liveFocusModeData['data']['name']}</h2>
            <h2 style={{padding:0,margin:0}}>Owner: {liveFocusModeData['data']['owner_name']}</h2>
            </Stack>
            <Button color='error' variant='outlined' onClick={()=>{leaveLiveFocusMode()}}>Leave Focus Mode</Button>
            </Stack>
            </ContentDiv>
                }
        {liveFocusModeCachedData != null && liveFocusModeCachedData['data'] != null && liveFocusModeCachedData['data']['active'] == true &&
    <>
        <Stack direction='column'  style={{width:"100%",height:'100%'}}>

            <ContentDiv  style={{flex:1}}>
            <Stack direction={'column'} style={{width:"100%"}} spacing={3}>
            <h2 style={{textAlign:'center'}}>Live Focus Mode Data</h2>
            <Grid2 container spacing={2}>
            {
                liveFocusModeCachedData['data']['members'].map((member) => (
                    <div style={{width:'50%',height:'100%'}}>
                        {/* <p></p> */}
                        {/* Chart js line chart */}
                            <Line  style={{width:'100%'}}options={{
                                    responsive: true,
                                        plugins: {
                                        legend: {
                                        position: 'top',
                                        },
                                        title: {
                                        display: true,
                                        text:liveFocusModeCachedData['data']['member_names'][member] + ' Focus Percentage',
                                        color:'white',
                                        font:{
                                            size:20
                                        }
                                        },
                                        subtitle:{
                                            display:true,
                                            color:'white',
                                            text:`distracted: ${(liveFocusModeCachedData['data']['data']['seconds'][member]['unfocused']/60).toFixed(1)} minutes    |    focused: ${(liveFocusModeCachedData['data']['data']['seconds'][member]['focused']/60).toFixed(1)} minutes`,
                                            font:{
                                                size:14
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            min: 0,
                                            max: 100
                                        }
                                    }
                            }} data={{
                                labels:userChartData['labels'][member],
                                datasets: [{
                                    label: 'Focus Percentage',
                                    data: member in userChartData ? userChartData[member] : [],
                                    fill: true,
                                    borderColor:  liveFocusModeCachedData['data']['data']['time_data'][parseInt(member)] ? token.colorSuccess: token.colorError ,
                                    backgroundColor: liveFocusModeCachedData['data']['data']['time_data'][parseInt(member)] ? 'rgba(0,0,0,0)' : 'rgba(0, 0, 0,0)',

                                }]
                            }}></Line>
                    </div>
                ))
            }                
            </Grid2>
            
            </Stack>
    </ContentDiv>
    
        
        </Stack>
    </>
    
}

<Stack direction='row' style={liveFocusModeCachedData != null && liveFocusModeCachedData['data'] != null && liveFocusModeCachedData['data']['active'] == true ? {width:'100%'}:{}} spacing={3}>
    {liveFocusModeCachedData != null && liveFocusModeCachedData['data'] != null && liveFocusModeCachedData['data']['active'] == true &&
    <ContentDiv style={{flex:1}}>
    {/* Leaderboard spot */}
    <Stack direction={'column'} spacing={3}>
    <h2 style={{textAlign:'center'}}>Leaderboard</h2>
    <TableContainer component={Paper} style={{ minWidth: 650, maxHeight:'60vh' }}>
<Table >
<TableHead>
    <TableRow>
        <TableCell style={{fontSize:20}}>Friend Display Name</TableCell>
        <TableCell style={{fontSize:20}} align="right">Percent Focused</TableCell>
    </TableRow>
</TableHead>
<TableBody>
    {leaderboardList.map((member) => (
        <TableRow
            key={member.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
            <TableCell component="th" scope="row"><Avatar sx={{bgcolor:blue[500]}}>{member.name[0]}</Avatar> {member.name}</TableCell>
            <TableCell align="right">{<CircularProgressWithLabel color={Math.round(member.percent_focused)>=80 ? 'success':'failure'} value={member.percent_focused}></CircularProgressWithLabel>}</TableCell>
        </TableRow>
    ))}
</TableBody>
</Table>
</TableContainer>
</Stack>
</ContentDiv>

    }
        {userData != null && liveFocusModeData != null ?
         liveFocusModeData['data'] != null && liveFocusModeData['data']['owner_id'] == String(userData['user_id']) ? 
            userData['user_data']['server_data']['friends_data'] === undefined ? <h2>No Friends added</h2>:
            <>
    <ContentDiv style={{flex:1}}>
            
            <Stack direction={'column'} spacing={3}>
            <h2 style={{textAlign:'center'}}>Invite Friends</h2>
            <TableContainer component={Paper} style={{ minWidth: 650, maxHeight:'60vh' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell style={{fontSize:20}}>Friend Display Name</TableCell>
            <TableCell style={{fontSize:20}} align="right">Invite</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {userData['user_data']['server_data']['friends_data'].map((friend) => (
            <TableRow
              key={friend['user_id']}
            //   style={{visibility: checkFilter(currentTasks[task].id) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{friend['name']}</TableCell>
              <TableCell component="th" scope='row' align='right'>
                {!(liveFocusModeData['data']['invited_members'].includes(friend['user_id']))  ? <Button color='success' variant='outlined' onClick={()=>{inviteFriend(friend['user_id'])}}>Invite</Button>: <Button color='success' variant='outlined' disabled>Invited</Button>}
              </TableCell>
              </TableRow>
            ))}
        </TableBody>

        </Table>
      </TableContainer>
      <Button color='error' variant='outlined' onClick={()=>{endFocusMode()}}>End Focus Mode</Button>
        </Stack>
      </ContentDiv>
      </>
         :
         liveFocusModeData != null && liveFocusModeData['data'] == null  ?
         <>
            <ContentDiv style={{flex:1}}>
         <Stack direction={'column'} spacing={3}>
            <h2 style={{textAlign:'center'}}>Create or Join a Live Focus Mode</h2>    
            
            <Stack direction="row" style={{width:'100%'}} spacing={2}>
            <TextField label='Live Focus Mode Name' value={liveFocusModeName} onChange={(e)=>{setLiveFocusModeName(e.target.value)}} />
            <Button color='info' variant='outlined' style={{marginRight:'0em'}} onClick={()=>{createLiveFocusMode()}}>Create Live Focus Mode</Button>
            <Button color='success' variant='outlined' style={{width:'3em'}} onClick={()=>{getLiveModeData()}}><Refresh></Refresh></Button>
            </Stack>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{fontSize:20}}>Focus Mode Name</TableCell>
                        <TableCell style={{fontSize:20}} align="center">Owner</TableCell>
                        <TableCell style={{fontSize:20}} align="center">Join</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {liveFocusModeData != null && liveFocusModeData['requests'].map((request) => (
                        <TableRow
                            key={request['id']}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{request['name']}</TableCell>
                            <TableCell align="center">{request['owner_name']}</TableCell>
                            <TableCell align="center"><Button color='success' variant='outlined' onClick={()=>{joinLiveFocusMode(request['id'])}}><Check></Check></Button></TableCell>
                        </TableRow>
                    ))}                    

                    
                </TableBody>
            </Table>
            </Stack>
            </ContentDiv>
            
         </> : 
<></>
    :
    <h2>Loading</h2>}
    
        </Stack>
        </Stack>
        </div> 
           )
}

export default LiveFocusMode;