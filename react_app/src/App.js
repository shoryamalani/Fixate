import React from 'react';
// import './App.css';
import Navbar from './components/Navbar';
// import { Router, Routes, Route} from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import TimeSpent from './pages/TimeSpent'
// import { Nav, NavLink, NavMenu }
// 	from "./components/NavbarElements";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import css from './Style';
import FocusModes from './pages/FocusModes';
import AppStatus from './pages/AppStatus';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue, orange } from '@mui/material/colors';
import Leaderboards from './pages/Leaderboards';
import { CssBaseline, colors } from '@mui/material';
import LiveFocusMode from './pages/LiveFocusMode';
// import { Text } from 'react';
const theme = createTheme({
	palette: {
		mode: 'dark',
		secondary: {
			// main: '#f44336',
			main: '#FFC300',
		},
		info: {
			// main: '#FFC300',
			main: '#3e694d'
		},
		failure: {
			main: '#d1495b',
		},
		success: {
			main: '#679436',
		},
		error: {
			main: '#8f2d56',
		}
	},

  });
function App() {
	console.log(window.innerHeight);
	
return (
	// <Text>Test</Text>
	// <Router>
	// 	<Switch>
	// 		<Route path='/' exact />
	// 	</Switch>
	// </Router>

<ThemeProvider theme={theme}>
	<CssBaseline/>
<div style={css.container} height ={window.innerHeight +'px'}>
	<Router>
	{/* <Nav>
          <NavMenu>
	<div>
		  <NavLink to="/frontPage" activeStyle>
		  About
		  </NavLink>
          </NavMenu>
        </Nav> */}
	{/* <div style={css.mainContent}> */}
	<Routes>
		<Route path='*' index element={<FrontPage />} />
		<Route path='/timeSpent' element={<TimeSpent/>} />
		<Route path='/focusModes' element={<FocusModes/>} />
		<Route path="/appStatus" element={<AppStatus theme={theme}/>}/>
		<Route path="/leaderboards" element={<Leaderboards/>}/>
		<Route path="/liveFocusMode" element={<LiveFocusMode/>}/>
	</Routes>
	{/* </div> */}
	<Navbar />
	</Router>
	</div>
	</ThemeProvider>
);
}

export default App;
