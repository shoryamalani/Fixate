
import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import { useNavigate } from "react-router-dom";
import css from "../Style";
import { Button } from "@mui/material";

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
          </NavMenu>
        </Nav>
      </>
    );
  };
export default Navbar;
