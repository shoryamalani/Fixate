import { configureStore } from '@reduxjs/toolkit'
import loggerSlice from './features/LoggerSlice'
import appSlice from './features/AppSlice'
export default configureStore({
  reducer: {
    logger: loggerSlice,
    app: appSlice,
  },
})