import React from "react";
import { Badge, Navbar } from "react-bootstrap";
import { withRouter } from "react-router-dom";
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

  // workaround to get to parent app context
  const reloadPage = () => {
    history.pushState(null, null, "/");
    window.location.reload()
  }

  return (
    <Navbar className="navbarHeader">
      <Navbar.Brand>
        <img alt="logo" src={logo} onClick={() => reloadPage()} style={{ cursor: "pointer" }} />
          <Badge
            style={{ fontSize: "55%", marginLeft: "10px" }}
            variant="light"
          >
            {version}
          </Badge>
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
