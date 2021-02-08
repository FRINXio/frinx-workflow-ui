// @flow
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Input, Icon, Grid } from 'semantic-ui-react';
import TaskModal from './TaskModal';
import { HttpClient as http } from '../../../common/HttpClient';
import { GlobalContext } from '../../../common/GlobalContext';
import AddTaskModal from './AddTaskModal';
import { taskDefinition } from '../../../constants';
import { sortAscBy, sortDescBy } from '../workflowUtils';
import PaginationPages from '../../../common/Pagination';
import { usePagination } from '../../../common/PaginationHook';

function TaskList() {
  const global = useContext(GlobalContext);
  const [keywords, setKeywords] = useState('');
  const [sorted, setSorted] = useState(false);
  const [data, setData] = useState([]);
  const [taskModal, setTaskModal] = useState(false);
  const [taskName, setTaskName] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskBody, setTaskBody] = useState(taskDefinition);
  const { currentPage, setCurrentPage, pageItems, setItemList, totalPages } = usePagination([], 10);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const results = !keywords
      ? data
      : data.filter(e => {
          let searchedKeys = [
            'name',
            'timeoutPolicy',
            'timeoutSeconds',
            'responseTimeoutSeconds',
            'retryCount',
            'retryLogic',
          ];

          for (let i = 0; i < searchedKeys.length; i += 1) {
            if (
              e[searchedKeys[i]]
                .toString()
                .toLowerCase()
                .includes(keywords.toLocaleLowerCase())
            ) {
              return true;
            }
          }
          return false;
        });
    setItemList(results);
  }, [keywords, data]);

  const getData = () => {
    http.get(global.backendApiUrlPrefix + '/metadata/taskdefs').then(res => {
      if (res.result) {
        let data = res.result.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0)) || [];
        setData(data);
      }
    });
  };

  const handleTaskModal = name => {
    let taskName = name !== undefined ? name : null;
    setTaskName(taskName);
    setTaskModal(!taskModal);
  };

  const filteredRows = () => {
    return pageItems.map(e => {
      return (
        <Table.Row key={e.name}>
          <Table.Cell>{e.name}</Table.Cell>
          <Table.Cell>{e.timeoutPolicy}</Table.Cell>
          <Table.Cell>{e.timeoutSeconds}</Table.Cell>
          <Table.Cell>{e.responseTimeoutSeconds}</Table.Cell>
          <Table.Cell>{e.retryCount}</Table.Cell>
          <Table.Cell>{e.retryLogic}</Table.Cell>
          <Table.Cell style={{ textAlign: 'center' }}>
            <Button title="Definition" basic circular icon="file code" onClick={() => handleTaskModal(e.name)} />
            <Button title="Delete" basic circular negative icon="trash" onClick={() => deleteTask(e.name)} />
          </Table.Cell>
        </Table.Row>
      );
    });
  };

  const deleteTask = name => {
    http.delete(global.backendApiUrlPrefix + '/metadata/taskdefs/' + name).then(res => {
      if (res.status === 200) {
        getData();
      }
    });
  };

  const sortArray = key => {
    let sortedArray = data;

    sortedArray.sort(sorted ? sortDescBy(key) : sortAscBy(key));
    setSorted(!sorted);
    setData(sortedArray);
  };

  const showAddNewTaskModal = () => {
    setShowAddTaskModal(!showAddTaskModal);
  };

  const taskTable = () => {
    return (
      <Table celled compact sortable color="blue">
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell onClick={() => sortArray('name')}>Name/Version</Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray('timeoutPolicy')}>Timeout Policy</Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray('timeoutSeconds')}>Timeout Seconds</Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray('responseTimeoutSeconds')}>Response Timeout</Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray('retryCount')}>Retry Count</Table.HeaderCell>
            <Table.HeaderCell onClick={() => sortArray('retryLogic')}>Retry Logic</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{filteredRows()}</Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="7">
              <PaginationPages totalPages={totalPages} currentPage={currentPage} changePageHandler={setCurrentPage} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  };

  const handleInput = e =>
    setTaskBody({
      ...taskBody,
      [e.target.name]: e.target.value,
    });

  const addTask = () => {
    Object.keys(taskBody).forEach((key, i) => {
      if (key === 'inputKeys' || key === 'outputKeys') {
        taskBody[key] = taskBody[key]
          .replace(/ /g, '')
          .split(',')
          .filter(e => {
            return e !== '';
          });
        taskBody[key] = [...new Set(taskBody[key])];
      }
    });
    if (taskBody['name'] !== '') {
      const newTask = { ...taskBody, ownerEmail: 'example@example.com' };
      http.post(global.backendApiUrlPrefix + '/metadata/taskdefs', [newTask]).then(() => {
        window.location.reload();
      });
    }
  };

  let taskModalComp = taskModal ? (
    <TaskModal name={taskName} modalHandler={() => handleTaskModal()} show={taskModal} />
  ) : null;

  let addTaskModal = showAddTaskModal ? (
    <AddTaskModal
      modalHandler={showAddNewTaskModal}
      show={showAddTaskModal}
      taskBody={taskBody}
      handleInput={handleInput}
      addTask={addTask}
    />
  ) : null;

  return (
    <div>
      {taskModalComp}
      {addTaskModal}
      <Grid padded="horizontally">
        <Grid.Row>
          <Grid.Column width={15}>
            <Input iconPosition="left" fluid icon placeholder="Search...">
              <input value={keywords} onChange={e => setKeywords(e.target.value)} />
              <Icon name="search" />
            </Input>
          </Grid.Column>
          <Grid.Column width={1}>
            <Button primary onClick={() => showAddNewTaskModal()}>
              New
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      {taskTable()}
    </div>
  );
}

export default TaskList;
