import { createSlice } from '@reduxjs/toolkit'

export const Scheduling = createSlice({
  name: 'Scheduling',
  initialState: {
    buckets: [],
    activeBucket: null,
  },
  reducers: {
    setBuckets: (state,action) => {
        state.buckets = action.payload
    },
    setActiveBucket: (state,action) => {
        state.activeBucket = action.payload
    }

  },
})

// Action creators are generated for each case reducer function
export const {setBuckets,setActiveBucket} = Scheduling.actions

export default Scheduling.reducer