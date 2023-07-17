
import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import { useNavigate } from "react-router-dom";
import css from "../Style";
import { Button } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
// import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AppsIcon from '@mui/icons-material/Apps';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StreamIcon from '@mui/icons-material/Stream';
import PersonIcon from '@mui/icons-material/Person';
const Navbar = () => {
    const navigate = useNavigate()
    
    const isUrl = (url) => {
        var baseUrl = window.location.hash.split('#')[1];
        if (baseUrl === url) {
            return true;
        }
        return false;
      }
    return (
      <>
        <Nav>
          <NavMenu>
            <Button color='info' variant="contained" style={isUrl('/') ? {margin:'1em',backgroundColor:'#33a12a'}: {margin:'1em'}} onClick={() => navigate('/')}>
              <HomeIcon></HomeIcon>Home Page
            </Button>
            <Button color='info' variant="contained" style={isUrl('/timeSpent') ? {margin:'1em',backgroundColor:'#33a12a'}: {margin:'1em'}} onClick={() => navigate('/timeSpent')}>
              <DataThresholdingIcon/>Time Spent
            </Button>
            <Button color='info' variant="contained" style={isUrl('/focusModes') ? {margin:'1em',backgroundColor:'#33a12a'}: {margin:'1em'} } onClick={() => navigate('/focusModes')}>
              <TimelapseIcon></TimelapseIcon>Focus Modes
            </Button>
            <Button color='info' variant="contained" style={isUrl('/appStatus') ? {margin:'1em',backgroundColor:'#33a12a'}: {margin:'1em'}  } onClick={() => navigate('/appStatus')}>
              <AppsIcon></AppsIcon>App Status
            </Button>
            <Button color='info' variant="contained" style={isUrl('/userProfile') ? {margin:'1em',backgroundColor:'#33a12a'}: {margin:'1em'}} onClick={() => navigate('/userProfile')}>
              <PersonIcon></PersonIcon>User Profile
            </Button>
            <Button color='info' variant="contained" style={isUrl('/leaderboards') ? {margin:'1em',backgroundColor:'#33a12a'}:{margin:'1em'}} onClick={() => navigate('/leaderboards')}>
              <LeaderboardIcon></LeaderboardIcon>Leader boards
            </Button>
            <Button color='info' variant="contained" style={isUrl('/liveFocusMode') ? {margin:'1em',backgroundColor:'#33a12a'}:{margin:'1em'} } onClick={() => navigate('/liveFocusMode')}>
              <StreamIcon></StreamIcon>Live Focus
            </Button>
          </NavMenu>
        </Nav>
      </>
    );
  };
export default Navbar;
