import { createSlice } from '@reduxjs/toolkit'

export const focusModes = createSlice({
  name: 'focusModes',
  initialState: {
    focusModes: {"test": "test"}
  },
  reducers: {
    setFocusModes: (state,action) => {
        state.focusModes = action.payload
    }

  },
})

// Action creators are generated for each case reducer function
export const {setFocusModes} = focusModes.actions

export default focusModes.reducer