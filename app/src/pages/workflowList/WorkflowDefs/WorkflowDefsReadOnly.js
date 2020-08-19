/* 
  FIXME 
  This is just copy-pasted WorfklowDefs with removed functionality. 
  Find out better way to implement read only components. We probably
  want to use something different than class inheritance.

  https://reactjs.org/docs/composition-vs-inheritance.html

*/

// @flow
import React, { useContext, useState, useEffect } from "react";
import { Col, Form, Row, Modal } from "react-bootstrap";
import { Table, Header, Button, Popup } from "semantic-ui-react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { withRouter } from "react-router-dom";
import WfLabels from "../../../common/WfLabels";
import DefinitionModal from "./DefinitonModal/DefinitionModal";
import DiagramModal from "./DiagramModal/DiagramModal";
import InputModal from "./InputModal/InputModal";
import DependencyModal from "./DependencyModal/DependencyModal";
import { HttpClient as http } from "../../../common/HttpClient";
import { GlobalContext } from "../../../common/GlobalContext";
import PaginationPages from "../../../common/Pagination";
import { usePagination } from "../../../common/PaginationHook";

const jsonParse = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

const getLabels = (dataset) => {
  let labelsArr = dataset.map(({ description }) => {
    return jsonParse(description)?.labels;
  });
  let allLabels = [...new Set([].concat(...labelsArr))];
  return allLabels
    .filter((e) => {
      return e !== undefined;
    })
    .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
};

