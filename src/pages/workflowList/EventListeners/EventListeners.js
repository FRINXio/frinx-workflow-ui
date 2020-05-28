import React, { useState, useEffect } from "react";
import { Table, Checkbox, Button, Icon, Input } from "semantic-ui-react";
import { Modal } from "react-bootstrap";
import AceEditor from "react-ace";
import { HttpClient as http } from "../../../common/HttpClient";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow";

function EventListeners(props) {
  const [eventListeners, setEventListeners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const backendApiUrlPrefix = props.backendApiUrlPrefix;

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    http.get(backendApiUrlPrefix + "/event").then((res) => {
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
      .post(backendApiUrlPrefix + "/event", event)
      .then((res) => {
        getData();
      })
      .catch((err) => {
        alert(err);
      });
    setSelectedEvent(null);
  };

  const deleteEvent = (name) => {
    http
      .delete(backendApiUrlPrefix + "/event/" + name)
      .then(() => {
        getData();
      })
      .catch((err) => {
        alert(err);
      });
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const parseJSON = (data) => {
    try {
      let parsedJSON = JSON.parse(data);
      setSelectedEvent(parsedJSON);
    } catch (e) {
      console.log(e);
    }
  };

  const results = !searchTerm
    ? eventListeners
    : eventListeners.filter((e) =>
        e.event.toLowerCase().includes(searchTerm.toLocaleLowerCase())
      );

  const editModal = () => (
    <Modal
      size="lg"
      show={selectedEvent !== null}
      onHide={() => setSelectedEvent(null)}
    >
      <Modal.Header>
        <Modal.Title>Edit {selectedEvent?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AceEditor
          mode="javascript"
          theme="tomorrow"
          width="100%"
          height="300px"
          onChange={(data) => parseJSON(data)}
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
            <Table.HeaderCell style={{ textAlign: "center" }}>
              <Icon name="cog" />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {results.map((e) => {
            return (
              <Table.Row>
                <Table.Cell style={{ textAlign: "center" }}>
                  <Checkbox
                    toggle
                    checked={e.active}
                    onChange={() => editEvent(!e.active, e)}
                  />
                </Table.Cell>
                <Table.Cell>{e.name}</Table.Cell>
                <Table.Cell>{e.event.split(":")[0]}</Table.Cell>
                <Table.Cell>{e.event.split(":")[1]}</Table.Cell>
                <Table.Cell>{e.event.split(":")[2]}</Table.Cell>
                <Table.Cell>{e.actions[0].action}</Table.Cell>
                <Table.Cell style={{ textAlign: "center" }}>
                  <Button size="mini" onClick={() => setSelectedEvent(e)}>
                    Edit
                  </Button>
                  <Button size="mini" icon negative onClick={() => deleteEvent(e.name)}>
                    <Icon name="trash"/>
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}

export default EventListeners;
