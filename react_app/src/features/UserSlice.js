import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    leaderboardData: null,
    liveFocusModeData: null,
    liveFocusModeCachedData: null,
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
    },
    setLiveFocusModeData: (state,action) => {
        console.log(state)
        state.liveFocusModeData = action.payload
        console.log(state)
    },
    setLiveFocusModeCachedData: (state,action) => {
        console.log(state)
        state.liveFocusModeCachedData = action.payload
        console.log(state)
    }

  },
})

// Action creators are generated for each case reducer function
export const {setUserData,setLeaderboardData, setLiveFocusModeData, setLiveFocusModeCachedData} = userSlice.actions

export default userSlice.reducer