function WorkflowDefs(props) {
  const global = useContext(GlobalContext);
  const [keywords, setKeywords] = useState("");
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [activeWf, setActiveWf] = useState(null);
  const [defModal, setDefModal] = useState(false);
  const [diagramModal, setDiagramModal] = useState(false);
  const [inputModal, setInputModal] = useState(false);
  const [dependencyModal, setDependencyModal] = useState(false);
  const [allLabels, setAllLabels] = useState([]);
  const {
    currentPage,
    setCurrentPage,
    pageItems,
    setItemList,
    totalPages,
  } = usePagination([], 10);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    var results =
      !keywords && labels.length === 0
        ? data
        : data.filter((e) => {
            let searchedKeys = ["name"];
            let queryWords = keywords.toUpperCase().split(" ");
            let labelsArr = jsonParse(e.description)?.labels;

            // if labels are used and wf doesnt contain selected labels => filter out
            if (labels.length > 0 ) {
              if (_.difference(labels, labelsArr).length !== 0) {
                return false;
              }
            }

            // search for keywords in "searchedKeys"
            for (let i = 0; i < searchedKeys.length; i += 1) {
              for (let j = 0; j < queryWords.length; j += 1) {
                if (
                  e[searchedKeys[i]]
                    .toString()
                    .toUpperCase()
                    .indexOf(queryWords[j]) !== -1
                ) {
                  return true;
                }
              }
              return false;
            }
          });
    setItemList(results);
  }, [keywords, labels, data]);

  const getData = () => {
    http.get(global.backendApiUrlPrefix + "/metadata/workflow").then((res) => {
      if (res.result) {
        let dataset =
          res.result.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          ) || [];
        setData(dataset);
        setAllLabels(getLabels(dataset));
      }
    });
  };

  const searchFavourites = () => {
    let newLabels = [...labels];
    let index = newLabels.findIndex((label) => label === "FAVOURITE");
    index > -1 ? newLabels.splice(index, 1) : newLabels.push("FAVOURITE");
    setLabels(newLabels);
  };

  const createLabels = ({ name, description }) => {
    const labelsDef = jsonParse(description)?.labels || [];

    return labelsDef.map((label, i) => {
      let index = allLabels.findIndex((lab) => lab === label);
      return (
        <WfLabels
          key={`${name}-${i}`}
          label={label}
          index={index}
          search={() => setLabels([...labels, label])}
        />
      );
    });
  };

  const repeatButtons = (dataset) => {
    return (
      <Table.Cell singleLine textAlign="center">
        <Button
          title="Diagram"
          basic
          circular
          icon="fork"
          onClick={() => showDiagramModal(dataset)}
        />
        <Button
          title="Definition"
          basic
          circular
          icon="file code"
          onClick={() => showDefinitionModal(dataset)}
        />
        <Button
          title="Execute"
          id={`executeBtn-${dataset.name}`}
          primary
          circular
          icon="play"
          onClick={() => showInputModal(dataset)}
        />
      </Table.Cell>
    );
  };

  const filteredRows = () => {
    return pageItems.map((e) => {
      return (
        <Table.Row>
          <Table.Cell>
            <Header as="h4">
              <Header.Content>
                {e.name} / {e.version}
                <Header.Subheader>
                  {jsonParse(e.description)?.description ||
                    (jsonParse(e.description)?.description !== "" &&
                      e.description) ||
                    "no description"}
                </Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>{createLabels(e)}</Table.Cell>
          <Table.Cell width={2} textAlign="center">
            <Popup
              disabled={getDependencies(e).length === 0}
              trigger={
                <Button
                  size="mini"
                  content="Tree"
                  disabled={getDependencies(e).length === 0}
                  label={{
                    as: "a",
                    basic: true,
                    pointing: "right",
                    content: getDependencies(e).length,
                  }}
                  labelPosition="left"
                  onClick={() => showDependencyModal(e)}
                />
              }
              header={<h4>Used directly in following workflows:</h4>}
              content={getDependencies(e).usedInWfs.map((wf) => (
                <p>{wf.name}</p>
              ))}
              basic
            />
          </Table.Cell>
          {repeatButtons(e)}
        </Table.Row>
      );
    });
  };

  const showDefinitionModal = (workflow) => {
    setDefModal(!defModal);
    setActiveWf(workflow);
  };

  const showInputModal = (workflow) => {
    setInputModal(!inputModal);
    setActiveWf(workflow);
  };

  const showDiagramModal = (workflow) => {
    setDiagramModal(!diagramModal);
    setActiveWf(workflow);
  };

  const showDependencyModal = (workflow) => {
    setDependencyModal(!dependencyModal);
    setActiveWf(workflow);
  };

  const getDependencies = (workflow) => {
    const usedInWfs = data.filter((wf) => {
      let wfJSON = JSON.stringify(wf, null, 2);
      return (
        wfJSON.includes(`"name": "${workflow.name}"`) &&
        wf.name !== workflow.name
      );
    });
    return { length: usedInWfs.length, usedInWfs };
  };

  const renderDefinitionModal = () => {
    return defModal ? (
      <DefinitionModal
        wf={activeWf}
        modalHandler={showDefinitionModal}
        show={defModal}
      />
    ) : null;
  };

  const renderInputModal = () => {
    return inputModal ? (
      <InputModal
        wf={activeWf}
        modalHandler={showInputModal}
        show={inputModal}
      />
    ) : null;
  };

  const renderDiagramModal = () => {
    return diagramModal ? (
      <DiagramModal
        wf={activeWf}
        modalHandler={showDiagramModal}
        show={diagramModal}
      />
    ) : null;
  };

  const renderDependencyModal = () => {
    return dependencyModal ? (
      <DependencyModal
        wf={activeWf}
        modalHandler={showDependencyModal}
        show={dependencyModal}
        data={data}
      />
    ) : null;
  };

  return (
    <div>
      {renderDefinitionModal()}
      {renderInputModal()}
      {renderDiagramModal()}
      {renderDependencyModal()}
      <Row>
        <Button
          primary
          style={{ margin: "0 0 15px 15px" }}
          onClick={() => searchFavourites()}
          title="Favourites"
          icon={labels.includes("FAVOURITE") ? "star" : "star outline"}
          size="tiny"
        />
        <Col>
          <Typeahead
            id="typeaheadDefs"
            selected={labels}
            onChange={(e) => setLabels(e)}
            clearButton
            labelKey="name"
            multiple
            options={allLabels}
            placeholder="Search by label."
          />
        </Col>
        <Col>
          <Form.Group>
            <Form.Control
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Search by keyword."
            />
          </Form.Group>
        </Col>
      </Row>
      <Table celled compact color="blue">
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell>Name/Version</Table.HeaderCell>
            <Table.HeaderCell>Labels</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Included in</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{filteredRows()}</Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="4">
              <PaginationPages
                totalPages={totalPages}
                currentPage={currentPage}
                changePageHandler={setCurrentPage}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </div>
  );
}

export default withRouter(WorkflowDefs);

