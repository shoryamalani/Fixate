import React, { useCallback, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import css from '../Style'
import { useSelector,useDispatch } from 'react-redux';
import {setApp, setCertainApp, flipDistractingApp, setWorkflows, setAppDistracted,setAppFocused,setAppNeither, setCurrentWorkflow,setInitialApps} from '../features/AppSlice'
import { Checkbox, Divider, InputLabel, MenuItem, Select, TableContainer, TextField, createTheme } from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import { useTheme } from '@mui/material/styles';

import {DndContext} from '@dnd-kit/core';
import Draggable from '../components/DraggableApp';
import Droppable from '../components/DroppableColumn';

import { ThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import Board from '../components/dnd-status-board/Board';

const  AppStatus = (props) => {
  // const [allApps, setAllApps] = useState(null);
  const apps = useSelector(state => state.app.apps);
  const [filterValue, setFilterValue] = useState('all');
  const [filterText, setFilterText] = useState('');
  const [filterApps, setFilterApps] = useState({});
  const refs = {
    Distracting: React.useRef(null),
    Other: React.useRef(null),
    Focused: React.useRef(null),
  };
  const workflows = useSelector(state => state.app.workflows);
  const initialApps = useSelector(state => state.app.initalApps);
  const currentWorkflow = useSelector(state => state.app.currentWorkflow);
  // const [initialApps, setInitialApps] = useState(null);
  console.log(apps)
  console.log(props.theme)
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
        var initialAppsTemp = {
          'Distracting':[],
          'Neutral':[],
          'Focused':[],
        };
        Object.keys(data).forEach((element) => {
          element = data[element];
          if(element['distracting'] === true){
            initialAppsTemp['Distracting'].push(element);
          } else if (element['focused'] === true){
            initialAppsTemp['Focused'].push(element);
          } else {
            initialAppsTemp['Neutral'].push(element);
          }
        });
        console.log(initialAppsTemp)
        dispatch(setInitialApps(initialAppsTemp));
        console.log(data)
        Object.keys(data).forEach((element) => {
          vals[element] = {"app_name": true, "app_type": true, "distracting": true, "focused": true};
        });
        console.log(vals)
        setFilterApps(vals);
      })

    },[currentWorkflow])
    const checkFilter = (app) => {
      return filterApps[app]['app_name'] && filterApps[app]['app_type'] && filterApps[app]['distracting'];
    }
    const makeDraggableApp = (app) => {
      return (
        <Draggable id={app['name']} key={app['name']} visible={checkFilter(app['name'])} style={{zIndex:10}}  app={app} >
          <div style={{...css.contrastContent,backgroundColor:props.theme.palette.info.main, width:'20vw'}} >
            <Stack direction='column' spacing={3} >
          {app['name']}
          <Divider/>
          {app['type']}
          </Stack>
          </div> 
          </Draggable>
  
      )
    }
    const add_workflow_modification = async (workflow_id,modification) => {
      return await fetch('http://localhost:5005/add_workflow_modification',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "workflow_id": workflow_id,
          "modification": modification,
        })
      }).then(
        response => response.json()
      ).then( data => {
      }).catch(error => {
        alert("Error adding workflow modification")
      });
    }

    useEffect(() => {
      // Get workflows
      const get_workflows = async () => {
        return await fetch('http://localhost:5005/get_workflows').then(
          response => response.json()
        ).then( data => {
          console.log("workflows")
          console.log(data)
          return {"workflows":data['workflows'], "currentWorkflow": data['current_workflow']}
        })
        .catch(error => {
          return {};
        });
      }
      get_workflows().then(data => {
        var final_data = data;
        dispatch(setWorkflows(final_data['workflows']));
        dispatch(setCurrentWorkflow(final_data['currentWorkflow']));
        console.log(final_data['currentWorkflow'])
      })
    },[])
    
    const checkFilterText = (text) => {
      var vals = {};
      Object.keys(filterApps).forEach((index,value) => {
        // console.log(apps[index]['type'])
        var temp = filterApps[index] 
        if(text === ''){          
          temp['app_name'] = true;
        } else if (apps[index]['name'].toLowerCase().includes(text)){
          temp['app_name'] = true;
        } else {
          temp['app_name'] = false;
        }
        vals[index] = temp;
      })

      setFilterApps(vals);
    }
    const columns = ["Distracting","Other","Focused"]
    return (
      <div style={css.mainContent}>
        
      <ThemeProvider theme={props.theme}>
        <CssBaseline />
      <div>
      <h1 style={css.h1}>App Status</h1>
  <div style={css.contrastContent}>
    <Stack direction="row" spacing={3}>
      <TextField   label="Name" variant="filled"  onChange={(e)=>{checkFilterText(e.target.value)}} />
      
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
  </Select>
  {/* <InputLabel id="distractingOrNotLabel">Distracting</InputLabel> */}
  { workflows ?
  <>


  <Select
    labelId="workflowSelector"
    variant='filled'
    id="wokflowSelector"
    value={currentWorkflow}
    label="Workflow Selection"
    aria-label='Workflow Selection'
    onChange={(e)=>{
      console.log(e.target.value)
      dispatch(setCurrentWorkflow(e.target.value));
    }}
  >
    
    { workflows ?
      Object.keys(workflows).map((workflow) => (
        <MenuItem value={workflow}>{workflows[workflow]['name']}</MenuItem>
      )): <></>
    }
  </Select>
  </>
  : <></>
   }
   <Select 
    labelId="distractingOrNotLabel"
    variant='filled'
    id="distractingOrNot"
    value={filterValue}
    label="Distracting"
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
        }
        else if (e.target.value === 'distracting'){
          if(apps[index]['distracting'] === true){
            temp['distracting'] = true;
          }else{
            temp['distracting'] = false;
          }
        } else if (e.target.value === 'focused'){
          if(apps[index]['focused'] === true){
            temp['distracting'] = true;
          }else{
            temp['distracting'] = false;
          }
        }
        vals[index] = temp;
      })
      console.log(vals);
      setFilterApps(vals);
    }}
  >
    <MenuItem value={"all"}>All</MenuItem>
    <MenuItem value={"distracting"}>Distracting</MenuItem>
    <MenuItem value={"focused"}>Focused</MenuItem>
  </Select>


