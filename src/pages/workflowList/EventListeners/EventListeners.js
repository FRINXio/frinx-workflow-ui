import React, { useState, useEffect, useContext } from 'react';
import { Table, Checkbox, Button, Icon, Input } from 'semantic-ui-react';
import { Modal } from 'react-bootstrap';
import AceEditor from 'react-ace';
import { HttpClient as http } from '../../../common/HttpClient';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { GlobalContext } from '../../../common/GlobalContext';
import { usePagination } from '../../../common/PaginationHook';
import PaginationPages from '../../../common/Pagination';

function EventListeners() {
  const global = useContext(GlobalContext);
  const [eventListeners, setEventListeners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { currentPage, setCurrentPage, pageItems, setItemList, totalPages } = usePagination([], 10);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const results = !searchTerm
      ? eventListeners
      : eventListeners.filter(e => {
          let searchedKeys = ['name', 'event'];
          for (let i = 0; i < searchedKeys.length; i += 1) {
            if (
              e[searchedKeys[i]]
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLocaleLowerCase())
            ) {
              return true;
            }
          }
          return false;
        });
    setItemList(results);
  }, [searchTerm, eventListeners]);

  const getData = () => {
    http.get(global.backendApiUrlPrefix + '/event').then(res => {
      if (Array.isArray(res)) {
        setEventListeners(res);
      }
    });
  };

  const editEvent = (state, event) => {
    if (state !== null) {
      event.active = state;
    }

    http
      .post(global.backendApiUrlPrefix + '/event', event)
      .then(res => {
        getData();
      })
      .catch(err => {
        alert(err);
      });
    setSelectedEvent(null);
  };

  const deleteEvent = name => {
    http
      .delete(global.backendApiUrlPrefix + '/event/' + name)
      .then(() => {
        getData();
      })
      .catch(err => {
        alert(err);
      });
  };

  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  const parseJSON = data => {
    try {
      let parsedJSON = JSON.parse(data);
      setSelectedEvent(parsedJSON);
    } catch (e) {
      console.log(e);
    }
  };

  const editModal = () => (
    <Modal size="lg" show={selectedEvent !== null} onHide={() => setSelectedEvent(null)}>
      <Modal.Header>
        <Modal.Title>Edit {selectedEvent?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AceEditor
          mode="javascript"
          theme="tomorrow"
          width="100%"
          height="300px"
          onChange={data => parseJSON(data)}
          fontSize={16}
          value={JSON.stringify(selectedEvent, null, 2)}
          wrapEnabled={true}
          setOptions={{
            showPrintMargin: true,
            highlightActiveLine: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button primary onClick={() => editEvent(null, selectedEvent)}>
          Save
        </Button>
        <Button onClick={() => setSelectedEvent(null)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div>
      {editModal()}
      <Input iconPosition="left" fluid icon placeholder="Search...">
        <input value={searchTerm} onChange={handleChange} />
        <Icon name="search" />
      </Input>
      <Table celled compact color="blue">
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell>Active</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Sink</Table.HeaderCell>
            <Table.HeaderCell>Workflow Name</Table.HeaderCell>
            <Table.HeaderCell>Event Task Name</Table.HeaderCell>
            <Table.HeaderCell>Action</Table.HeaderCell>
            <Table.HeaderCell style={{ textAlign: 'center' }}>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pageItems.map(e => {
            return (
              <Table.Row key={e.event}>
                <Table.Cell style={{ textAlign: 'center' }}>
                  <Checkbox toggle checked={e.active} onChange={() => editEvent(!e.active, e)} />
                </Table.Cell>
                <Table.Cell>{e.name}</Table.Cell>
                <Table.Cell>{e.event.split(':')[0]}</Table.Cell>
                <Table.Cell>{e.event.split(':')[1]}</Table.Cell>
                <Table.Cell>{e.event.split(':')[2]}</Table.Cell>
                <Table.Cell>{e.actions[0].action}</Table.Cell>
                <Table.Cell style={{ textAlign: 'center' }}>
                  <Button basic circular onClick={() => setSelectedEvent(e)}>
                    Edit
                  </Button>
                  <Button basic circular icon negative onClick={() => deleteEvent(e.name)}>
                    <Icon name="trash" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="7">
              <PaginationPages totalPages={totalPages} currentPage={currentPage} changePageHandler={setCurrentPage} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  );
}

export default EventListeners;
