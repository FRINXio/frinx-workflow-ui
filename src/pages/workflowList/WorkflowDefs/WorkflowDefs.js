// @flow
import React, { Component } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Table, Header, Button, Label, Popup } from "semantic-ui-react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { withRouter } from "react-router-dom";
import PageCount from "../../../common/PageCount";
import PageSelect from "../../../common/PageSelect";
import WfLabels from "../../../common/WfLabels";
import DefinitionModal from "./DefinitonModal/DefinitionModal";
import DiagramModal from "./DiagramModal/DiagramModal";
import InputModal from "./InputModal/InputModal";
import DependencyModal from "./DependencyModal/DependencyModal";
import { HttpClient as http } from "../../../common/HttpClient";
import { conductorApiUrlPrefix, frontendUrlPrefix } from "../../../constants";

class WorkflowDefs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: "",
      labels: [],
      data: [],
      table: [],
      activeWf: null,
      defModal: false,
      diagramModal: false,
      inputModal: false,
      dependencyModal: false,
      defaultPages: 10,
      pagesCount: 1,
      viewedPage: 1,
      allLabels: [],
    };
    this.onEditSearch = this.onEditSearch.bind(this);
  }

  componentWillMount() {
    this.search();
  }

  componentDidMount() {
    http.get(conductorApiUrlPrefix + "/metadata/workflow").then((res) => {
      if (res.result) {
        let size = ~~(res.result.length / this.state.defaultPages);
        let dataset =
          res.result.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          ) || [];
        let allLabels = this.getLabels(dataset);
        this.setState({
          data: dataset,
          pagesCount:
            res.result.length % this.state.defaultPages ? ++size : size,
          allLabels: allLabels,
        });
      }
    });
  }

  getLabels(dataset) {
    let labelsArr = [];
    dataset.map(({ description }) => {
      let str =
        description && description.match(/-(,|) [A-Z].*/g)
          ? description.substring(description.indexOf("-") + 1)
          : "";
      if (str !== "") {
        str = str.replace(/\s/g, "");
        labelsArr = labelsArr.concat(str.split(","));
      }
      return null;
    });
    let allLabels = [...new Set([].concat(...labelsArr))];
    return allLabels
      .filter((e) => {
        return e !== "";
      })
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
  }

  onEditSearch(event) {
    this.setState(
      {
        keywords: event.target.value,
      },
      () => {
        this.search();
      }
    );
  }

  onLabelSearch(event) {
    this.setState(
      {
        labels: event,
      },
      () => {
        this.searchLabel();
      }
    );
  }

  searchLabel() {
    let toBeRendered = [];
    if (this.state.labels.length) {
      const rows =
        this.state.keywords !== "" ? this.state.table : this.state.data;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]["description"]) {
          let tags = rows[i]["description"]
            .split("-")
            .pop()
            .replace(/\s/g, "")
            .split(",");
          if (this.state.labels.every((elem) => tags.indexOf(elem) > -1)) {
            toBeRendered.push(rows[i]);
          }
        }
      }
    } else {
      toBeRendered = this.state.data;
    }
    let size = ~~(toBeRendered.length / this.state.defaultPages);
    this.setState({
      table: toBeRendered,
      pagesCount: toBeRendered.length % this.state.defaultPages ? ++size : size,
      viewedPage: 1,
    });
    return null;
  }

  searchFavourites() {
    let labels = this.state.labels;
    let index = labels.findIndex((label) => label === "FAVOURITE");
    index > -1 ? labels.splice(index, 1) : labels.push("FAVOURITE");
    this.setState(
      {
        labels: labels,
      },
      () => {
        this.searchLabel();
      }
    );
  }

  search() {
    let toBeRendered = [];

    let query = this.state.keywords.toUpperCase();
    if (query !== "") {
      let rows =
        this.state.table.length > 0 ? this.state.table : this.state.data;
      let queryWords = query.split(" ");
      for (let i = 0; i < queryWords.length; i++) {
        for (let j = 0; j < rows.length; j++)
          if (
            rows[j]["name"] &&
            rows[j]["name"]
              .toString()
              .toUpperCase()
              .indexOf(queryWords[i]) !== -1
          )
            toBeRendered.push(rows[j]);
        rows = toBeRendered;
        toBeRendered = [];
      }
      toBeRendered = rows;
    } else {
      this.searchLabel();
      return;
    }
    let size = ~~(toBeRendered.length / this.state.defaultPages);
    this.setState({
      table: toBeRendered,
      pagesCount: toBeRendered.length % this.state.defaultPages ? ++size : size,
      viewedPage: 1,
    });
  }

  updateFavourite(data) {
    if (data.description) {
      if (!data.description.match(/-(| )[A-Z]*/g)) data.description += " -";
      if (data.description.includes("FAVOURITE")) {
        let labelIndex = data.description.indexOf("FAVOURITE");
        data.description = data.description.replace("FAVOURITE", "");
        if (data.description[labelIndex - 1] === ",")
          data.description =
            data.description.substring(0, labelIndex - 1) +
            data.description.substring(labelIndex, data.description.length);
        if (data.description.match(/^(| )-(| )$/g)) delete data.description;
      } else {
        data.description.match(/.*[A-Za-z0-9]$/g)
          ? (data.description += ",FAVOURITE")
          : (data.description += "FAVOURITE");
      }
    } else {
      data.description = "- FAVOURITE";
    }
    http.put(conductorApiUrlPrefix + "/metadata/", [data]).then(() => {
      http.get(conductorApiUrlPrefix + "/metadata/workflow").then((res) => {
        let dataset =
          res.result.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          ) || [];
        let allLabels = this.getLabels(dataset);
        this.setState({
          data: dataset,
          allLabels: allLabels,
        });
      });
    });
  }

  setCountPages(defaultPages, pagesCount) {
    this.setState({
      defaultPages: defaultPages,
      pagesCount: pagesCount,
      viewedPage: 1,
    });
  }

  setViewPage(page) {
    this.setState({
      viewedPage: page,
    });
  }

  createLabels = ({ name, description }) => {
    let labels = [];
    let str =
      description && description.match(/-(,|) [A-Z].*/g)
        ? description.substring(description.indexOf("-") + 1)
        : "";
    let wfLabels = str.replace(/\s/g, "").split(",");
    wfLabels.forEach((label, i) => {
      if (label !== "") {
        let index = this.state.allLabels.findIndex((lab) => lab === label);
        let newLabels =
          this.state.labels.findIndex((lbl) => lbl === label) < 0
            ? [...this.state.labels, label]
            : this.state.labels;
        labels.push(
          <WfLabels
            key={`${name}-${i}`}
            label={label}
            index={index}
            search={this.onLabelSearch.bind(this, newLabels)}
          />
        );
      }
    });
    return labels;
  };

  deleteWorkflow(workflow) {
    http
      .delete(
        conductorApiUrlPrefix +
          "/metadata/workflow/" +
          workflow.name +
          "/" +
          workflow.version
      )
      .then(() => {
        this.componentDidMount();
        let table = this.state.table;
        if (table.length) {
          table.splice(table.findIndex((wf) => wf.name === workflow.name), 1);
        }
        this.setState({
          table: table,
        });
      });
  }

  repeat() {
    let output = [];
    let defaultPages = this.state.defaultPages;
    let viewedPage = this.state.viewedPage;
    let dataset =
      this.state.keywords === "" && this.state.labels.length < 1
        ? this.state.data
        : this.state.table;
    for (let i = 0; i < dataset.length; i++) {
      if (
        i >= (viewedPage - 1) * defaultPages &&
        i < viewedPage * defaultPages
      ) {
        output.push(
          <Table.Row>
            <Table.Cell>
              <Header as="h4">
                <Header.Content>
                  {dataset[i].name} / {dataset[i].version}
                  <Header.Subheader>
                    {dataset[i]?.description?.split("-")[0] || "no description"}
                  </Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>{this.createLabels(dataset[i])}</Table.Cell>
            <Table.Cell width={2} textAlign="center">
              <Popup
                disabled={this.getDependencies(dataset[i]).length === 0}
                trigger={
                  <Button
                    size="mini"
                    content="Tree"
                    disabled={this.getDependencies(dataset[i]).length === 0}
                    label={{
                      as: "a",
                      basic: true,
                      pointing: "right",
                      content: this.getDependencies(dataset[i]).length,
                    }}
                    labelPosition="left"
                    onClick={this.showDependencyModal.bind(this, dataset[i])}
                  />
                }
                header={<h4>Used directly in following workflows:</h4>}
                content={this.getDependencies(dataset[i]).usedInWfs.map(
                  (wf) => (
                    <p>{wf.name}</p>
                  )
                )}
                basic
              />
            </Table.Cell>
            <Table.Cell singleLine textAlign="center">
              <Button
                title="Delete"
                basic
                negative
                circular
                icon="trash"
                onClick={this.deleteWorkflow.bind(this, dataset[i])}
              />
              <Button
                title="Favourite"
                basic
                circular
                icon={
                  dataset[i]?.description?.includes("FAVOURITE")
                    ? "star"
                    : "star outline"
                }
                onClick={this.updateFavourite.bind(this, dataset[i])}
              />
              <Button
                title="Diagram"
                basic
                circular
                icon="fork"
                onClick={this.showDiagramModal.bind(this, dataset[i])}
              />
              <Button
                title="Definition"
                basic
                circular
                icon="file code"
                onClick={this.showDefinitionModal.bind(this, dataset[i])}
              />
              <Button
                title="Edit"
                basic
                circular
                icon="edit"
                onClick={() =>
                  this.props.history.push(
                    `${frontendUrlPrefix}/builder/${dataset[i].name}/${dataset[i].version}`
                  )
                }
              />
              <Button
                title="Execute"
                id={`executeBtn-${dataset[i].name}`}
                primary
                circular
                icon="play"
                onClick={this.showInputModal.bind(this, dataset[i])}
              />
            </Table.Cell>
          </Table.Row>
        );
      }
    }
    return output;
  }

  showDefinitionModal(workflow) {
    this.setState({
      defModal: !this.state.defModal,
      activeWf: workflow,
    });
  }

  showInputModal(workflow) {
    this.setState({
      inputModal: !this.state.inputModal,
      activeWf: workflow,
    });
  }

  showDiagramModal(workflow) {
    this.setState({
      diagramModal: !this.state.diagramModal,
      activeWf: workflow,
    });
  }

  showDependencyModal(workflow) {
    this.setState({
      dependencyModal: !this.state.dependencyModal,
      activeWf: workflow,
    });
  }

  getDependencies(workflow) {
    const usedInWfs = this.state.data.filter((wf) => {
      let wfJSON = JSON.stringify(wf, null, 2);
      return wfJSON.includes(workflow.name) && wf.name !== workflow.name;
    });
    return { length: usedInWfs.length, usedInWfs };
  }

  render() {
    let definitionModal = this.state.defModal ? (
      <DefinitionModal
        wf={this.state.activeWf}
        modalHandler={this.showDefinitionModal.bind(this)}
        show={this.state.defModal}
      />
    ) : null;

    let inputModal = this.state.inputModal ? (
      <InputModal
        wf={this.state.activeWf}
        modalHandler={this.showInputModal.bind(this)}
        show={this.state.inputModal}
      />
    ) : null;

    let diagramModal = this.state.diagramModal ? (
      <DiagramModal
        wf={this.state.activeWf}
        modalHandler={this.showDiagramModal.bind(this)}
        show={this.state.diagramModal}
      />
    ) : null;

    let dependencyModal = this.state.dependencyModal ? (
      <DependencyModal
        wf={this.state.activeWf}
        modalHandler={this.showDependencyModal.bind(this)}
        show={this.state.dependencyModal}
        data={this.state.data}
      />
    ) : null;

    return (
      <div>
        {definitionModal}
        {inputModal}
        {diagramModal}
        {dependencyModal}
        <Row>
          <Button
            primary
            style={{ margin: "0 0 15px 15px" }}
            onClick={this.searchFavourites.bind(this)}
            title="Favourites"
            icon={
              this.state.labels.includes("FAVOURITE") ? "star" : "star outline"
            }
            size="tiny"
          />
          <Col>
            <Typeahead
              id="typeaheadDefs"
              selected={this.state.labels}
              onChange={this.onLabelSearch.bind(this)}
              clearButton
              labelKey="name"
              multiple
              options={this.state.allLabels}
              placeholder="Search by label."
            />
          </Col>
          <Col>
            <Form.Group>
              <Form.Control
                value={this.state.keywords}
                onChange={this.onEditSearch}
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
              <Table.HeaderCell textAlign="center">
                Included in
              </Table.HeaderCell>
              <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.repeat()}</Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="4">
                <PageCount
                  dataSize={
                    this.state.keywords === "" || this.state.table.length > 0
                      ? this.state.table.length
                      : this.state.data.length
                  }
                  defaultPages={this.state.defaultPages}
                  handler={this.setCountPages.bind(this)}
                />
                <PageSelect
                  viewedPage={this.state.viewedPage}
                  count={this.state.pagesCount}
                  handler={this.setViewPage.bind(this)}
                />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    );
  }
}

export default withRouter(WorkflowDefs);
