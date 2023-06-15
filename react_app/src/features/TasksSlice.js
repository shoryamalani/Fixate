import { createSlice } from '@reduxjs/toolkit'

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    currentTasks: {
        "1": {
            "name": "test",
            "duration": 10,
            "distracting": 1,
        }
    },
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