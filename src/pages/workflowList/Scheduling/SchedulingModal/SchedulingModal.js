// @flow

import AceEditor from 'react-ace';
import React, { useContext, useState } from 'react';
import superagent from 'superagent';
import { Button, Form, Modal } from 'react-bootstrap';
import { GlobalContext } from '../../../../common/GlobalContext';

const SchedulingModal = props => {
  const global = useContext(GlobalContext);
  const [schedule, setSchedule] = useState();
  const [status, setStatus] = useState();
  const [error, setError] = useState();
  const [found, setFound] = useState();

  const DEFAULT_CRON_STRING = '* * * * *';

  const handleClose = () => {
    props.onClose();
  };

  const handleShow = () => {
    setSchedule(null);
    setStatus(null);
    setError(null);
    const path = global.backendApiUrlPrefix + '/schedule/' + props.name;
    const req = superagent.get(path).accept('application/json');
    req.end((err, res) => {
      if (res && res.ok) {
        // found in db
        setFound(true);
        setSchedule(res.body);
      } else {
        // not found, prepare new object to be created
        setFound(false);
        setSchedule({
          name: props.name,
          workflowName: props.workflowName,
          // workflowVersion must be string
          workflowVersion: props.workflowVersion + '',
          enabled: false,
          cronString: DEFAULT_CRON_STRING,
        });
      }
    });
  };

  const submitForm = () => {
    setError(null);
    setStatus('Submitting');
    const path = global.backendApiUrlPrefix + '/schedule/' + props.name;
    const req = superagent.put(path, schedule).set('Content-Type', 'application/json');
    req.end((err, res) => {
      if (res && res.ok) {
        handleClose();
      } else {
        setStatus(null);
        setError('Request failed:' + err);
      }
    });
  };

  const setCronString = str => {
    const mySchedule = {
      ...schedule,
      cronString: str,
    };
    setSchedule(mySchedule);
  };

  const setEnabled = enabled => {
    const mySchedule = {
      ...schedule,
      enabled: enabled,
    };
    setSchedule(mySchedule);
  };

  const setWorkflowContext = workflowContext => {
    try {
      workflowContext = JSON.parse(workflowContext);
      const mySchedule = {
        ...schedule,
        workflowContext: workflowContext,
      };
      setSchedule(mySchedule);
    } catch (e) {}
  };

  const getCronString = () => {
    if (schedule != null) {
      if (schedule.cronString != null) {
        return schedule.cronString;
      }
    }
    return DEFAULT_CRON_STRING;
  };

  const getCrontabGuruUrl = () => {
    const url = 'https://crontab.guru/#' + getCronString().replace(/\s/g, '_');
    return (
      <a target="_blank" href={url}>
        crontab.guru
      </a>
    );
  };

  const getEnabled = () => {
    if (schedule != null) {
      if (typeof schedule.enabled === 'boolean') {
        return schedule.enabled;
      } // backend does not send this property when disabled
    }
    return false;
  };

  const getWorkflowContext = () => {
    if (schedule) {
      return JSON.stringify(schedule.workflowContext, null, 2);
    }
  };

  const handleDelete = () => {
    setError(null);
    setStatus('Deleting');
    const path = global.backendApiUrlPrefix + '/schedule/' + props.name;
    const req = superagent.delete(path, schedule);
    req.end((err, res) => {
      if (res && res.ok) {
        handleClose();
      } else {
        setStatus(null);
        setError('Request failed:' + err);
      }
    });
  };

  const deleteButton = () => {
    if (found) {
      return (
        <Button variant="danger" onClick={handleDelete} disabled={status != null}>
          Delete
        </Button>
      );
    }
  };

  return (
    <Modal size="lg" dialogClassName="modal-70w" show={props.show} onHide={handleClose} onShow={handleShow}>
      <Modal.Header>
        <Modal.Title>Schedule Details - {props.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={submitForm}>
          <Form.Group>
            <Form.Label>Cron</Form.Label>
            <Form.Control
              type="input"
              onChange={e => setCronString(e.target.value)}
              placeholder="Enter cron pattern"
              value={getCronString()}
            />
            Verify using {getCrontabGuruUrl()}
          </Form.Group>
          <Form.Group>
            <Form.Label>Enabled</Form.Label>
            <Form.Control type="checkbox" onChange={e => setEnabled(e.target.checked)} checked={getEnabled()} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Workflow Input</Form.Label>
            <AceEditor
              mode="javascript"
              theme="tomorrow"
              width="100%"
              height="100px"
              onChange={data => setWorkflowContext(data)}
              fontSize={16}
              value={getWorkflowContext()}
              wrapEnabled={true}
              setOptions={{
                showPrintMargin: true,
                highlightActiveLine: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <pre>{error}</pre>
        <Button variant="primary" onClick={submitForm} disabled={status != null}>
          {found ? 'Update' : 'Create'}
        </Button>
        {deleteButton()}
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SchedulingModal;
