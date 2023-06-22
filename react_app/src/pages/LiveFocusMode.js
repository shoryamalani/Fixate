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

function LiveFocusMode(){
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

            if (data['status'] === 'success') {
                console.log(data)
                dispatch(setLiveFocusModeData(data));
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
        <div >
            <h1>Live Focus Mode</h1>
            <div style={css.contrastContent}>
        {userData != null && liveFocusModeData != null ?
         liveFocusModeData['data'] != null && liveFocusModeData['data']['owner_id'] == String(userData['user_id']) ? 
            userData['user_data']['server_data']['friends_data'] === undefined ? <h2>No Friends added</h2>:
            <>
            <Stack direction={'column'} spacing={3}>
            <TableContainer component={Paper} style={{ minWidth: 650, maxHeight:'60vh' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell>Friend Display Name</TableCell>
            <TableCell align="right">Invite</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {userData['user_data']['server_data']['friends_data'].map((friend) => (
            <TableRow
              key={friend['user_id']}
            //   style={{visibility: checkFilter(currentTasks[task].id) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row"><Avatar sx={{bgcolor:blue[500]}}>{friend['name'][0]}</Avatar>{friend['name']}</TableCell>
              <TableCell component="th" scope='row'>
                {!(liveFocusModeData['data']['invited_members'].includes(friend['user_id']))  ? <Button color='success' variant='contained' onClick={()=>{inviteFriend(friend['user_id'])}}>Invite</Button>: <Button color='success' variant='contained' disabled>Invited</Button>}
              </TableCell>
              </TableRow>
            ))}
        </TableBody>

        </Table>
      </TableContainer>
      <Button color='error' variant='contained' onClick={()=>{endFocusMode()}}>End Focus Mode</Button>
        </Stack>
      </>
         :liveFocusModeData != null && liveFocusModeData['data'] == null  ?
         <>
         <Stack direction={'column'} spacing={3}>
            <h2>Either create or Join a live focus mode</h2>    
            <Button color='success' variant='contained' onClick={()=>{getLiveModeData()}}>Refresh</Button>
            <Stack direction="row" spacing={2}>
            <TextField label='Live Focus Mode Name' value={liveFocusModeName} onChange={(e)=>{setLiveFocusModeName(e.target.value)}} />
            <Button color='success' variant='contained' onClick={()=>{createLiveFocusMode()}}>Create Live Focus Mode</Button>
            </Stack>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Focus Mode Name</TableCell>
                        <TableCell align="right">Owner</TableCell>
                        <TableCell align="right">Join</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {liveFocusModeData != null && liveFocusModeData['requests'].map((request) => (
                        <TableRow
                            key={request['id']}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{request['name']}</TableCell>
                            <TableCell align="right">{request['owner_name']}</TableCell>
                            <TableCell align="right"><Button color='success' variant='contained' onClick={()=>{joinLiveFocusMode(request['id'])}}>Join</Button></TableCell>
                        </TableRow>
                    ))}                    

                    
                </TableBody>
            </Table>
            </Stack>
         </> : 
            <>
            <Stack direction='column'>
            <h2>Focus Mode : {liveFocusModeData['data']['name']}</h2>
            <h3>Owner: {liveFocusModeData['data']['owner_name']}</h3>
            <Button color='error' variant='contained' onClick={()=>{leaveLiveFocusMode()}}>Leave Focus Mode</Button>
            </Stack>
            </>
    :
    <h2>Loading</h2>}
    
        </div>
        {liveFocusModeCachedData != null && liveFocusModeCachedData['data'] != null && liveFocusModeCachedData['data']['active'] == true ?
    <>
    <div style={css.contrastContent}>
        <Stack direction='column'>
            {/* Leaderboard spot */}
            <h2>Leaderboard</h2>
            <TableContainer component={Paper} style={{ minWidth: 650, maxHeight:'60vh' }}>
        <Table >
        <TableHead>
            <TableRow>
                <TableCell>Friend Display Name</TableCell>
                <TableCell align="right">Percent Focused</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {leaderboardList.map((member) => (
                <TableRow
                    key={member.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell component="th" scope="row"><Avatar sx={{bgcolor:blue[500]}}>{member.name[0]}</Avatar> {member.name}</TableCell>
                    <TableCell align="right">{<CircularProgressWithLabel value={member.percent_focused}></CircularProgressWithLabel>}</TableCell>
                </TableRow>
            ))}
        </TableBody>
        </Table>
        </TableContainer>

            <h2>Live Focus Mode Data</h2>
            {
                liveFocusModeCachedData['data']['members'].map((member) => (
                    <div>
                        <h3>{liveFocusModeCachedData['data']['member_names'][member]} has been distracted for {(liveFocusModeCachedData['data']['data']['seconds'][member]['unfocused']/60).toFixed(1)} minutes while being focused for {(liveFocusModeCachedData['data']['data']['seconds'][member]['focused']/60).toFixed(1)} minutes</h3>
                        {/* Chart js line chart */}
                        <div style={{width:'100%', height:'50vh'}}>
                            <Line  style={{width:'100%', height:'20vh'}}options={{
                                    responsive: true,
                                        plugins: {
                                        legend: {
                                        position: 'top',
                                        },
                                        title: {
                                        display: true,
                                        text:liveFocusModeCachedData['data']['member_names'][member] + ' Focus Percentage',
                                        },
                                    },
                            }} data={{
                                labels:userChartData['labels'][member],
                                datasets: [{
                                    label: 'Focus Percentage',
                                    data: member in userChartData ? userChartData[member] : [],
                                    fill: true,
                                    borderColor: 'rgb(75, 192, 192)',
                                    backgroundColor: liveFocusModeCachedData['data']['data']['time_data'][parseInt(member)] ? 'rgb(0,255,0)' : 'rgb(255, 0, 0)',

                                }]
                            }}></Line>
                        </div>
                    </div>
                ))
            }                
        </Stack>
    </div>
    </>
    :
    <h2>Data not found</h2>
    }
        </div>
    )
}

export default LiveFocusMode;