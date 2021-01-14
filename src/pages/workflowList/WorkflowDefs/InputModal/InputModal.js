// @flow
import Dropdown from 'react-dropdown';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { GlobalContext } from '../../../../common/GlobalContext';
import { Typeahead } from 'react-bootstrap-typeahead';
import { HttpClient as http } from '../../../../common/HttpClient';
import { storeWorkflowId } from '../../../../store/actions/builder';
import { useDispatch } from 'react-redux';
import { jsonParse } from '../../../../common/utils';

const getInputs = def => {
  const inputCaptureRegex = /workflow\.input\.([a-zA-Z0-9-_]+)\}/gim;
  let match = inputCaptureRegex.exec(def);
  const inputsArray = [];

  while (match != null) {
    inputsArray.push(match[1]);
    match = inputCaptureRegex.exec(def);
  }

  return [...new Set(inputsArray)];
};

function InputModal(props) {
  const global = useContext(GlobalContext);
  const dispatch = useDispatch();
  const [wfId, setWfId] = useState();
  const [warning, setWarning] = useState([]);
  const [status, setStatus] = useState('Execute');
  const [workflowForm, setWorkflowForm] = useState([]);
  const [waitingWfs, setWaitingWfs] = useState([]);
  const name = props.wf.name;
  const version = Number(props.wf.version);
  const wfdesc =
    jsonParse(props.wf.description)?.description ||
    (jsonParse(props.wf.description)?.description !== '' && props.wf.description);

  useEffect(() => {
    const definition = JSON.stringify(props.wf, null, 2);
    const labels = getInputs(definition);
    const inputParams = jsonParse(props.wf.inputParameters ? props.wf.inputParameters[0] : null);

    const workflowForm = labels.map(label => ({
      label: label,
      ...(inputParams ? inputParams[label] : null),
    }));

    if (definition.match(/\bEVENT_TASK\b/)) {
      getWaitingWorkflows().then(waitingWfs => {
        setWaitingWfs(waitingWfs);
      });
    }
    setWorkflowForm(workflowForm);
  }, [props]);

  const getWaitingWorkflows = () => {
    return new Promise((resolve, reject) => {
      const waitingWfs = [];
      const q = 'status:"RUNNING"';
      http.get(global.backendApiUrlPrefix + '/executions/?q=&h=&freeText=' + q + '&start=' + 0 + '&size=').then(res => {
        const runningWfs = res.result?.hits || [];
        const promises = runningWfs.map(wf => {
          return http.get(global.backendApiUrlPrefix + '/id/' + wf.workflowId);
        });

        Promise.all(promises).then(results => {
          results.forEach(r => {
            const workflow = r.result;
            const waitTasks = workflow?.tasks.filter(task => task.taskType === 'WAIT').map(t => t.referenceTaskName);
            if (waitTasks.length > 0) {
              const waitingWf = {
                id: workflow.workflowId,
                name: workflow.workflowName,
                waitingTasks: waitTasks,
              };
              waitingWfs.push(waitingWf);
            }
          });
          resolve(waitingWfs);
        });
      });
    });
  };

  const handleClose = (openDetails = false) => {
    props.modalHandler(openDetails);
  };

  const handleInput = (e, i) => {
    const workflowFormCopy = [...workflowForm];
    const warningCopy = { ...warning };

    workflowFormCopy[i].value = e.target.value;
    warningCopy[i] = !!(workflowFormCopy[i].value.match(/^\s.*$/) || workflowFormCopy[i].value.match(/^.*\s$/));

    setWorkflowForm(workflowFormCopy);
    setWarning(warningCopy);
  };

  const handleTypeahead = (e, i) => {
    const workflowFormCopy = [...workflowForm];
    workflowFormCopy[i].value = e.toString();
    setWorkflowForm(workflowFormCopy);
  };

  const handleSwitch = (e, i) => {
    const workflowFormCopy = [...workflowForm];

    if (e === 'true' || e === 'false') {
      e = e == 'true';
    }

    workflowFormCopy[i].value = e;
    setWorkflowForm(workflowFormCopy);
  };

  const executeWorkflow = () => {
    const workflowFormCopy = [...workflowForm];
    const input = {};
    const payload = {
      name: name,
      version: version,
      input,
    };

    workflowFormCopy.forEach(({ label, value }) => {
      input[label] = typeof value === 'string' && value.startsWith('{') ? JSON.parse(value) : value;
    });

    setStatus('Executing...');
    http.post(global.backendApiUrlPrefix + '/workflow', JSON.stringify(payload)).then(res => {
      setStatus(res.statusText);
      setWfId(res.body.text);
      dispatch(storeWorkflowId(res.body.text));
      timeoutBtn();

      if (props.fromBuilder) {
        handleClose(true);
      }
    });
  };

  const timeoutBtn = () => {
    setTimeout(() => setStatus('Execute'), 1000);
  };

  const inputModel = (item, i) => {
    switch (item.type) {
      case 'workflow-id':
        return (
          <Typeahead
            id={`input-${i}`}
            onChange={e => handleTypeahead(e, i)}
            placeholder="Enter or select workflow id"
            options={waitingWfs.map(w => w.id)}
            defaultSelected={workflowForm[i].value}
            onInputChange={e => handleTypeahead(e, i)}
            renderMenuItemChildren={option => (
              <div>
                {option}
                <div>
                  <small>name: {waitingWfs.find(w => w.id === option)?.name}</small>
                </div>
              </div>
            )}
          />
        );
      case 'task-refName':
        return (
          <Typeahead
            id={`input-${item.i}`}
            onChange={e => handleTypeahead(e, i)}
            placeholder="Enter or select task reference name"
            options={waitingWfs.map(w => w.waitingTasks).flat()}
            onInputChange={e => handleTypeahead(e, i)}
            renderMenuItemChildren={option => (
              <div>
                {option}
                <div>
                  <small>name: {waitingWfs.find(w => w.waitingTasks.includes(option))?.name}</small>
                </div>
              </div>
            )}
          />
        );
      case 'textarea':
        return (
          <Form.Control
            type="input"
            as="textarea"
            rows="2"
            onChange={e => handleInput(e, i)}
            placeholder="Enter the input"
            value={workflowForm[i].value}
            isInvalid={warning[i]}
          />
        );
      case 'toggle':
        return (
          <ToggleButtonGroup
            type="radio"
            value={item.value.toString()}
            name={`switch-${i}`}
            onChange={e => handleSwitch(e, i)}
            style={{
              height: 'calc(1.5em + .75rem + 2px)',
              width: '100%',
              paddingTop: '.375rem',
            }}
          >
            <ToggleButton size="sm" variant="outline-primary" value={item?.options[0].toString()}>
              {item?.options[0].toString()}
            </ToggleButton>
            <ToggleButton size="sm" variant="outline-primary" value={item?.options[1].toString()}>
              {item?.options[1].toString()}
            </ToggleButton>
          </ToggleButtonGroup>
        );
      case 'select':
        return <Dropdown options={item.options} onChange={e => handleSwitch(e.value, i)} value={item.value} />;
      default:
        return (
          <Form.Control
            type="input"
            onChange={e => handleInput(e, i)}
            placeholder="Enter the input"
            value={item.value}
            isInvalid={warning[i]}
          />
        );
    }
  };

  return (
    <Modal size="lg" show={props.show} onHide={handleClose}>
      <Modal.Body style={{ padding: '30px' }}>
        <h4>
          {name} / {version}
        </h4>
        <p className="text-muted">{wfdesc}</p>
        <hr />
        <Form onSubmit={executeWorkflow}>
          <Row>
            {workflowForm.map((item, i) => {
              console.log(item);
              return (
                <Col sm={6} key={`col1-${i}`}>
                  <Form.Group>
                    <Form.Label>{item.label}</Form.Label>
                    {warning[i] ? (
                      <div
                        style={{
                          color: 'red',
                          fontSize: '12px',
                          float: 'right',
                          marginTop: '5px',
                        }}
                      >
                        Unnecessary space
                      </div>
                    ) : null}
                    {inputModel(item, i)}
                    <Form.Text className="text-muted">
                      {item.description}
                      <br />
                      {item.constraint && (
                        <>
                          <b>Constraint:</b> {item.constraint}
                        </>
                      )}
                    </Form.Text>
                  </Form.Group>
                </Col>
              );
            })}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <a style={{ float: 'left', marginRight: '50px' }} href={`${global.frontendUrlPrefix}/exec/${wfId}`}>
          {wfId}
        </a>
        <Button
          variant={
            status === 'OK'
              ? 'success'
              : status === 'Executing...'
              ? 'info'
              : status === 'Execute'
              ? 'primary'
              : 'danger'
          }
          onClick={executeWorkflow}
        >
          {status === 'Execute' ? <i className="fas fa-play" /> : null}
          {status === 'Executing...' ? <i className="fas fa-spinner fa-spin" /> : null}
          {status === 'OK' ? <i className="fas fa-check-circle" /> : null}
          &nbsp;&nbsp;{status}
        </Button>
        <Button variant="secondary" onClick={() => handleClose(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InputModal;
