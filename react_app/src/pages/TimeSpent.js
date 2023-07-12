import React, { useEffect } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import 'chart.js/auto';
import css from '../Style'
import dayjs from 'dayjs';
import ReactDOM from 'react-dom';
import Calendar from 'react-calendar';
import {Bar, Line, Pie} from 'react-chartjs-2';
import Chart, { scales } from 'chart.js/auto';
import 'react-calendar/dist/Calendar.css';
import { Colors } from 'chart.js/auto';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setFocusModes } from '../features/FocusModesSlice';
import {CircularProgressWithLabel} from '../components/CircularProgressBar';
import { useLocation, useSearchParams } from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

function TimeSpent() {
  const [customDayValue, setCustomDayValue] = React.useState(new Date());
  const [pieChartData, setPieChartData] = React.useState(null);
  const [barChartData, setBarChartData] = React.useState(null);
  const [lineChartData, setLineChartData] = React.useState(null);
  const location = useLocation();
  console.log(location.state)
  if (!location.state) {
    location.state = { focusModes: null };
  }
  const currentFocusModes = location.state.focusModes;
  console.log(currentFocusModes)
  const focusModes = useSelector(state => state.focusModes.focusModes);
  const dispatch = useDispatch();
  Chart.defaults.color = '#FFFFFF';
  const fetchTimeSpent = async (start, end) => {
    const response = await fetch('http://localhost:5005/get_specific_time_log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "start_time": start.toDateString() + " "+start.toTimeString().split(" ")[0],
        "end_time": end.toDateString() + " "+end.toTimeString().split(" ")[0]
      })
    }).catch(error => {console.log(error)});
    var data = await response.json().catch(error => {console.log(error)});
    // remove the first element from an array
    console.log(data)
    // data['time'].shift();
    setPieChartData({
      labels: Object.keys(data['time']).map((i) => i), 
      datasets: [
        {
          label: "Time Spent",
          data: Object.keys(data['time']).map((i) => data['time'][i]/60),
          borderColor: "black",
          backgroundColor:Object.keys(data['time']).map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
          borderWidth: 0
        }
      ]
    })
    setLineChartData({
      labels: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => i),
      datasets: [
        {
          label: "Distractions",
          data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => data['distractions']['distracted_percentage_over_time'][i]['distractions']),
          borderColor: "yellow",
          backgroundColor: "yellow",
          borderWidth: 2,
          yAxisID: 'A',
        },
        {
          label: "Percent Distracted",
          data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['distracted']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
          borderColor: "red",
          backgroundColor: "red",
          borderWidth: 2,
          yAxisID: 'B',
        },
        {
          label: "Percent Focused",
          data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['focused']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
          borderColor: "green",
          backgroundColor: "green",
          borderWidth: 2,
          yAxisID: 'B',

        }
        
      ],
      options: {
        scales: {
          A: {
            type: 'linear',
            position: 'left'
          }, 
          B:{
            type: 'linear',
            position: 'right',
          }
        }
      }
    })
    console.log(
      {
        labels: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => i),
        datasets: [
          {
            label: "Distractions",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => data['distractions']['distracted_percentage_over_time'][i]['distractions']),
            borderColor: "yellow",
            backgroundColor: "yellow",
            borderWidth: 2,
            yAxisID: 'A',
          },
          {
            label: "Percent Distracted",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['distracted']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
            borderColor: "red",
            backgroundColor: "red",
            borderWidth: 2,
            yAxisID: 'B',
          },
          {
            label: "Percent Focused",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['focused']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
            borderColor: "green",
            backgroundColor: "green",
            borderWidth: 2,
            yAxisID: 'B',
  
          }
          
        ]
      }
    )
    var element = document.getElementById("pieChart");
    if(element){
      element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    }
    
    // console.log({
    //   labels: data['time'].map((i) => i[0]), 
    //   datasets: [
    //     {
    //       label: "Time Spent",
    //       data: data['time'].map((i) => i[1]/60),
    //       borderColor: "black",
    //       backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
    //       borderWidth: 2
    //     }
    //   ]
    // })
    return data;
  }

  const fetchTimeSpentConstrained = async (time_constraint,taskId=null) => {
    var data = {}
    if(taskId){
      data = {
        "id": taskId,
        "time": time_constraint
      }
    }else{
      data = {
        "time": time_constraint
      }
    }
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }
    
    function rgbToHex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    const response = await fetch('http://localhost:5005/get_time_log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => response.json()
    ).then(data => {
      // data['time'].shift();
      console.log(data)
      var final_data = []
      var distracting_apps = []
      var neutral_apps = []
      var focused_apps = []
      for (var key in data['time']) {
        // console.log(key)
        // console.log(data['relevant_distractions'])
        if(data['relevant_distractions'].includes(key)){
          // generate a random red
          distracting_apps.push([key,data['time'][key],rgbToHex(Math.floor(Math.random() * 100) + 150,Math.floor(Math.random() * 100),Math.floor(Math.random() * 100))])
        }else if (data['focused_apps'].includes(key)){
          // generate a random green
          focused_apps.push([key,data['time'][key],rgbToHex(Math.floor(Math.random() * 100),Math.floor(Math.random() * 100) + 150,Math.floor(Math.random() * 100))])
        } else {
          neutral_apps.push([key,data['time'][key],rgbToHex(Math.floor(Math.random() * 100),Math.floor(Math.random() * 100),Math.floor(Math.random() * 100) + 150)])
        }
      }
      distracting_apps.sort((a,b) => b[1]-a[1])
      focused_apps.sort((a,b) => b[1]-a[1])
      neutral_apps.sort((a,b) => b[1]-a[1])
      for (var key in focused_apps) {
        final_data.push(focused_apps[key])
      }
      for (var key in distracting_apps) {
        final_data.push(distracting_apps[key])
      }
      for (var key in neutral_apps) {
        final_data.push(neutral_apps[key])
      }
      console.log(final_data)
      setPieChartData({
        labels: final_data.map((i) => i[0]), 
        datasets: [
          {
            label: "Time Spent",
            data: final_data.map((i) => i[1]/60),
            borderColor: "black",
            backgroundColor:final_data.map((i) => i[2]),
            borderWidth: 0
          }
        ]
      })
    var all_lookaway_apps = []
      for (var key in data['distractions']['lookaway_apps']) {
        all_lookaway_apps.push([key,data['distractions']['lookaway_apps'][key]])
      }
    all_lookaway_apps.sort((a,b) => b[1]-a[1])
      setBarChartData({
        labels: all_lookaway_apps.map((i) => i[0]).slice(0,5),
        // labels: Object.keys(data['distractions']['lookaway_apps']).map((i) => i),
        datasets: [
          {
            label: "Apps",
            data: all_lookaway_apps.map((i) => i[1]).slice(0,5),
            borderColor: "black",
            backgroundColor:Object.keys(data['distractions']['lookaway_apps']).map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
            borderWidth: 0
          }
        ],
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    setLineChartData({
      labels: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => i),
      datasets: [
        {
          label: "Distractions",
          data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => data['distractions']['distracted_percentage_over_time'][i]['distractions']),
          borderColor: "yellow",
          backgroundColor: "yellow",
          borderWidth: 2,
          yAxisID: 'A',
        },
        {
          label: "Percent Distracted",
          data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['distracted']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
          borderColor: "red",
          backgroundColor: "red",
          borderWidth: 2,
          yAxisID: 'B',
        },
        {
          label: "Percent Focused",
          data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['focused']/(data['distractions']['distracted_percentage_over_time'][i]['neutral_time']+data['distractions']['distracted_percentage_over_time'][i]['distracted']+data['distractions']['distracted_percentage_over_time'][i]['focused']))),
          borderColor: "green",
          backgroundColor: "green",
          borderWidth: 2,
          yAxisID: 'B',
        }
      ],
      options: {
        scales: {
          A: {
            type: 'linear',
            position: 'left'
          }, 
          B:{
            type: 'linear',
            position: 'right',
          }
        }
      }
    })
    console.log(
      {
        labels: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => i),
        datasets: [
          {
            label: "Distractions",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => data['distractions']['distracted_percentage_over_time'][i]['distractions']),
            borderColor: "black",
            borderWidth: 2
          },
          {
            label: "Percent Distracted",
            data: Object.keys(data['distractions']['distracted_percentage_over_time']).map((i) => 100*(data['distractions']['distracted_percentage_over_time'][i]['distracted']/(data['distractions']['distracted_percentage_over_time'][i]['not_distracted']+data['distractions']['distracted_percentage_over_time'][i]['distracted']))),
            borderColor: "black",
            borderWidth: 2
          },
          
        ]
      }
    )
    var element = document.getElementById("pieChart");
    if(element){
      element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    }
    
    // console.log({
    //   labels: data['time'].map((i) => i[0]), 
    //   datasets: [
    //     {
    //       label: "Time Spent",
    //       data: data['time'].map((i) => i[1]/60),
    //       borderColor: "black",
    //       backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
    //       borderWidth: 2
    //     }
    //   ]
    // })
    return data;
    })
    // .catch(error => {console.log(error)});
    
  }
  const checkFilter = (focusModeId) => {
    if(currentFocusModes==null){
      return true;
    }else {
      if(currentFocusModes.includes(parseInt(focusModeId))){
        return true;
      }else {
        return false;
      }
    }
  }
  useEffect(() => {
    
    // add no-cors to the fetch request
    const get_all_apps = async () => {
      const response = await fetch('http://localhost:5005/get_all_focus_sessions').then(
        response => response.json()
      ).then(data => {
        
        
        console.log(data)
        var final_vals = {}

        data['focus_sessions'].forEach((element) => {
          final_vals[element['id']] = element;
        });
        console.log(final_vals)
        dispatch(setFocusModes(final_vals));
      // dispatch(setFocusModes(vals));
      }
      ).catch(error => {
        console.log(error)
        return null;
      });


    }
    get_all_apps()

  },[dispatch])
  return (
    <div style={{
      // flex: 1,
      // maxWidth:'80vw',
      color:'#d9eaff',
      // flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      justify:'center',
      alignSelf:'center',
      maxWidth:'100vw'
      }}>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
      <h1 style={css.h1}>Time Spent</h1>
      <Stack direction='row'>
      <Stack direction='column' spacing={1} style={{minWidth:'30%'}}>
      <div style={{...css.contrastContent,flex:0,height:'fit-content',display:'table'}}>
    <Grid2 direction="row" spacing={2}>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("last_30_minutes")}} >Last 30 minutes</Button>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("last_hour")}}>Last Hour</Button>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("last_five_hours")}}>Last 5 Hours</Button>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("today")}}>Today</Button>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("yesterday")}}>Yesterday</Button>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("week")}}>This Week</Button>
      <Button variant="contained" color='info' style={css.button} onClick={()=>{fetchTimeSpentConstrained("all")}}>All Time</Button>
    </Grid2>
    </div>
    <div style={{backgroundColor:'black',borderRadius:'2em'}}>
        <div style={css.contrastContent}>
          <Stack direction={'column'} spacing={1}>

        <Button color='info' variant="contained" onClick={()=>{fetchTimeSpent(customDayValue[0],customDayValue[1])}}>Custom</Button> 
    {/* <div style={css.contrastContent}> */}
    
    <Calendar style = {css.body}
          onChange={(v)=>{setCustomDayValue(v);console.log(v)}}
          value={customDayValue}
          showNeighboringMonth={false}
          locale={"en-US"}
          selectRange={true}
          />
          </Stack>
          </div>
        </div>
          
    {pieChartData && 
        <div style={{...css.contrastContent,margin: '0em',padding:0,minWidth:'30%', aspectRatio:1}} >
        <Pie data={pieChartData}
        id = "pieChart"
        options={{
          plugins: {
            title: {
              display: true,
              text: "Minutes Spent per App",
              
            }
            
          }
          
        }} /></div>
        }
        

