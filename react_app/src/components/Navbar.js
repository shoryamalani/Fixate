
import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import { useNavigate } from "react-router-dom";
import css from "../Style";
import { Button } from "@mui/material";
import { LiveFocusMode } from "../pages/LiveFocusMode";

const Navbar = () => {
    const navigate = useNavigate()
    return (
      <>
        <Nav>
          <NavMenu>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/')}>
              Home Page
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}}onClick={() => navigate('/timeSpent')}>
              Time Spent
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/focusModes')}>
              Focus Modes
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/appStatus')}>
              App Status
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/leaderboards')}>
              Leaderboards
            </Button>
            <Button color='info' variant="contained" style={{margin:'1em'}} onClick={() => navigate('/liveFocusMode')}>
              Live Focus Mode
            </Button>
          </NavMenu>
        </Nav>
      </>
    );
  };
export default Navbar;
