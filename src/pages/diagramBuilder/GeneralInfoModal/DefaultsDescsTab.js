import React, { useState } from 'react';
import { getWfInputsRegex } from '../builder-utils';
import Dropdown from 'react-dropdown';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';

import _ from 'lodash';
import { jsonParse } from '../../../common/utils';

const inputParamsTemplate = {
  value: '',
  description: '',
  type: 'string',
  constraint: '',
};

const getInputParameters = props => {
  const inputParameters = jsonParse(props.finalWf.inputParameters ? props.finalWf.inputParameters[0] : null);
  const inputParametersKeys = Object.keys(getWfInputsRegex(props.finalWf)) || [];

  // fill input param key with existing attributes or use template
  const inputParams = inputParametersKeys.map(key => ({
    label: key,
    ...(inputParameters ? (inputParameters[key] ? inputParameters[key] : inputParamsTemplate) : inputParamsTemplate),
  }));

  return inputParams;
};

const DefaultsDescsTab = props => {
  const inputParams = getInputParameters(props);
  const [selectedParam, setSelectedParam] = useState(inputParams[0]?.label);
  const selectedParamObj = _.find(inputParams, { label: selectedParam });

  const handleInputParamSelect = (event: SyntheticEvent<HTMLSelectElement>) => {
    setSelectedParam(event.currentTarget.value);
  };

  const renderInputFields = (param, i) => {
    const types = ['string', 'toggle', 'select', 'textarea', 'workflow-id', 'task-refName'];

    switch (param[0]) {
      case 'type':
        return (
          <Col sm={6} key={`col-${selectedParam}-${i}`}>
            <Form.Group>
              <Form.Label>{param[0]}</Form.Label>
              <Dropdown
                options={types}
                onChange={e => {
                  props.handleInputParams(selectedParam, selectedParamObj, param[0], e.value);
                }}
                value={param[1]}
              />
            </Form.Group>
          </Col>
        );
      default:
        return (
          <Col sm={6} key={`col-${selectedParam}-${i}`}>
            <Form.Group>
              <Form.Label>{param[0]}</Form.Label>
              <Form.Control
                defaultValue={param[1]}
                onChange={e => props.handleInputParams(selectedParam, selectedParamObj, param[0], e.target.value)}
              />
            </Form.Group>
          </Col>
        );
    }
  };

  return (
    <div>
      <Form>
        <Form.Group>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Available input parameters:</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              value={selectedParam}
              disabled={inputParams.length === 0}
              onChange={handleInputParamSelect}
              as="select"
            >
              {inputParams.map(param => (
                <option value={param.label}>{param.label}</option>
              ))}
            </Form.Control>
          </InputGroup>
        </Form.Group>
        <Row>{Object.entries(_.omit(selectedParamObj, 'label')).map((param, i) => renderInputFields(param, i))}</Row>
      </Form>
    </div>
  );
};

export default DefaultsDescsTab;
