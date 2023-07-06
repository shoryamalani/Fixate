import React, { useCallback, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setApp, setCertainApp, flipDistractingApp, setWorkflows, flipFocusedApp} from '../features/AppSlice'
import { Checkbox, InputLabel, MenuItem, Select, TableContainer, TextField, createTheme } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import { useTheme } from '@mui/material/styles';

import {DndContext} from '@dnd-kit/core';
import Draggable from '../components/DraggableApp';
import Droppable from '../components/DroppableColumn';

import { ThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';

const  AppStatus = () => {
  // const [allApps, setAllApps] = useState(null);
  const apps = useSelector(state => state.app.apps);
  const [filterValue, setFilterValue] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [filterApps, setFilterApps] = useState({});
  const workflows = useSelector(state => state.app.workflows);
  const currentWorkflow = useSelector(state => state.app.currentWorkflow);
  console.log(apps)
  const theme = createTheme(
    {
      palette: {
        mode: 'dark',
      }
    }
  );
  const dispatch = useDispatch();
    useEffect(() => {
      const get_all_apps = async () => {
        return await fetch('http://localhost:5005/get_all_apps_in_workflow',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "workflow_id": currentWorkflow,
          })
        }).then(
          response => response.json()
        ).then( data => {
          console.log(data)
          return data['apps']
        })

        
      }
      get_all_apps().then(data => {
        dispatch(setApp(data));
        var vals = {};
        console.log(data)
        // Object.keys(data).forEach((element) => {
        //   vals[element] = {"app_name": true, "app_type": true, "distracting": true};
        // });
        // var vals = Object.keys(data).map(e => {
        //   console.log(e);
        //   return {e: {"app_name": true, "app_type": true, "distracting": true}};
        // });
        console.log(vals)
        setFilterApps(vals);
      })

    },[currentWorkflow])
    //   console.log(data)
    //   dispatch(setApps(data['applications']));
    // },[dispatch])
    // useEffect(() => {
    // },[dispatch])
    useEffect(() => {
      // Get workflows
      const get_workflows = async () => {
        return await fetch('http://localhost:5005/get_workflows').then(
          response => response.json()
        ).then( data => {
          return {"workflows":data['workflows'], "currentWorkflow": data['currentWorkflow']}
        })
        .catch(error => {
          return {};
        });
      }
      get_workflows().then(data => {
        dispatch(setWorkflows(data));
      })
    },[])
    
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
    const columns = ["Distracting","Other","Focused"]
    const [parent, setParent] = useState(null);
    return (
      <div style={css.mainContent}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <div>
      
      <h1 style={css.h1}>App Status</h1>
  <div style={css.contrastContent}>
    <Stack direction="row" spacing={3}>
      {/* <TextField   label="Name" variant="filled"  onChange={(e)=>{checkFilterText(e.target.value)}} />
      
  <Select
    labelId="websiteOrAppLabel"
    id="websiteOrApp"
    value={filterValue}
    label="type"
    variant='filled'
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
  </Select> */}
  {/* <InputLabel id="distractingOrNotLabel">Distracting</InputLabel> */}
  { workflows ?
  <>
  <Select
    labelId="workflowSelector"
    variant='filled'
    id="wokflowSelector"
    value={filterValue}
    label="Workflow Selection"
    onChange={(e)=>{}}
  >
    
    { workflows ?
      Object.keys(workflows).map((workflow) => (
        <MenuItem value={workflow['id']}>{workflow['name']}</MenuItem>
      )): <></>
    }
  </Select>
  </>
  : <></>
   }

</Stack>
      </div>
      {/* <div style={css.contrastContent}> */}
      <Stack direction="row" spacing={3}>
      <DndContext onDragEnd={handleDragEnd}>


      {columns.map((id) => (
        // We updated the Droppable component so it would accept an `id`
        // prop and pass it to `useDroppable`
        <>
        <div style={css.contrastContent}>
        <Stack direction="column" spacing={3}>
        <h2>{id}</h2>
        <Droppable key={id} id={id}>
        {apps ? 
        Object.keys(apps).map((index) => {
          console.log(apps[index])
          if(id === "Other"){
            if(apps[index]['distracting'] === false && apps[index]['focused'] === false){
              return(<Draggable id={index} key={index} parent={apps[index]} app={apps[index]} >{apps[index]['name']} </Draggable>)
            }else{
              return(<></>)
            }
          } 
          else if (id === "Distracting"){
            if(apps[index]['distracting'] === true){
              return(<Draggable id={index} key={index} parent={apps[index]} app={apps[index]} >{apps[index]['name']} </Draggable>)
            }else{
              return(<></>)
            }
          }
          else if (id === "Focused"){
            if(apps[index]['focused'] === true){
              return(<Draggable id={index} key={index} parent={apps[index]} app={apps[index]} >{apps[index]['name']} </Draggable>)
            }else{
              return(<></>)
            }
          }

        }): <></>
        }
        </Droppable>
        </Stack>
        </div>
        </>
      ))}
    </DndContext>
      </Stack>
      
      
      {/* </div> */}
    </div>
    </ThemeProvider>
    </div>
  )
  function handleDragEnd(event) {
    const {over} = event;

    // If the item is dropped over a container, set it as the parent
    // otherwise reset the parent to `null`
    setParent(over ? over.id : null);
  }
}

export default AppStatus
