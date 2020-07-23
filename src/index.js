import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const conductorApiUrlPrefix = "/api/conductor";
const frontendUrlPrefix = "/workflows";
const enableScheduling = false;
const disabledTasks = ['js', 'py'];
const prefixHttpTask = '';

ReactDOM.render(
  <App
    backendApiUrlPrefix={conductorApiUrlPrefix}
    frontendUrlPrefix={frontendUrlPrefix}
    enableScheduling={enableScheduling}
    disabledTasks={disabledTasks}
    prefixHttpTask={prefixHttpTask}
  />,
  document.getElementById("root")
);
