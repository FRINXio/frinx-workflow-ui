import { saveAs } from "file-saver";
import {HttpClient as http} from "../../common/HttpClient";
import { Button } from "react-bootstrap";
import React from "react";

const JSZip = require("jszip");

export const changeUrl = (history, frontendUrlPrefix) => {
  return function(e) {
    history.push(frontendUrlPrefix + "/" + e);
  };
};

const exportFile = (backendApiUrlPrefix) => {
  http.get(backendApiUrlPrefix + '/metadata/workflow').then((res) => {
    const zip = new JSZip();
    let workflows = res.result || [];

    workflows.forEach((wf) => {
      zip.file(wf.name + ".json", JSON.stringify(wf, null, 2));
    });

    zip.generateAsync({ type: "blob" }).then(function(content) {
      saveAs(content, "workflows.zip");
    });
  });
};

export const exportButton = (props) => {
  return (
      <Button
          key='export-btn'
          variant="outline-primary"
          style={{ marginLeft: "5px" }}
          onClick={() => exportFile(props.backendApiUrlPrefix)}>
        <i className="fas fa-file-export" />
        &nbsp;&nbsp;Export
      </Button>
  );
}

export const sortAscBy = (key) => {
  return function(x, y) {
    return x[key] === y[key] ? 0 : x[key] > y[key] ? 1 : -1;
  };
};

export const sortDescBy = (key) => {
  return function(x, y) {
    return x[key] === y[key] ? 0 : x[key] < y[key] ? 1 : -1;
  };
};