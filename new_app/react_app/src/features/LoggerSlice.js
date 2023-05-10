import { createSlice } from '@reduxjs/toolkit'

export const loggerSlice = createSlice({
  name: 'logger',
  initialState: {
    closingApps : false,
    logging: false,
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
  },
})

// Action creators are generated for each case reducer function
export const { setLogging, setClosingApps } = loggerSlice.actions

export default loggerSlice.reducer