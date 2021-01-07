import React, { useEffect, useState, useContext } from 'react';
import { Button, Col, Modal, Row, Tab, Table, Tabs } from 'react-bootstrap';
import Highlight from 'react-highlight.js';
import { HttpClient as http } from '../../../common/HttpClient';
import { GlobalContext } from '../../../common/GlobalContext';
import {jsonParse} from "../../../common/utils";

const TaskModal = props => {
  const global = useContext(GlobalContext);
  const [response, setResponse] = useState({});
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    const name = props.name;
    http.get(global.backendApiUrlPrefix + '/metadata/taskdef/' + name).then(res => {
      if (res.result) {
        setResponse(res.result);
      }
    });
  }, []);

  const handleClose = () => {
    props.modalHandler();
  };

  const renderKeys = variable => {
    let output = [];
    let keys = response[variable] ? response[variable] : 0;
    for (let i = 0; i < keys.length; i++) {
      output.push(
        <tr key={`${variable}-${i}`}>
          <td>{keys[i]}</td>
        </tr>,
      );
    }
    return output;
  };

  const iokeys = () => (
    <Row>
      <Col>
        <Table striped hover size="sm">
          <thead>
            <tr>
              <th>Input keys</th>
            </tr>
          </thead>
          <tbody>{renderKeys('inputKeys')}</tbody>
        </Table>
      </Col>
      <Col>
        <Table striped hover size="sm">
          <thead>
            <tr>
              <th>Output keys</th>
            </tr>
          </thead>
          <tbody>{renderKeys('outputKeys')}</tbody>
        </Table>
      </Col>
    </Row>
  );

  const def = () => (
    <div>
      <h4>
        Task JSON&nbsp;&nbsp;
        <i title="copy to clipboard" className="clp far fa-clipboard clickable" data-clipboard-target="#json" />
      </h4>
      <code>
        <pre id="json" className="heightWrapper">
          <Highlight language="json">{JSON.stringify(response, null, 2)}</Highlight>
        </pre>
      </code>
    </div>
  );

  return (
    <Modal dialogClassName="modalWider" show={props.show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>
          Details of {response.name ? response.name : null}
          <br />
          <p className="text-muted">{jsonParse(response.description)?.description || response.description}</p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          className="heightWrapper"
          onSelect={e => setActiveTab(e)}
          style={{ marginBottom: '20px' }}
          id="detailTabs"
        >
          <Tab mountOnEnter eventKey="JSON" title="Task JSON">
            {def()}
          </Tab>
          {response.outputKeys || response.outputKeys ? (
            <Tab mountOnEnter eventKey="inputOutput" title="Input/Output">
              {iokeys()}
            </Tab>
          ) : null}
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;
