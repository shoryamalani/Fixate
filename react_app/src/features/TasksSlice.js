import { createSlice } from '@reduxjs/toolkit'

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    currentTasks: null,
  },
  reducers: {
    setCurrentTasks: (state,action) => {
        state.currentTasks = action.payload
    }

  },
})

// Action creators are generated for each case reducer function
export const {setCurrentTasks} = tasksSlice.actions

export default tasksSlice.reducer