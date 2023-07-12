import { createSlice } from '@reduxjs/toolkit'

export const loggerSlice = createSlice({
  name: 'logger',
  initialState: {
    closingApps : false,
    logging: false,
    currentFocusMode: {
      status: false,
    },
    whitelist: false,
    workflow: null,
    showGetChromeExtension: false,
    ringsData: null,
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
    },
    setWhitelist: (state,action) => {
      state.whitelist = action.payload;
    },
    setWorkflow: (state,action) => {
      state.workflow = action.payload;
    },
    setShowGetChromeExtension: (state,action) => {
      state.showGetChromeExtension = action.payload;
    },
    setRingsData(state, action) {
      state.ringsData = action.payload
    }

  },
})

// Action creators are generated for each case reducer function
export const { setLogging, setClosingApps,setFocusMode,setWhitelist,setWorkflow,setShowGetChromeExtension,setRingsData } = loggerSlice.actions

export default loggerSlice.reducer