import React from "react";
import { Badge, Navbar } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import "./Header.css";
import logo from "./logo-min.png";
import { version } from "../../../package.json";
import { motion } from "framer-motion";

const Logo = () => <motion.img key={logo} src={logo} />;

const Title = () => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{
      opacity: 1,
      x: 0,
    }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <h2>UniFlow</h2>
  </motion.div>
);

const Header = () => {
  // workaround to get to parent app context
  const reloadPage = () => {
    history.pushState(null, null, "/");
    window.location.reload();
  };

  return (
    <Navbar className="navbarHeader">
      <Navbar.Brand style={{cursor: "pointer"}} onClick={() => reloadPage()}>
        <Logo />
      </Navbar.Brand>
      <Title />
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text style={{ textAlign: "right" }}>
          <Badge variant="light">{version}</Badge>
          <br />
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default withRouter(Header);
