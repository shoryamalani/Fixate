import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
  },
  reducers: {
    setUserData: (state,action) => {
        console.log(state)
        state.userData = action.payload
        console.log(state)
    }

  },
})

// Action creators are generated for each case reducer function
export const {setUserData} = userSlice.actions

export default userSlice.reducer