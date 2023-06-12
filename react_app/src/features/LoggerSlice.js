import { createSlice } from '@reduxjs/toolkit'

export const loggerSlice = createSlice({
  name: 'logger',
  initialState: {
    closingApps : false,
    logging: false,
    currentFocusMode: {
      status: false,
    }
  },
  reducers: {
    setClosingApps: (state,action) => {
      console.log(action.payload)
      state.closingApps = action.payload;
    },
    setLogging: (state,action) => {
      console.log(action.payload)
      state.logging = action.payload;
    },
    setFocusMode: (state,action) => {
      console.log(action.payload)
      state.currentFocusMode = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setLogging, setClosingApps,setFocusMode } = loggerSlice.actions

export default loggerSlice.reducer