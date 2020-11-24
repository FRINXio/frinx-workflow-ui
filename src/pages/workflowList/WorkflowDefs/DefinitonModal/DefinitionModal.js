// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import Highlight from 'react-highlight.js';

const DefinitionModal = props => {
  return (
    <Modal size="xl" show={props.show} onHide={props.modalHandler}>
      <Modal.Header>
        <Modal.Title>{props.wf.name}</Modal.Title>
      </Modal.Header>
      <code style={{ fontSize: '17px' }}>
        <pre style={{ maxHeight: '600px' }}>
          <Highlight language="json">{JSON.stringify(props.wf, null, 2)}</Highlight>
        </pre>
      </code>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.modalHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DefinitionModal;
