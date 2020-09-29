// @flow
import React, { useState, useEffect } from "react";
import { getWfInputsRegex } from "../builder-utils";
import {
  Form,
  Row,
  Col,
  InputGroup
} from "react-bootstrap";
import Dropdown from 'react-dropdown';

import _ from "lodash";

const inputParamsTemplate = {
  value: "",
  description: "",
  type: "string"
}

const jsonParse = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

const getInputParameters = (props) => {
  const inputParameters = jsonParse(
    props.finalWf.inputParameters ? props.finalWf.inputParameters[0] : null
  );
  let inputParametersKeys = Object.keys(getWfInputsRegex(props.finalWf)) || [];

  let inputParams = inputParametersKeys.map((key) => ({
    label: key,
    ...(inputParameters
      ? inputParameters[key]
        ? inputParameters[key]
        : inputParamsTemplate
      : inputParamsTemplate),
  }));

  const defaults = ['value', 'description', 'type']
  inputParams.forEach((param, i) => {
    defaults.forEach(d => {
        if(!inputParams[i][d]) {
          inputParams[i][d] = ""
        }
    })
  })

  return inputParams;
};

const DefaultsDescsTab = (props) => {
  const [inputParams, setInputParams] = useState([]);
  const [selectedParam, setSelectedParam] = useState(getInputParameters(props)[0]?.label);
  const [selectedParamObj, setSelectedParamObj] = useState({})

  useEffect(() => {
    selectParameter(selectedParam);
  }, [props]);

  const selectParameter = (label) => {
    let inputParams = getInputParameters(props);
    setInputParams(inputParams)
    setSelectedParam(label);
    setSelectedParamObj(_.find(inputParams, { label: label }));
  };

  const renderInputFields = (param, i) => {
    const types = ['string', 'toggle', 'select', 'textarea', 'node_id']

    switch (param[0]) {
      case "type":
        return (
          <Col sm={6} key={`col-${selectedParam}-${i}`}>
            <Form.Group>
              <Form.Label>{param[0]}</Form.Label>
              <Dropdown
                options={types}
                onChange={(e) => props.handleInputParams(
                  selectedParam,
                  selectedParamObj,
                  param[0],
                  e.value
                )}
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
                onChange={(e) =>
                  props.handleInputParams(
                    selectedParam,
                    selectedParamObj,
                    param[0],
                    e.target.value
                  )
                }
              />
            </Form.Group>
          </Col>
        );
    }
  }

  return (
    <div>
      <Form>
        <Form.Group>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Available input parameters:</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              disabled={inputParams.length === 0}
              onClick={(e) =>
                selectParameter(e.target.value)
              }
              as="select"
            >
              {inputParams.map((param) => (
                <option>{param.label}</option>
              ))}
            </Form.Control>
          </InputGroup>
        </Form.Group>
        <Row>
          {Object.entries(_.omit(selectedParamObj, "label")).map((param, i) =>
            renderInputFields(param, i)
          )}
        </Row>
      </Form>
    </div>
  );
};

export default DefaultsDescsTab;
