import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Modal } from 'react-bootstrap';
import { List, Button, Icon } from 'semantic-ui-react';
import { jsonParse } from '../../../../common/utils.js';
import { hash } from '../../../diagramBuilder/builder-utils';
import { GlobalContext } from '../../../../common/GlobalContext.js';

function createWorkflowTree(tasks, allWorkflows) {
  return tasks.map(task => {
    return {
      name: task.name,
      taskReferenceName: task.taskReferenceName,
      subWorkflowParam: task?.subWorkflowParam,
      description: jsonParse(task.description)?.description,
      subtasks: getSubTasks(task, allWorkflows),
    };
  });
}

function getSubTasks(task, allWorkflows) {
  if (task.type === 'SUB_WORKFLOW') {
    const subwf = _.find(allWorkflows, { name: task.name });

    // if we can't find subworkflow pass empty array
    return createWorkflowTree(subwf?.tasks || [], allWorkflows);
  }

  if (task.type === 'DECISION') {
    const { decisionCases } = task;
    const nonDefaultCaseNames = Object.keys(decisionCases);

    const decisionBranches = [
      ...nonDefaultCaseNames.map(name => {
        return {
          name: name,
          tasks: decisionCases[name],
        };
      }),
      {
        name: 'defaultCase',
        tasks: task.defaultCase,
      },
    ];

    return decisionBranches.map(branch => {
      return {
        name: branch.name,
        // we need to create unique ID to be able to expand/hide the branch in tree
        taskReferenceName: branch.name + hash(),
        subtasks: createWorkflowTree(branch.tasks, allWorkflows),
      };
    });
  }

  if (task.type === 'FORK_JOIN') {
    const { forkTasks } = task;

    return forkTasks.map((branch, i) => {
      return {
        name: `branch ${i}`,
        // we need to create unique ID to be able to expand/hide the branch in tree
        taskReferenceName: `branch ${i}` + hash(),
        subtasks: createWorkflowTree(branch, allWorkflows),
      };
    });
  }

  return [];
}

const WorkflowListViewModal = props => {
  const global = useContext(GlobalContext);
  const [workflowTree, setWorkflowTree] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);

  useEffect(() => {
    const { tasks } = props.wf;
    const allWorkflows = props.data;
    setWorkflowTree(createWorkflowTree(tasks, allWorkflows));
  }, []);

  function expandHideTask(task) {
    if (expandedTasks.includes(task.taskReferenceName)) {
      setExpandedTasks(oldArray => oldArray.filter(item => item !== task.taskReferenceName));
    } else {
      setExpandedTasks(oldArray => [...oldArray, task.taskReferenceName]);
    }
  }

  function renderExpandButton(task) {
    return (
      <Button basic primary compact size="mini" style={{ marginLeft: '5px' }} onClick={() => expandHideTask(task)}>
        {expandedTasks.includes(task.taskReferenceName) ? 'Collapse' : 'Expand'}
      </Button>
    );
  }

  function renderHeader(task) {
    const mutedTextStyle = { fontSize: '12px', fontWeight: '400', color: 'grey' };

    if (task.subWorkflowParam) {
      return (
        <p>
          {task.name} <span style={mutedTextStyle}>(workflow)</span>
          {renderExpandButton(task)}
          <Button
            as="a"
            title="Click to open workflow in builder"
            target="_blank"
            href={`${global.frontendUrlPrefix}/builder/${task.subWorkflowParam.name}/${task.subWorkflowParam.version}`}
            basic
            compact
            size="mini"
          >
            <Icon name="external" />
            Edit
          </Button>
        </p>
      );
    }

    return (
      <p>
        {task.name} <span style={mutedTextStyle}>(task)</span>
        {task.subtasks.length > 0 ? renderExpandButton(task) : null}
      </p>
    );
  }

  function renderSubtasks(task) {
    if (task?.subtasks?.length > 0) {
      return (
        <List.Item key={task.taskReferenceName} style={{ marginTop: '10px' }}>
          <List.Icon
            link
            name={expandedTasks.includes(task.taskReferenceName) ? 'angle down' : 'angle right'}
            onClick={() => expandHideTask(task)}
          />
          <List.Content>
            <List.Header>{renderHeader(task)}</List.Header>
            <List.Description>{task?.description}</List.Description>
            {expandedTasks.includes(task.taskReferenceName) && (
              <List.List>{task.subtasks.map(st => renderSubtasks(st))}</List.List>
            )}
          </List.Content>
        </List.Item>
      );
    }

    return (
      <List.Item key={task.taskReferenceName} style={{ marginTop: '10px' }}>
        <List.Icon name="angle right" style={{ opacity: 0 }} />
        <List.Content>
          <List.Header>{renderHeader(task)}</List.Header>
          <List.Description>{task?.description}</List.Description>
        </List.Content>
      </List.Item>
    );
  }

  const renderWorkflowAsTree = () => <List>{workflowTree.map(t => renderSubtasks(t))}</List>;

  return (
    <Modal size="lg" dialogClassName="modal-70w" show={props.show} onHide={props.modalHandler}>
      <Modal.Header>
        <Modal.Title>
          {props?.wf?.name}
          <br />
          <div style={{ fontSize: '18px' }}>
            <p className="text-muted">{jsonParse(props?.wf?.description)?.description}</p>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '30px' }}>{renderWorkflowAsTree()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.modalHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WorkflowListViewModal;
