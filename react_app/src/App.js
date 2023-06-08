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
import { createTheme } from '@mui/material/styles';
import { orange } from '@mui/material/colors';
import { ThemeProvider } from 'styled-components';
import { CssBaseline } from '@mui/material';
// import { Text } from 'react';
const theme = createTheme({
	status: {
	  danger: orange[500],
	},
	// palette: {
	// 	mode: 'dark',
	// }

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
	<CssBaseline>
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
	<div style={css.mainContent}>
	<Routes>
		<Route path='*' index element={<FrontPage />} />
		<Route path='/timeSpent' element={<TimeSpent/>} />
		<Route path='/focusModes' element={<FocusModes/>} />
		<Route path="/appStatus" element={<AppStatus/>}/>
	</Routes>
	</div>
	<Navbar />
	</Router>
	</div>
	</CssBaseline>
	</ThemeProvider>
);
}

export default App;
