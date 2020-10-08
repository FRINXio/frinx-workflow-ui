// @flow
import React, {useState} from 'react';
import {Accordion, Icon} from 'semantic-ui-react';
import {Button, ButtonGroup, Col, Form, InputGroup} from 'react-bootstrap';
import {taskDescriptions} from '../../../constants';

const HIDDEN = [
  'type',
  'subWorkflowParam',
  'joinOn',
  'name',
  'taskReferenceName',
  'forkTasks',
  'inputParameters',
  'defaultCase',
];

const GeneralTab = props => {
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const taskName = props.inputs?.name || '';
  const taskRefName = props?.inputs?.taskReferenceName || '';
  const decisionCases = [];
  const caseValueParam = [];

  const renderTaskName = item => (
    <Form.Group>
      <InputGroup size="lg">
        <InputGroup.Prepend>
          <InputGroup.Text>name:</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          type="input"
          disabled={props.inputs?.type === 'SIMPLE'}
          onChange={e => props.handleInput(e.target.value, 'name')}
          value={item}
        />
      </InputGroup>
      <Form.Text className="text-muted">{taskDescriptions['name']}</Form.Text>
    </Form.Group>
  );

  const renderTaskRefName = item => (
    <Form.Group>
      <InputGroup size="lg">
        <InputGroup.Prepend>
          <InputGroup.Text>taskReferenceName:</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          type="input"
          onChange={e => props.handleInput(e.target.value, 'taskReferenceName')}
          value={item}
        />
      </InputGroup>
      <Form.Text className="text-muted">
        {taskDescriptions['taskReferenceName']}
      </Form.Text>
    </Form.Group>
  );

  const buttonWrappedField = (item, left, right) => (
    <Form.Group>
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{item[0]}:</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control type="input" value={item[1]} onChange={() => {}} />
        <InputGroup.Append>
          <ButtonGroup>
            <Button
              variant="outline-primary"
              onClick={() => props.handleInput(left[1], item[0])}>
              {left[0]}
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => props.handleInput(right[1], item[0])}>
              {right[0]}
            </Button>
          </ButtonGroup>
        </InputGroup.Append>
      </InputGroup>
      <Form.Text className="text-muted">{taskDescriptions[item[0]]}</Form.Text>
    </Form.Group>
  );

  const renderDecisionCasesParam = item => {
    return Object.entries(item[1]).forEach(entry => {
      decisionCases.push(
        <Col sm={6} key={`colGeneral-decision-case`}>
          <Form.Group>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>is equal to</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                type="input"
                onChange={e => props.handleInput(e.target.value, item)}
                value={entry[0]}
              />
            </InputGroup>
            <Form.Text className="text-muted">
              {taskDescriptions[item[0]]}
            </Form.Text>
          </Form.Group>
        </Col>,
      );
    });
  };

  const renderBooleanParam = (item, i) => {
    return (
      <Col sm={6} key={`colGeneral-boolean-${i}`}>
        {buttonWrappedField(item, ['<', !item[1]], ['>', !item[1]])}
      </Col>
    );
  };

  const renderCaseValueParam = item => {
    caseValueParam.push(
      <Col sm={6} key={`colGeneral-case-value`}>
        <Form.Group>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>if</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              type="input"
              onChange={e => props.handleInput(e.target.value, item[0])}
              value={item[1]}
            />
          </InputGroup>
          <Form.Text className="text-muted">
            {taskDescriptions[item[0]]}
          </Form.Text>
        </Form.Group>
      </Col>,
    );
  };

  const renderParam = (item, i) => {
    return (
      <Col sm={6} key={`colGeneral-param-${i}`}>
        <Form.Group>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>{item[0]}:</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              type="input"
              onChange={e => props.handleInput(e.target.value, item[0])}
              value={item[1]}
            />
          </InputGroup>
          <Form.Text className="text-muted">
            {taskDescriptions[item[0]]}
          </Form.Text>
        </Form.Group>
      </Col>
    );
  };

  const handleGeneralParams = (item, i) => {
    const BOOLEAN_PARAMS = ['optional', 'asyncComplete'];

    if (BOOLEAN_PARAMS.includes(item[0])) {
      return renderBooleanParam(item, i);
    }

    switch (item[0]) {
      case 'caseValueParam':
        return renderCaseValueParam(item);
      case 'decisionCases':
        return renderDecisionCasesParam(item);
      default:
        return renderParam(item, i);
    }
  };

  return (
    <Form>
      {renderTaskName(taskName)}
      {renderTaskRefName(taskRefName)}
      <Form.Row>
        {caseValueParam}
        {decisionCases}
      </Form.Row>
      <Accordion>
        <Accordion.Title
          active={showAdvancedParams}
          onClick={() => setShowAdvancedParams(!showAdvancedParams)}>
          <Icon name="dropdown" />
          Advanced parameters
        </Accordion.Title>
        <Accordion.Content active={showAdvancedParams}>
          <Form.Row>
            {Object.entries(props.inputs).map((item, i) => {
              if (!HIDDEN.includes(item[0])) {
                return handleGeneralParams(item, i);
              }
              return null;
            })}
          </Form.Row>
        </Accordion.Content>
      </Accordion>
    </Form>
  );
};

export default GeneralTab;
