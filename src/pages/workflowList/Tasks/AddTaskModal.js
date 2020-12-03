import React from 'react';
import { Col, Row, Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const AddTaskModal = props => {
  const handleClose = () => {
    props.modalHandler();
  };

  const showInfo = i => {
    return (
      <OverlayTrigger
        key={`info${i}`}
        placement="right"
        overlay={<Tooltip id={`tooltip-${i}`}>Please use comma (",") to separate keys</Tooltip>}
      >
        <i style={{ color: 'rgba(0, 149, 255, 0.91)' }} className="clickable fas fa-info-circle" />
      </OverlayTrigger>
    );
  };

  return (
    <Modal dialogClassName="modalWider" show={props.show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Add new Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={props.addTask.bind(this)}>
          <Row>
            {Object.keys(props.taskBody).map((item, i) => {
              return (
                <Col sm={6} key={`col1-${i}`}>
                  <Form.Group>
                    <Form.Label>
                      {item}&nbsp;&nbsp;
                      {i >= 8 ? showInfo(i - 8) : null}
                    </Form.Label>
                    <Form.Control
                      type="input"
                      name={Object.keys(props.taskBody)[i]}
                      onChange={e => props.handleInput(e)}
                      placeholder="Enter the input"
                      value={Object.values(props.taskBody)[i] ? Object.values(props.taskBody)[i] : ''}
                    />
                  </Form.Group>
                </Col>
              );
            })}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={props.addTask.bind(this)}>
          Add
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTaskModal;
