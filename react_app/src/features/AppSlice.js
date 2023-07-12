import { createSlice } from '@reduxjs/toolkit'

export const appSlice= createSlice({
  name: 'app',
  initialState: {
    apps:{
    },
    currentWorkflow: null,
    workflows: {},
    initialApps: null,
    filterApps: {},
  },
  reducers: {
    clearWorkflowData: (state,action) => {
      state.apps = {};
      state.currentWorkflow = null;
      state.workflows = {};
      state.initialApps = null;
      state.filterApps = {};
    }, 
    setApp: (state,action) => {
      console.log('set apps')
      console.log(action.payload)
      state.apps = action.payload
    },
    setCertainApp:(state,action) =>{
      state.apps[action.payload['appNum']] = action.payload['newApp'];
    },
    setAppDistracted:(state,action) =>{
      state.apps[action.payload]['distracting'] = true;
      state.apps[action.payload]['focused'] = false;
    },
    setWorkflows: (state,action) => {
      state.workflows = action.payload
    },
    setCurrentWorkflow: (state,action) => {
      state.currentWorkflow = action.payload
    },
    setAppFocused:(state,action) =>{
      state.apps[action.payload]['focused'] = true;
      state.apps[action.payload]['distracting'] = false;
    },
    setAppNeither:(state,action) =>{
      state.apps[action.payload]['focused'] = false;
      state.apps[action.payload]['distracting'] = false;
    },
    setInitialApps: (state,action) => {
      state.initialApps = action.payload
    },
    setFilterApps: (state,action) => {
      state.filterApps = action.payload
    }

  },
})

// Action creators are generated for each case reducer function
export const { setApp,setCertainApp,setAppDistracted,setAppFocused,setAppNeither,setWorkflows,setCurrentWorkflow,setInitialApps,setFilterApps,clearWorkflowData } = appSlice.actions

export default appSlice.reducer