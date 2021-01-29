import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Modal } from 'react-bootstrap';
import { List } from 'semantic-ui-react';
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
    const nonDefaultCaseName = Object.keys(decisionCases)[0];

    // there are always only 2 branches in current impl
    const decisionBranches = [
      {
        name: nonDefaultCaseName,
        tasks: decisionCases[nonDefaultCaseName],
      },
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

  function renderHeader(task) {
    if (task.subWorkflowParam) {
      return (
        <a
          title="Click to open workflow in builder"
          target="_blank"
          href={`${global.frontendUrlPrefix}/builder/${task.subWorkflowParam.name}/${task.subWorkflowParam.version}`}
        >
          {task.name}
        </a>
      );
    }

    return task.name;
  }

  function renderSubtasks(task) {
    if (task?.subtasks?.length > 0) {
      return (
        <List.Item key={task.taskReferenceName}>
          <List.Icon
            link
            name={expandedTasks.includes(task.taskReferenceName) ? 'folder open' : 'folder'}
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
      <List.Item key={task.taskReferenceName}>
        <List.Icon name="sticky note outline" />
        <List.Content>
          <List.Header>{task.name}</List.Header>
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
