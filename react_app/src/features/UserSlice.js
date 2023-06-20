import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    leaderboardData: null,
  },

  reducers: {
    setUserData: (state,action) => {
        console.log(state)
        state.userData = action.payload
        console.log(state)
    },
    setLeaderboardData: (state,action) => {
        console.log(state)
        state.leaderboardData = action.payload
        console.log(state)
    }

  },
})

// Action creators are generated for each case reducer function
export const {setUserData,setLeaderboardData} = userSlice.actions

export default userSlice.reducer