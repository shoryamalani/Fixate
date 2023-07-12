import { createSlice } from '@reduxjs/toolkit'

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    currentTasks: null,
    oldTasks: 0,
    todaysTasks: null,
  },
  reducers: {
    setCurrentTasks: (state,action) => {
        state.currentTasks = action.payload
    },
    setOldTasks: (state,action) => {
        state.oldTasks = action.payload
    },
    setTodaysTasks: (state,action) => { 
        state.todaysTasks = action.payload
    }

  },
})

// Action creators are generated for each case reducer function
export const {setCurrentTasks,setOldTasks,setTodaysTasks} = tasksSlice.actions

export default tasksSlice.reducer