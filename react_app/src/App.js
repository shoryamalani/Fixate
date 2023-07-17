import React from 'react';
// import './App.css';
import Navbar from './components/Navbar';
// import { Router, Routes, Route} from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import TimeSpent from './pages/TimeSpent'
// import { Nav, NavLink, NavMenu }
// 	from "./components/NavbarElements";

import css from './Style';
import FocusModes from './pages/FocusModes';
import AppStatus from './pages/AppStatus';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { blue, orange } from '@mui/material/colors';
import Leaderboards from './pages/Leaderboards';
import { Avatar, CssBaseline, Stack, colors } from '@mui/material';
import LiveFocusMode from './pages/LiveFocusMode';
import UserProfilePage from './pages/UserProfilePage';
import { ConfigProvider, Layout, Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import SideNavbar from './components/SideNavbar';
import { theme } from 'antd';
import ThemeProvider from './components/ThemeProvider';
import AppContent from './AppContent';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'
// import { Text } from 'react';

const antTheme = {
		"token": {
			"colorPrimary": "#199dfd",
			"colorSuccess": "#52c41a",
			"colorError": "#ff4d4f",
			"colorWarning": "#faad14"
		  },
		'algorithm': theme.darkAlgorithm
	  }

const {useToken} = theme;
function App() {
	console.log(window.innerHeight);
	// const {
	// 	token : {colorBgContainer}

	// } = theme.useToken();
return (
	// <Text>Test</Text>
	// <Router>
	// 	<Switch>
	// 		<Route path='/' exact />
	// 	</Switch>
	// </Router>
	
// {/* <MuiThemeProvider theme={muiTheme}> */}
	<ConfigProvider theme={antTheme}>
	{/* <ThemeProvider> */}
	<CssBaseline/>
	<ReactNotifications />
	<AppContent></AppContent>

	{/* </ThemeProvider> */}
	</ConfigProvider>
	// </MuiThemeProvider>
);
}

export default App;
