import React, { useCallback, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setApp, setCertainApp, flipDistractingApp} from '../features/AppSlice'
import { Checkbox, InputLabel, MenuItem, Select, TableContainer, TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { FaSearch } from 'react-icons/fa';


const  AppStatus = () => {
  // const [allApps, setAllApps] = useState(null);
  const apps = useSelector(state => state.app.apps);
  const [filterValue, setFilterValue] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [filterApps, setFilterApps] = useState({});
  console.log(apps)
  const dispatch = useDispatch();
  // write a use effect that gets the app status and sets the state

  // useEffect(() => {
    
  //   // dispatch(setApps());
  //   const getAppStatus = async () => {
  //     await fetch('http://localhost:5005/get_app_status').then(response => response.json()).then(data => {
  //     setAllApps(data['applications'])
      
  //     }).catch(error => {
  //       console.log(error);
  //     })
  //   }
  //   getAppStatus();
  //   console.log(allApps)
  //   const getData = useCallback(async () => {
  //     // const data = await get_all_apps();
  //     // console.log(data)
  //     const response = await fetch('http://localhost:5005/get_app_status').catch(error => {});
  //     const data = await response.json().catch(error => {});
  //     dispatch(setApps(data['applications']));
    
  // },[dispatch])
    // const getData = useCallback(async () => {
      useEffect(() => {
      const get_all_apps = async () => {
        const response = await fetch('http://localhost:5005/get_app_status').catch(error => {});
        const data = await response.json().catch(error => {});
        return data['applications']
      }
      get_all_apps().then(data => {
        dispatch(setApp(data));
        var vals = {};
        Object.keys(data).forEach((element) => {
          vals[element] = {"app_name": true, "app_type": true, "distracting": true};
        });
        // var vals = Object.keys(data).map(e => {
        //   console.log(e);
        //   return {e: {"app_name": true, "app_type": true, "distracting": true}};
        // });
        console.log(vals)
        setFilterApps(vals);
      })

    },[dispatch])
    //   console.log(data)
    //   dispatch(setApps(data['applications']));
    // },[dispatch])
    // useEffect(() => {
    // },[dispatch])
    const flipDistracting = (appNum) => {
      
        // send app num in message body
        var vals = {"applications":{}}
        if (apps[appNum]['distracting']===1){
        vals['applications'][appNum.toString()] = 0
        }else {
          vals['applications'][appNum.toString()] = 1
        }
        console.log(vals)
        fetch('http://localhost:5005/save_app_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(vals)
        
        }).then(response => response.json()).then(data=>console.log(data)).catch(error => {console.log(error)});
        dispatch(flipDistractingApp(appNum));
    }
    const checkFilter = (app) => {
      if(filterApps[app]==null){
        return false; 
      }else {
        return (filterApps[app]['app_name'] && filterApps[app]['app_type'] && filterApps[app]['distracting'])
      }
    }
    const checkFilterText = (text) => {
      var vals = {};
      Object.keys(filterApps).forEach((index,value) => {
        console.log(apps[index]['type'])
        var temp = filterApps[index] 
        if(text === ''){          
          temp['app_name'] = true;
        } else if (apps[index]['name'].toLowerCase().includes(text)){
          temp['app_type'] = true;
        } else {
          temp['app_type'] = false;
        }
        vals[index] = temp;
      })

      setFilterApps(vals);
    }
    return (
      <div>
      
      <h1 style={css.h1}>App Status</h1>
    <Stack direction="row" spacing={3}>
      <TextField id="outlined-basic" label="Name" variant="outlined"  onChange={(e)=>{checkFilterText(e.target.value)}} />
      
  <Select
    labelId="websiteOrAppLabel"
    style={css.body}
    id="websiteOrApp"
    value={filterValue}
    label="type"
    onChange={(e)=>{
      console.log(e)
      setFilterValue(e.target.value)
      var vals = {};
      console.log(e.target.value==="website")
      Object.keys(filterApps).forEach((index,value) => {
        console.log(apps[index]['type'])
        var temp = filterApps[index] 
        if(e.target.value === 'all'){          
          temp['app_type'] = true;
        } else if (apps[index]['type'] === e.target.value){
          temp['app_type'] = true;
        } else {
          temp['app_type'] = false;
        }
        vals[index] = temp;
      })
      console.log(vals);
      setFilterApps(vals);
    }}
  >
    <MenuItem value={"all"}>All</MenuItem>
    <MenuItem value={"website"}>Website</MenuItem>
    <MenuItem value={"app"}>App</MenuItem>
  </Select>
  {/* <InputLabel id="distractingOrNotLabel">Distracting</InputLabel> */}
  <Select
    labelId="distractingOrNotLabel"
    style={css.body}
    id="distractingOrNot"
    value={filterValue}
    label="Distracting Filter"
    onChange={(e)=>{
      console.log(e)
      setFilterValue(e.target.value)
      var vals = {};
      console.log(e.target.value==="website")
      Object.keys(filterApps).forEach((index,value) => {
        console.log(apps[index]['type'])
        var temp = filterApps[index] 
        if(e.target.value === 'all'){          
          temp['distracting'] = true;
        } else if (apps[index]['distracting']  === (e.target.value === 'distracting' ? 1:0)){
          temp['distracting'] = true;
        } else {
          temp['distracting'] = false;
        }
        vals[index] = temp;
      })
      console.log(vals);
      setFilterApps(vals);
    }}
  >
    <MenuItem value={"all"}>All</MenuItem>
    <MenuItem value={"distracting"}>distracting</MenuItem>
    <MenuItem value={"not distracting"}>Not distracting</MenuItem>
  </Select>
  {/*<Checkbox onChange={(e)=>{
    var vals = {};
    Object.keys(filterApps).forEach((index,value) => {
      var temp = filterApps[index]
      if(e.target.checked === (apps[index]['distracting'] === 1)){
        temp['distracting'] = true;
      } else {
        temp['distracting'] = false;
      }
      vals[index] = temp;
    })
    setFilterApps(vals);

  }}>Distracting</Checkbox> */}
      </Stack>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>App Name </TableCell>
            <TableCell align="right">App Type</TableCell>
            <TableCell align="right">Distracting</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(apps).map((appNum) => (
            <TableRow
              key={appNum}
              style={{visibility: checkFilter(appNum) ? 'visible':'collapse'}}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{apps[appNum]['name']}</TableCell>
              <TableCell align="right">{apps[appNum]['type']}</TableCell>
              <TableCell align="right"><Checkbox checked={apps[appNum]['distracting'] ? true:false} onClick={()=>{flipDistracting(appNum)}}></Checkbox></TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
      </TableContainer>
    {/* { 
        Object.keys(apps).map(appNum => {
          return (
            <div>
              <h2>{appNum}</h2>
              <h1>{apps[appNum]['name']}</h1>
              <h2>{apps[appNum]['distracting']}</h2>
            </div>
          )
        })
      }  */}
      
    </div>
  )
}

export default AppStatus
