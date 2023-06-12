import { configureStore } from '@reduxjs/toolkit'
import loggerSlice from './features/LoggerSlice'
import appSlice from './features/AppSlice'
import tasksSlice from './features/TasksSlice'
import focusModesSlice from './features/FocusModesSlice'
export default configureStore({
  reducer: {
    logger: loggerSlice,
    app: appSlice,
    tasks: tasksSlice,
    focusModes: focusModesSlice,
  },
})