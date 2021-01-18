import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Modal } from 'react-bootstrap';
import { List } from 'semantic-ui-react';
import { jsonParse } from '../../../../common/utils.js';
import { hash } from '../../../diagramBuilder/builder-utils';
import { GlobalContext } from '../../../../common/GlobalContext.js';

function createWorkflowTree(tasks, workflows) {
  return _.flatMap(tasks, task => {
    return {
      name: task.name,
      taskReferenceName: task.taskReferenceName,
      subWorkflowParam: task?.subWorkflowParam,
      description: jsonParse(task.description)?.description,
      subtasks: getSubTasks(task, workflows),
    };
  });
}

function getSubTasks(task, workflows) {
  if (task.type === 'SUB_WORKFLOW') {
    const subwf = _.find(workflows, { name: task.name });

    return createWorkflowTree(subwf?.tasks, workflows);
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

    return _.flatMap(decisionBranches, branch => {
      return {
        name: branch.name,
        // we need to create unique ID to be able to hide the branch in tree
        taskReferenceName: branch.name + hash(),
        subtasks: createWorkflowTree(branch.tasks, workflows),
      };
    });
  }

  if (task.type === 'FORK_JOIN') {
    const { forkTasks } = task;

    return _.flatMap(forkTasks, (branch, i) => {
      return {
        name: `branch ${i}`,
        // we need to create unique ID to be able to hide the branch in tree
        taskReferenceName: `branch ${i}` + hash(),
        subtasks: createWorkflowTree(branch, workflows),
      };
    });
  }

  return [];
}

const WorkflowListViewModal = props => {
  const global = useContext(GlobalContext);
  const [workflowTree, setWorkflowTree] = useState([]);
  const [hiddenTasks, setHiddenTasks] = useState([]);

  useEffect(() => {
    const { tasks } = props.wf;
    const workflows = props.data;
    setWorkflowTree(createWorkflowTree(tasks, workflows));
  }, []);

  function showHideTask(task) {
    if (hiddenTasks.includes(task.taskReferenceName)) {
      setHiddenTasks(oldArray => oldArray.filter(item => item !== task.taskReferenceName));
    } else {
      setHiddenTasks(oldArray => [...oldArray, task.taskReferenceName]);
    }
  }

  function renderHeader(task) {
    if (task.subWorkflowParam) {
      return (
        <a
          title="Click to open workflow in builder"
          target="_blank"
          href={`${global.frontendUrlPrefix}/builder/${task?.subWorkflowParam?.name}/${task?.subWorkflowParam?.version}`}
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
            name={hiddenTasks.includes(task.taskReferenceName) ? 'folder open' : 'folder'}
            onClick={() => showHideTask(task)}
          />
          <List.Content>
            <List.Header>{renderHeader(task)}</List.Header>
            <List.Description>{task?.description}</List.Description>
            {hiddenTasks.includes(task.taskReferenceName) && (
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
