// @flow
import React, { useState, useEffect } from 'react';
import { Modal, Button, Tab, Tabs, ButtonGroup } from 'react-bootstrap';
import DefaultsDescsTab from './DefaultsDescsTab';
import OutputParamsTab from './OutputParamsTab';
import GeneralParamsTab from './GeneralParamsTab';
import { jsonParse } from '../../../common/utils';

const GeneralInfoModal = props => {
  const [isWfNameValid, setWfNameValid] = useState(false);
  const [finalWorkflow, setFinalWf] = useState(props.finalWorkflow);
  const isNameLocked = props.isWfNameLocked;

  useEffect(() => {
    setFinalWf(props.finalWorkflow);
  }, [props.finalWorkflow]);

  const handleSave = () => {
    props.saveInputs(finalWorkflow);
    props.lockWorkflowName();
    props.closeModal();
  };

  const handleSubmit = e => {
    if (props.isWfNameLocked || isWfNameValid) {
      handleSave();
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleClose = () => {
    setFinalWf(props.finalWorkflow);
    props.closeModal();
  };

  const parseJSON = json => {
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const handleInput = (value, key) => {
    let finalWf = { ...finalWorkflow };

    if (key === 'name') {
      validateWorkflowName(value);
    }

    if (key === 'description') {
      let innerKey = Array.isArray(value) ? 'labels' : 'description';
      value = {
        ...parseJSON(finalWf.description),
        [innerKey]: value,
      };
      value = JSON.stringify(value);
    }

    finalWf = {
      ...finalWf,
      [key]: value,
    };

    setFinalWf(finalWf);
  };

  const validateWorkflowName = name => {
    let isValid = name.length >= 1;
    let workflows = props.workflows || [];

    workflows.forEach(wf => {
      if (wf.name === name) {
        isValid = false;
      }
    });
    setWfNameValid(isValid);
  };

  const getExistingLabels = () => {
    let workflows = props.workflows || [];
    let labels = [];
    workflows.forEach(wf => {
      let wfLabels = jsonParse(wf.description)?.labels;
      if (wfLabels) {
        labels.push(...wfLabels);
      }
    });
    return new Set(labels);
  };

  const handleOutputParam = (key, value) => {
    let finalWf = { ...finalWorkflow };
    let outputParameters = finalWf.outputParameters;

    finalWf = {
      ...finalWf,
      outputParameters: {
        ...outputParameters,
        [key]: value,
      },
    };

    setFinalWf(finalWf);
  };

  const handleCustomParam = param => {
    let finalWf = { ...finalWorkflow };
    let outputParameters = finalWf.outputParameters;

    finalWf = {
      ...finalWf,
      outputParameters: {
        ...outputParameters,
        [param]: 'provide path',
      },
    };

    setFinalWf(finalWf);
  };

  const handleInputParams = (paramKey, paramObj, key, value) => {
    let finalWf = { ...finalWorkflow };
    let inputParameters = jsonParse(finalWf.inputParameters ? finalWf.inputParameters[0] : null);

    delete paramObj.label;

    if (key === 'options') {
      value = value.split(',').map(e => {
        if (e === 'true' || e === 'false') {
          return e == 'true';
        }
        return e;
      });
    }

    let newInputParams = {
      ...inputParameters,
      [paramKey]: {
        ...paramObj,
        [key]: value,
      },
    };

    const optionValues = ['toggle', 'select'];
    if (key === 'type' && optionValues.includes(value)) {
      newInputParams = {
        ...newInputParams,
        [paramKey]: {
          ...newInputParams[paramKey],
          options: ['value1', 'value2'],
        },
      };
    } else if (key === 'type') {
      delete newInputParams[paramKey].options;
    }

    finalWf = { ...finalWf, inputParameters: [JSON.stringify(newInputParams)] };
    setFinalWf(finalWf);
  };

  const deleteOutputParam = selectedParam => {
    let finalWf = { ...finalWorkflow };
    let outputParameters = finalWf.outputParameters || [];

    delete outputParameters[selectedParam];

    finalWf = { ...finalWf, outputParameters };
    setFinalWf(finalWf);
  };

  return (
    <Modal size="lg" show={props.show} onHide={isNameLocked ? handleClose : () => false}>
      <Modal.Header>
        <Modal.Title>{isNameLocked ? 'Edit general information' : 'Create new workflow'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '30px' }}>
        <Tabs style={{ marginBottom: '20px' }}>
          <Tab eventKey={1} title="General">
            <GeneralParamsTab
              finalWf={finalWorkflow}
              handleInput={handleInput}
              isWfNameValid={isWfNameValid}
              handleSubmit={handleSubmit}
              isWfNameLocked={isNameLocked}
              getExistingLabels={getExistingLabels}
            />
          </Tab>
          <Tab eventKey={2} title="Output parameters">
            <OutputParamsTab
              finalWf={finalWorkflow}
              handleSubmit={handleSubmit}
              handleOutputParam={handleOutputParam}
              handleCustomParam={handleCustomParam}
              deleteOutputParam={deleteOutputParam}
            />
          </Tab>
          <Tab eventKey={3} title="Defaults & description">
            <DefaultsDescsTab finalWf={finalWorkflow} handleInputParams={handleInputParams} />
          </Tab>
        </Tabs>
        <ButtonGroup style={{ width: '100%', marginTop: '20px' }}>
          {!isNameLocked ? (
            <Button variant="outline-secondary" onClick={props.redirectOnExit}>
              Cancel
            </Button>
          ) : null}
          <Button onClick={handleSubmit} variant="primary">
            Save
          </Button>
        </ButtonGroup>
      </Modal.Body>
    </Modal>
  );
};

export default GeneralInfoModal;
