import { createSlice } from '@reduxjs/toolkit'

export const appSlice= createSlice({
  name: 'app',
  initialState: {
    apps:{
      1:{
        app_name: 'app1',
        app_status: 'running',
      },
    }
  },
  reducers: {
    
    setApp: (state,action) => {
      console.log('set apps')
      console.log(action.payload)
      // fetch('http://localhost:5005/get_app_status').then(response => response.json()).then(data =>{
      //   console.log(data)
      //   state.apps = data['applications']
      // }).catch(error => {});
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
      
  
    }
  },
})

// Action creators are generated for each case reducer function
export const { setApp,setCertainApp,flipDistractingApp } = appSlice.actions

export default appSlice.reducer