</Stack>
    
      <div style={{...css.contrastContent,flex:0}}>
        <Stack direction="column" spacing={1}  >
        {lineChartData &&
        <div style={{...css.contrastContent,margin: '0em',flex:0,padding:0,minWidth:'30%', aspectRatio:1}} >
        <Line data={lineChartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Distractions Over Time",
            }
          }
          
        }} />
        </div>
        }
        {barChartData &&
        <div style={{...css.contrastContent,margin: '0em',flex:0,padding:0,minWidth:'30%', aspectRatio:1}} >
        <Bar data={barChartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Top 5 Distractions",
            }
          }
        }} />
        </div>
        }

      <h1 >Old Focus Modes</h1>
      <TableContainer component={Paper} style={{ minWidth: 650,maxHeight:'50vw' }}>
        <Table >
        <TableHead>
          <TableRow>
            <TableCell>Focus Name </TableCell>
            <TableCell align="right">Date</TableCell>
            <TableCell align="right">Desired Duration (min)</TableCell>
            <TableCell align="right">Completed</TableCell>
            <TableCell align="right">Time Spent</TableCell>
          </TableRow>
        </TableHead>
        {focusModes &&
        <TableBody>
          {Object.keys(focusModes).reverse().map((focusModeId) => (
            <TableRow
              key={focusModeId}
              style={{visibility: checkFilter(focusModeId) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{focusModes[focusModeId]['name']}</TableCell>
              <TableCell align="right">{dayjs(focusModes[focusModeId]['start_time']).format('MM/DD/YYYY')}</TableCell>
              <TableCell align="right">{focusModes[focusModeId]['stated_duration']}</TableCell>
              <TableCell align="right"><CircularProgressWithLabel  value={(100*(focusModes[focusModeId]['time_completed']/focusModes[focusModeId]['stated_duration'])).toFixed(1)}></CircularProgressWithLabel></TableCell>
              <TableCell align="right"><Button variant="contained" color='info' onClick={()=>{fetchTimeSpentConstrained(null,focusModeId)}}>See Time Spent</Button></TableCell>
            </TableRow>
            ))}
        </TableBody>
        }
        </Table>
      </TableContainer>
        </Stack>
      </div>
      </Stack>
        </div>
        
    // </div>
  )
}

export default TimeSpent;
