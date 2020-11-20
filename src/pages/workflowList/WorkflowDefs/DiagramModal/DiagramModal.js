// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import WorkflowDia from '../../WorkflowExec/DetailsModal/WorkflowDia/WorkflowDia';

const DiagramModal = props => {
  return (
    <Modal size="lg" dialogClassName="modal-70w" show={props.show} onHide={props.modalHandler}>
      <Modal.Header>
        <Modal.Title>Workflow Diagram</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <WorkflowDia meta={props.wf} tasks={[]} def={true} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.modalHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DiagramModal;
