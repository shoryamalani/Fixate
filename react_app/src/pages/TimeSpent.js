import React from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import 'chart.js/auto';
import css from '../Style'
import dayjs from 'dayjs';
import ReactDOM from 'react-dom';
import Calendar from 'react-calendar';
import {Pie} from 'react-chartjs-2';
	
import 'react-calendar/dist/Calendar.css';
import { Colors } from 'chart.js/auto';
function TimeSpent() {
  const [customDayValue, setCustomDayValue] = React.useState(new Date());
  const [pieChartData, setPieChartData] = React.useState(null);
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
    const data = await response.json().catch(error => {console.log(error)});
    // remove the first element from an array
    data['time'].shift();
    await setPieChartData({
      labels: data['time'].map((i) => i[0]), 
      datasets: [
        {
          label: "Time Spent",
          data: data['time'].map((i) => i[1]),
          borderColor: "black",
          backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
          borderWidth: 0
        }
      ]
    })
    console.log({
      labels: data['time'].map((i) => i[0]), 
      datasets: [
        {
          label: "Time Spent",
          data: data['time'].map((i) => i[1]),
          borderColor: "black",
          backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
          borderWidth: 2
        }
      ]
    })
    return data;
  }

  const fetchTimeSpentConstrained = async (time_constraint) => {
    const response = await fetch('http://localhost:5005/get_time_log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "time": time_constraint
      })
    }).catch(error => {console.log(error)});
    const data = await response.json().catch(error => {console.log(error)});
    // remove the first element from an array
    data['time'].shift();
    await setPieChartData({
      labels: data['time'].map((i) => i[0]), 
      datasets: [
        {
          label: "Time Spent",
          data: data['time'].map((i) => i[1]),
          borderColor: "black",
          backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
          borderWidth: 0
        }
      ]
    })
    console.log({
      labels: data['time'].map((i) => i[0]), 
      datasets: [
        {
          label: "Time Spent",
          data: data['time'].map((i) => i[1]),
          borderColor: "black",
          backgroundColor:data['time'].map((i) => ('#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6)).toUpperCase()),
          borderWidth: 2
        }
      ]
    })
    return data;
  }

  return (
    <div>
      {/* <h1 style={{alignContent:'center',textAlign:"center"}}>Server Controls</h1> */}
      
      <h1 style={css.h1}>Time Spent</h1>
    <Stack direction="row" spacing={1} style={css.body}>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("all")}} >Last 30 minutes</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("last_hour")}}>Last Hour</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("last_five_hours")}}>Last 5 Hours</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("today")}}>Today</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("yesterday")}}>Yesterday</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("week")}}>This Week</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpentConstrained("all")}}>All Time</Button>
      <Button variant="contained" style={css.button} onClick={()=>{fetchTimeSpent(customDayValue[0],customDayValue[1])}}>Custom</Button>
    </Stack>

    <Calendar style = {css.body}
          onChange={(v)=>{setCustomDayValue(v);console.log(v)}}
          value={customDayValue}
          showNeighboringMonth={false}
          locale={"en-US"}
          selectRange={true}
        />
        {pieChartData && <Pie data={pieChartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Minutes Spent per App"
            }
          }
        }} />}
    </div>
  )
}

export default TimeSpent
