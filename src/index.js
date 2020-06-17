import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const conductorApiUrlPrefix = "/api/conductor";
const frontendUrlPrefix = "/workflows";

ReactDOM.render(
  <App
    backendApiUrlPrefix={conductorApiUrlPrefix}
    frontendUrlPrefix={frontendUrlPrefix}
    enableScheduling={false}
  />,
  document.getElementById("root")
);
