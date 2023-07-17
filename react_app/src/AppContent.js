import React from 'react';
// import './App.css';
import Navbar from './components/Navbar';
import {HashRouter as Router, Routes, Route} from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import TimeSpent from './pages/TimeSpent'
// import { Nav, NavLink, NavMenu }
// 	from "./components/NavbarElements";

import css from './Style';
import FocusModes from './pages/FocusModes';
import AppStatus from './pages/AppStatus';
import { createTheme, ThemeProvider as MuiThemeProvider, ThemeProvider } from '@mui/material/styles';
import { blue, orange } from '@mui/material/colors';
import Leaderboards from './pages/Leaderboards';
import { Avatar, CssBaseline, Stack, colors } from '@mui/material';
import LiveFocusMode from './pages/LiveFocusMode';
import UserProfilePage from './pages/UserProfilePage';
import { ConfigProvider, Layout, Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import SideNavbar from './components/SideNavbar';
import { theme } from 'antd';
import GlowingImage from './components/GlowingImage';
const {useToken} = theme;

const AppContent = () => {
    const [collapsed, setCollapsed] = React.useState(true);
    const {token} = useToken();
    const muiTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                // main: '#0aaeff',
                main: token.colorPrimary,
                dark: token.colorPrimary,
            },
            secondary: {
                main: '#b7b7b7',
                dark: '#b7b7b7',
            },
            info: {
                // main: '#FFC300',
                main: token.colorInfo,
                dark: token.colorInfo,
            },
            failure: {
                main: token.colorError,
                dark: token.colorError,
            },
            success: {
                main: token.colorSuccess,
                dark: token.colorSuccess,
            },
            error: {
                main: token.colorError,
                light: token.colorError,
                dark: token.colorError,
            }
        },
    
      });
    return (
        <div style={css.container} height ={window.innerHeight +'px'}>
	<Router>
        <ThemeProvider theme={muiTheme}>
<Layout style={{
	minHeight: '100vh',
    backgroundColor:token.colorBgContainer,
}}>
	<Sider  onMouseEnter={(e)=>{setCollapsed(false)}} onMouseLeave={(e)=>{setCollapsed(true)}} onClick={()=>{console.log(token.colorBgContainer)}}  style={{backgroundColor:token.colorBgContainer}}   collapsed={collapsed} onCollapse={(value)=> setCollapsed(value)}>
		<Stack direction='column' style={{height:'100%', color:'white', fontSize:'1.5em',flex:1,alignItems:'center',position:'fixed',width:collapsed?'3em':'10em'}}>
		<SideNavbar style={{height:'100%'}}></SideNavbar>
        { !collapsed ?
			<Stack direction='column' style={{height:'512px', margin:'16px', color:'white', fontSize:'1.5em',flex:0,alignItems:'center'}}>
                <GlowingImage style={{height:'5em',width:'5em',aspectRatio:1}} src={require('./assets/icon_512x512x32.png')} alt='Logo'>
			{/* <img ></img> */}
            </GlowingImage>
			<span style={{verticalAlign:'middle'}}>Fixate</span>
		</Stack>
		: null
		}
		</Stack>
		 
	</Sider>
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
		<Route path="/appStatus" element={<AppStatus theme={muiTheme}/>}/>
		<Route path="/leaderboards" element={<Leaderboards/>}/>
		<Route path="/liveFocusMode" element={<LiveFocusMode/>}/>
		<Route path="/userProfile" element={<UserProfilePage></UserProfilePage>}/>
	</Routes>
	{/* </div> */}
	</Layout>
	{/* <Navbar /> */}
    </ThemeProvider>
	</Router>
	</div>
    )
}
export default AppContent;