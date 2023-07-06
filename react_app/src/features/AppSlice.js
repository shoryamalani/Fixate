import { createSlice } from '@reduxjs/toolkit'

export const appSlice= createSlice({
  name: 'app',
  initialState: {
    apps:{
    },
    currentWorkflow: null,
    workflows: {},
  },
  reducers: {
    
    setApp: (state,action) => {
      console.log('set apps')
      console.log(action.payload)
      state.apps = action.payload
    },
    setCertainApp:(state,action) =>{
      state.apps[action.payload['appNum']] = action.payload['newApp'];
    },
    flipDistractingApp:(state,action) =>{
      console.log(action.payload)
     if (state.apps[action.payload]['distracting']===1){
        state.apps[action.payload]['distracting'] = 0;
     } 
      else{
        state.apps[action.payload]['distracting'] = 1;
      }
    },
    setWorkflows: (state,action) => {
      state.workflows = action.payload
    },
    setCurrentWorkflow: (state,action) => {
      state.currentWorkflow = action.payload
    },
    flipFocusedApp:(state,action) =>{
      console.log(action.payload)
      if (state.apps[action.payload]['focused']===1){
        state.apps[action.payload]['focused'] = 0;
      }
      else{
        state.apps[action.payload]['focused'] = 1;
      }
    },

  },
})

// Action creators are generated for each case reducer function
export const { setApp,setCertainApp,flipDistractingApp,flipFocusedApp,setWorkflows } = appSlice.actions

export default appSlice.reducer