
import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import { useNavigate } from "react-router-dom";
import css from "../Style";

  const Navbar = () => {
    const navigate = useNavigate()
    return (
      <>
        <Nav>
          <NavMenu>
            <button onClick={() => navigate('/')}>
              Front Page
            </button>
            <button onClick={() => navigate('/timeSpent')}>
              Time Spent
            </button>
            <button onClick={() => navigate('/focusModes')}>
              Focus Modes
            </button>
            <button onClick={() => navigate('/appStatus')}>
              App Status
            </button>
          </NavMenu>
        </Nav>
      </>
    );
  };
export default Navbar;
