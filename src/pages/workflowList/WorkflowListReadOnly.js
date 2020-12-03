import React, { useContext } from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import WorkflowDefsReadOnly from './WorkflowDefs/WorkflowDefsReadOnly';
import WorkflowExec from './WorkflowExec/WorkflowExec';
import { changeUrl, exportButton } from './workflowUtils';
import { GlobalContext } from '../../common/GlobalContext';

const WorkflowListReadOnly = props => {
  const global = useContext(GlobalContext);
  let urlUpdater = changeUrl(props.history, global.frontendUrlPrefix);
  let query = props.match.params.wfid ? props.match.params.wfid : null;

  return (
    <Container style={{ textAlign: 'left', marginTop: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>
        <i style={{ color: 'grey' }} className="fas fa-cogs" />
        &nbsp;&nbsp;Service Portal
      </h1>
      <input id="upload-files" multiple type="file" hidden />
      <Tabs
        onSelect={e => urlUpdater(e)}
        defaultActiveKey={props.match.params.type || 'defs'}
        style={{ marginBottom: '20px' }}
      >
        <Tab mountOnEnter unmountOnExit eventKey="defs" title="Definitions">
          <WorkflowDefsReadOnly />
        </Tab>
        <Tab mountOnEnter unmountOnExit eventKey="exec" title="Executed">
          <WorkflowExec query={query} />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default withRouter(WorkflowListReadOnly);
