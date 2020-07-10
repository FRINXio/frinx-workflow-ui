import React from "react";
import { Badge, Navbar } from "react-bootstrap";
import { NavLink, withRouter } from "react-router-dom";
import "./Header.css";
import logo from "./logo-min.png";
import { version } from "../../../package.json";

const Header = () => {
  const getGreeting = () => {
    let d = new Date();
    let time = d.getHours();

    if (time <= 12 && time > 5) {
      return "Good morning";
    }
    if (time > 12 && time <= 17) {
      return "Good afternoon";
    }
    if (time > 17 || time <= 5) {
      return "Good evening";
    }
  };

  return (
    <Navbar className="navbarHeader">
      <Navbar.Brand>
        <NavLink to="/">
          <img alt="" src={logo} />
          <Badge
            style={{ fontSize: "55%", marginLeft: "10px" }}
            variant="light"
          >
            {version}
          </Badge>
        </NavLink>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text style={{ textAlign: "right" }}>
          {getGreeting()}
          <br />
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default withRouter(Header);
