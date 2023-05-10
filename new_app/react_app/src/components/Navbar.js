
import React from "react";
import { Nav, NavLink, NavMenu }
	from "./NavbarElements";
import css from "../Style";

  const Navbar = () => {
    return (
      <>
        <Nav>
          <NavMenu>
            <NavLink to="/" activestyle="true" default>
              Front Page
            </NavLink>
            <NavLink to="/timeSpent" activestyle="true">
              Time Spent
            </NavLink>
            <NavLink to="/focusModes" activestyle="true">
              Focus Modes
            </NavLink>
            <NavLink to="/appStatus" activestyle="true">
              App Status
            </NavLink>
          </NavMenu>
        </Nav>
      </>
    );
  };
export default Navbar;