</Stack>
      </div>
      {/* <div style={css.contrastContent}> */}
      {initialApps && apps &&
      <Board initial={initialApps} apps={apps} />}
      {/* <DndContext onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <Stack direction="row" spacing={4}>


      {columns.map((id) => (
        // We updated the Droppable component so it would accept an `id`
        // prop and pass it to `useDroppable`
        <>
        <div ref={refs[id]} style={{...css.contrastContent,scrollbarWidth:'0px',minHeight:'100%',flex:1,minWidth:'30%',maxHeight:'100vw'}}>
        <Droppable  key={id} id={id} style={{flex:1,zIndex:5}} >
        <Stack direction="column" spacing={3} >
        <h2 style={{zIndex:7}}>{id}</h2>
        {apps ? 
        Object.keys(apps).map((index) => {
          // console.log(apps[index])
          if(id === "Other"){
            if(apps[index]['distracting'] === false && apps[index]['focused'] === false){
              return makeDraggableApp(apps[index])
            }else{
              return(<></>)
            }
          } 
          else if (id === "Distracting"){
            if(apps[index]['distracting'] === true){
              return makeDraggableApp(apps[index])
            }else{
              return(<></>)
            }
          }
          else if (id === "Focused"){
            if(apps[index]['focused'] === true){
              return makeDraggableApp(apps[index])
            }
           

          }
          return(<></>)

        }): <></>
        }
        </Stack>

        </Droppable>
        </div>
        
        </>
      ))}
      </Stack>
    </DndContext> */}
      
      
      {/* </div> */}
    </div>
    </ThemeProvider>
    
    </div>
    
  )
  function handleDragEnd(event) {
    const {over} = event;
    console.log(event)
    if(over.id === "Distracting"){
      dispatch(setAppDistracted(event.active.id));
    } else if (over.id === "Focused"){
      dispatch(setAppFocused(event.active.id));
    } else if (over.id === "Other"){
      dispatch(setAppNeither(event.active.id));
    }
    if(over){
      var data = {
        "name": event.active.id,
        "type": apps[event.active.id]['type'],
        "distracting": apps[event.active.id]['distracting'],
        "focused": apps[event.active.id]['focused'],
      }
      if(over.id === "Distracting"){
        data['distracting'] = true;
        data['focused'] = false;
      } else if (over.id === "Focused"){
        data['distracting'] = false;
        data['focused'] = true;
      } else if (over.id === "Other"){
        data['distracting'] = false;
        data['focused'] = false;
      }
      add_workflow_modification(currentWorkflow,data)
      for (const [key, value] of Object.entries(refs)) {
        console.log(key, value);
        const element = value.current;
        element.style.backgroundColor = css.contrastContent.backgroundColor;
        element.style.transform = 'scale(1)';
        console.log(element)
      }

    }

    // If the item is dropped over a container, set it as the parent
    // otherwise reset the parent to `null`
  }
  function handleDragOver(event) {
    const {over} = event;
    console.log(event)
    if(over){
      console.log(over.id)
      for (const [key, value] of Object.entries(refs)) {
        console.log(key, value);
        if(key === over.id){
          const element = value.current;
          element.style.backgroundColor = 'green';
          element.style.transform = 'scale(1.01)'; 
          element.style.preserve3d = 'true';
        }else{
        const element = value.current;
        element.style.backgroundColor = css.contrastContent.backgroundColor;
        element.style.transform = 'scale(1)';
        console.log(element)
        }
      }
    }
    

  }
}

export default AppStatus;
