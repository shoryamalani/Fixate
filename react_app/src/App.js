import React from 'react';
// import './App.css';
import Navbar from './components/Navbar';
// import { Router, Routes, Route} from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import TimeSpent from './pages/TimeSpent'
// import { Nav, NavLink, NavMenu }
// 	from "./components/NavbarElements";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import css from './Style';
import FocusModes from './pages/FocusModes';
import AppStatus from './pages/AppStatus';
// import { Text } from 'react';
function App() {
	console.log(window.innerHeight);
return (
	// <Text>Test</Text>
	// <Router>
	// 	<Switch>
	// 		<Route path='/' exact />
	// 	</Switch>
	// </Router>

<>
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
		<Route exact path='/' element={<FrontPage />} default/>
		<Route path='/timeSpent' element={<TimeSpent/>} />
		<Route path='/focusModes' element={<FocusModes/>} />
		<Route path="/appStatus" element={<AppStatus/>}/>
	</Routes>
	</div>
	<Navbar />
	</Router>
	</div>
	</>
);
}

export default App;
