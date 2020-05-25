import React from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import WorkflowDefsReadOnly from "./WorkflowDefs/WorkflowDefsReadOnly";
import WorkflowExec from "./WorkflowExec/WorkflowExec";
import {changeUrl, exportButton} from './workflowUtils'

const WorkflowListReadOnly = (props) => {
  const backendApiUrlPrefix = props.backendApiUrlPrefix;
  const frontendUrlPrefix = props.frontendUrlPrefix;
  let urlUpdater = changeUrl(props.history, frontendUrlPrefix);
  let query = props.match.params.wfid ? props.match.params.wfid : null;

  return (
      <Container style={{ textAlign: "left", marginTop: "20px" }}>
        <h1 style={{ marginBottom: "20px" }}>
          <i style={{ color: "grey" }} className="fas fa-cogs" />
          &nbsp;&nbsp;Service Portal
        </h1>
        <input id="upload-files" multiple type="file" hidden />
        <Tabs
            onSelect={(e) => urlUpdater(e)}
            defaultActiveKey={props.match.params.type || "defs"}
            style={{ marginBottom: "20px" }}
        >
          <Tab mountOnEnter unmountOnExit eventKey="defs" title="Definitions">
            <WorkflowDefsReadOnly backendApiUrlPrefix={backendApiUrlPrefix} frontendUrlPrefix={frontendUrlPrefix}/>
          </Tab>
          <Tab mountOnEnter unmountOnExit eventKey="exec" title="Executed">
            <WorkflowExec query={query} backendApiUrlPrefix={backendApiUrlPrefix} frontendUrlPrefix={frontendUrlPrefix}/>
          </Tab>
        </Tabs>
      </Container>
  );
};

export default withRouter(WorkflowListReadOnly);
