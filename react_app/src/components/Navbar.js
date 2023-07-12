
import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import { useNavigate } from "react-router-dom";
import css from "../Style";
import { Button } from "@mui/material";
import { LiveFocusMode } from "../pages/LiveFocusMode";
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
    return (
      <>
        <Nav>
          <NavMenu>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/')}>
              <HomeIcon></HomeIcon>Home Page
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}}onClick={() => navigate('/timeSpent')}>
              <DataThresholdingIcon/>Time Spent
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/focusModes')}>
              <TimelapseIcon></TimelapseIcon>Focus Modes
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/appStatus')}>
              <AppsIcon></AppsIcon>App Status
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/userProfile')}>
              <PersonIcon></PersonIcon>User Profile
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/leaderboards')}>
              <LeaderboardIcon></LeaderboardIcon>Leader boards
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/liveFocusMode')}>
              <StreamIcon></StreamIcon>Live Focus
            </Button>
          </NavMenu>
        </Nav>
      </>
    );
  };
export default Navbar;
