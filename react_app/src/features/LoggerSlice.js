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
      state.closingApps = action.payload;
    },
    setLogging: (state,action) => {
      state.logging = action.payload;
    },
    setFocusMode: (state,action) => {
      state.currentFocusMode = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setLogging, setClosingApps,setFocusMode } = loggerSlice.actions

export default loggerSlice.reducer