// @flow
// Keep this import first, there is some problem with ace otherwise
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-graphqlschema';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'react-dropdown/style.css';
import Dropdown from 'react-dropdown';
import React, { useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';

/* FIXME graphQL editor : implement schema validation*/
// import {buildSchema} from "graphql";
// import 'codemirror/addon/hint/show-hint';
// import 'codemirror/addon/lint/lint';
// import 'codemirror/addon/lint/lint.css';
// import 'codemirror-graphql/hint';
import 'codemirror-graphql/mode';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/xq-light.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { jsonParse } from '../../../common/utils';

const TEXTFIELD_KEYWORDS = ['template', 'uri'];
const CODEFIELD_KEYWORDS = ['scriptExpression', 'raw'];
const SELECTFIELD_KEYWORDS = ['method', 'action', 'expectedType'];
const KEYFIELD_KEYWORDS = ['headers'];
const SELECTFIELD_OPTIONS = {
  action: ['complete_task', 'fail_task'],
  method: ['GET', 'PUT', 'POST', 'DELETE'],
  expectedType: ['SIMPLE', 'SUB_WORKFLOW'],
};

const InputsTab = props => {
  const [customParam, setCustomParam] = useState('');
  const textFieldParams = [];

  const getDescriptionAndDefault = selectedParam => {
    const inputParameters = jsonParse(props.inputParameters ? props.inputParameters[0] : null);

    if (!inputParameters) {
      return null;
    }

    return inputParameters[selectedParam]?.description;
  };

  const addNewInputParam = e => {
    e.preventDefault();
    e.stopPropagation();

    props.addNewInputParam(customParam);
    setCustomParam('');
  };

  const removeInputParam = e => {
    e.preventDefault();
    e.stopPropagation();

    props.removeInputParam(customParam);
    setCustomParam('');
  };

  const createTextField = (entry, item) => {
    let value = entry[1];

    if (!entry[0].includes('uri')) {
      if (typeof entry[1] === 'object') {
        value = JSON.stringify(entry[1], null, 5);
      }
    }

    textFieldParams.push(
      <Col sm={12} key={`colTf-${entry[0]}`}>
        <Form.Group>
          <Form.Label>
            {entry[0]}
            <i
              title="copy to clipboard"
              className="btn fa fa-clipboard"
              data-clipboard-target={`#textfield-${entry[0]}`}
            />
          </Form.Label>
          <InputGroup
            size="sm"
            style={{
              minHeight: entry[0] === 'uri' || entry[0] === 'headers' ? '60px' : '200px',
            }}
          >
            <Form.Control
              id={`textfield-${entry[0]}`}
              as="textarea"
              type="input"
              onChange={e => props.handleInput(e.target.value, item, entry)}
              value={value}
            />
          </InputGroup>
          <Form.Text className="text-muted">{getDescriptionAndDefault(entry[0])}</Form.Text>
        </Form.Group>
      </Col>,
    );
  };

  const creategraphQLField = (entry, item) => {
    /* FIXME graphQL editor : implement schema validation*/
    //  let schema = buildSchema(`...`);

    // FIXME workaround to handle as graphql
    item[0] = entry[0] === 'body' ? 'graphql_request' : item;
    item[1] = 'graphql_body';

    textFieldParams.push(
      <Col sm={12} key={`colTf-${entry[0]}`}>
        <Form.Group>
          <Form.Label>{entry[0] === 'body' ? 'graphQLBody' : entry[0]}</Form.Label>
          <CodeMirror
            value={entry[1]?.query}
            options={{
              mode: 'graphql',
              theme: 'xq-light',
              lineNumbers: true,
              autoRefresh: true,
              lint: {
                /* FIXME graphQL editor : implement schema validation*/
                schema: null,
              },
              hintOptions: {
                /* FIXME graphQL editor : implement schema validation*/
                schema: null,
              },
            }}
            onBeforeChange={(editor, data, value) => {
              props.handleInput(value, item, entry);
            }}
            onChange={(editor, data, value) => {
              props.handleInput(value, item, entry);
            }}
          />
          <Form.Text className="text-muted">{getDescriptionAndDefault(entry[0])}</Form.Text>
        </Form.Group>
      </Col>,
    );
  };

  const createCodeField = (entry, item, lang = 'javascript') => {
    const value = entry[1];

    textFieldParams.push(
      <Col sm={12} key={`colTf-${entry[0]}`}>
        <Form.Group>
          <Form.Label>{entry[0]}</Form.Label>
          <AceEditor
            mode={lang}
            theme="tomorrow"
            width="100%"
            height="300px"
            onChange={val => props.handleInput(val, item, entry)}
            fontSize={16}
            value={value}
            wrapEnabled={true}
            setOptions={{
              showPrintMargin: true,
              highlightActiveLine: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
          <Form.Text className="text-muted">{getDescriptionAndDefault(entry[0])}</Form.Text>
        </Form.Group>
      </Col>,
    );
  };

  const createSelectField = (entry, item) => {
    const value = entry[1];
    const options = SELECTFIELD_OPTIONS[entry[0]];

    return (
      <Col sm={6} key={`colTf-${entry[0]}`}>
        <Form.Group>
          <Form.Label>{entry[0]}</Form.Label>
          <Dropdown options={options} onChange={e => props.handleInput(e.value, item, entry)} value={value} />
          <Form.Text className="text-muted">{getDescriptionAndDefault(entry[0])}</Form.Text>
        </Form.Group>
      </Col>
    );
  };

  const createKeyField = (entry, item) => {
    textFieldParams.push(
      <Col sm={12} key={`colTf-${entry[0]}`}>
        <Form.Label>
          {entry[0]}&nbsp;&nbsp;
          <Button size="sm" variant="outline-primary" onClick={() => props.addRemoveHeader(true)}>
            <i className="fas fa-plus" /> Add
          </Button>
        </Form.Label>
        {Object.entries(entry[1]).map((header, i) => {
          return (
            <Row key={`header-${i}`}>
              <Col sm={6}>
                <Form.Group controlId={`header-key-${i}`}>
                  {i === 0 ? <Form.Label className="text-muted">Key</Form.Label> : null}
                  <Form.Control
                    style={{ marginBottom: '2px' }}
                    type="input"
                    onChange={e => props.handleInput(e.target.value, item, entry, i, true)}
                    value={header[0]}
                  />
                </Form.Group>
              </Col>
              <Col sm={5}>
                <Form.Group controlId={`header-value-${i}`}>
                  {i === 0 ? <Form.Label className="text-muted">Value</Form.Label> : null}
                  <Form.Control
                    style={{ marginBottom: '2px' }}
                    type="input"
                    onChange={e => props.handleInput(e.target.value, item, entry, i, false)}
                    value={header[1]}
                  />
                </Form.Group>
              </Col>
              <Col sm={1}>
                {i === 0 ? <Form.Label className="text-muted">Delete</Form.Label> : null}
                <Button variant="outline-danger" onClick={() => props.addRemoveHeader(false, i)}>
                  <i className="fas fa-minus" />
                </Button>
              </Col>
            </Row>
          );
        })}
      </Col>,
    );
  };

  const createBasicField = (entry, item) => {
    return (
      <Col sm={6} key={`colDefault-${entry[0]}`}>
        <Form.Group>
          <Form.Label>{entry[0]}</Form.Label>
          <Form.Control type="input" onChange={e => props.handleInput(e.target.value, item, entry)} value={entry[1]} />
          <Form.Text className="text-muted">{getDescriptionAndDefault(entry[0])}</Form.Text>
        </Form.Group>
      </Col>
    );
  };

  const handleInputField = (entry, item) => {
    if (entry[0].includes('graphQLBody') || entry[0].includes('body')) {
      if (props.taskReferenceName.includes('graphQLTaskRef_')) {
        creategraphQLField(entry, item);
      } else {
        createTextField(entry, item);
      }
    } else if (TEXTFIELD_KEYWORDS.find(keyword => entry[0].includes(keyword))) {
      createTextField(entry, item);
    } else if (CODEFIELD_KEYWORDS.find(keyword => entry[0].includes(keyword))) {
      createCodeField(entry, item);
    } else if (SELECTFIELD_KEYWORDS.find(keyword => entry[0].includes(keyword))) {
      return createSelectField(entry, item);
    } else if (KEYFIELD_KEYWORDS.find(keyword => entry[0].includes(keyword))) {
      createKeyField(entry, entry);
    } else {
      return createBasicField(entry, item);
    }
  };

  const createAdditionalFieldsPrompt = () => {
    return (
      <Row>
        <Form onSubmit={addNewInputParam} onReset={removeInputParam}>
          <InputGroup style={{ padding: '10px 215px 10px' }}>
            <Form.Control
              value={customParam}
              onChange={e => setCustomParam(e.target.value)}
              placeholder="Add new parameter name"
            />
            <InputGroup.Append>
              <Button type="submit" variant="outline-primary">
                Add
              </Button>
              <Button
                disabled={!props.inputs?.inputParameters?.hasOwnProperty(customParam)}
                type="reset"
                variant="outline-secondary"
              >
                Remove
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </Row>
    );
  };

  return (
    <div>
      {props.name !== 'RAW' && createAdditionalFieldsPrompt()}

      <hr className="hr-text" data-content="Existing input parameters" />
      <Form onSubmit={e => e.preventDefault()}>
        <Row>
          {Object.entries(props.inputs || []).map(item => {
            if (item[0] === 'inputParameters') {
              return Object.entries(item[1]).map(entry => {
                if (typeof entry[1] === 'object' && !TEXTFIELD_KEYWORDS.find(keyword => entry[0].includes(keyword))) {
                  return Object.entries(entry[1]).map(innerEntry => {
                    return handleInputField(innerEntry, entry);
                  });
                } else {
                  return handleInputField(entry, item);
                }
              });
            }
            return null;
          })}
        </Row>
        <Row>{textFieldParams}</Row>
      </Form>
    </div>
  );
};

export default InputsTab;
