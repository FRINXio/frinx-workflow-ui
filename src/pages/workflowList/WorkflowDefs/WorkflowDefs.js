// @flow
import React, { Component } from "react";
import { Col, Form, Row, Modal } from "react-bootstrap";
import { Table, Header, Button, Popup } from "semantic-ui-react";
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
import SchedulingModal from "../Scheduling/SchedulingModal/SchedulingModal";
import { HttpClient as http } from "../../../common/HttpClient";

export class WorkflowDefs extends Component {
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
      schedulingModal: false,
      confirmDeleteModal: false,
      defaultPages: 10,
      pagesCount: 1,
      viewedPage: 1,
      allLabels: [],
    };
    this.onEditSearch = this.onEditSearch.bind(this);
    this.backendApiUrlPrefix = props.backendApiUrlPrefix;
    this.frontendUrlPrefix = props.frontendUrlPrefix;
    this.enableScheduling = props.enableScheduling;
  }

  componentWillMount() {
    this.search();
  }

  componentDidMount() {
    http.get(this.backendApiUrlPrefix + "/metadata/workflow").then((res) => {
      if (res.result) {
        let size = ~~(res.result.length / this.state.defaultPages);
        let dataset =
          res.result.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          ) || [];
        this.setState({
          data: dataset,
          pagesCount:
            res.result.length % this.state.defaultPages ? ++size : size,
          allLabels: this.getLabels(dataset),
        });
      }
    });
  }

  getLabels(dataset) {
    let labelsArr = dataset.map(({ description }) => {
      return this.jsonParse(description)?.labels;
    });
    let allLabels = [...new Set([].concat(...labelsArr))];
    return allLabels
      .filter((e) => {
        return e !== undefined;
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
        const labels = this.jsonParse(rows[i].description)?.labels;
        if (labels) {
          if (this.state.labels.every((elem) => labels.indexOf(elem) > -1)) {
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

  updateFavourite(workflow) {
    var wfDescription = this.jsonParse(workflow.description);

    // if workflow doesn't contain description attr. at all
    if (!wfDescription) {
      wfDescription = {
        description: "",
        labels: ["FAVOURITE"],
      };
    }
    // if workflow has only description but no labels array
    else if (wfDescription && !wfDescription.labels) {
      wfDescription = {
        ...wfDescription,
        labels: ["FAVOURITE"],
      };
    }
    // if workflow is already favourited (unfav.)
    else if (wfDescription.labels.includes("FAVOURITE")) {
      wfDescription.labels = wfDescription?.labels.filter(
        (e) => e !== "FAVOURITE"
      );
    }
    // if workflow has correct description object, just add label
    else {
      wfDescription.labels.push("FAVOURITE");
    }

    workflow.description = JSON.stringify(wfDescription);

    http.put(this.backendApiUrlPrefix + "/metadata/", [workflow]).then(() => {
      http.get(this.backendApiUrlPrefix + "/metadata/workflow").then((res) => {
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
    const labels = this.jsonParse(description)?.labels || [];

    return labels.map((label, i) => {
      let index = this.state.allLabels.findIndex((lab) => lab === label);
      let newLabels =
        this.state.labels.findIndex((lbl) => lbl === label) < 0
          ? [...this.state.labels, label]
          : this.state.labels;
      return (
        <WfLabels
          key={`${name}-${i}`}
          label={label}
          index={index}
          search={this.onLabelSearch.bind(this, newLabels)}
        />
      );
    });
  };

  jsonParse(json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  deleteWorkflow(workflow) {
    http
      .delete(
        this.backendApiUrlPrefix +
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
          confirmDeleteModal: false,
        });
      });
  }

  repeatEditButton(dataset) {
    return (
      <Button
        title="Edit"
        basic
        circular
        icon="edit"
        onClick={() =>
          this.props.history.push(
            `${this.frontendUrlPrefix}/builder/${dataset.name}/${dataset.version}`
          )
        }
      />
    );
  }

  repeatFavouriteButton(dataset) {
    return (
      <Button
        title="Favourite"
        basic
        circular
        icon={
          this.jsonParse(dataset?.description)?.labels?.includes("FAVOURITE")
            ? "star"
            : "star outline"
        }
        onClick={this.updateFavourite.bind(this, dataset)}
      />
    );
  }

  repeatExecuteButton(dataset) {
    return (
      <Button
        title="Execute"
        id={`executeBtn-${dataset.name}`}
        primary
        circular
        icon="play"
        onClick={this.showInputModal.bind(this, dataset)}
      />
    );
  }

  repeatDeleteButton(dataset) {
    return (
      <Button
        title="Delete"
        basic
        negative
        circular
        icon="trash"
        onClick={this.showConfirmDeleteModal.bind(this, dataset)}
      />
    );
  }

  repeatScheduleButton(dataset) {
    return (
      <Button
        title={dataset.hasSchedule ? "Edit schedule" : "Create schedule"}
        basic
        circular
        icon="clock"
        disabled={!this.enableScheduling}
        onClick={this.showSchedulingModal.bind(this, dataset)}
      />
    );
  }

  repeatButtons(dataset) {
    return (
      <Table.Cell singleLine textAlign="center">
        {this.repeatDeleteButton(dataset)}
        {this.repeatFavouriteButton(dataset)}
        <Button
          title="Diagram"
          basic
          circular
          icon="fork"
          onClick={this.showDiagramModal.bind(this, dataset)}
        />
        <Button
          title="Definition"
          basic
          circular
          icon="file code"
          onClick={this.showDefinitionModal.bind(this, dataset)}
        />
        {this.repeatEditButton(dataset)}
        {this.repeatScheduleButton(dataset)}
        {this.repeatExecuteButton(dataset)}
      </Table.Cell>
    );
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
                    {this.jsonParse(dataset[i].description)?.description ||
                      (this.jsonParse(dataset[i].description)?.description !==
                        "" &&
                        dataset[i].description) ||
                      "no description"}
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
            {this.repeatButtons(dataset[i])}
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

  onSchedulingModalClose() {
    this.setState({
      schedulingModal: false,
    });
    this.componentDidMount();
  }

  showSchedulingModal(workflow) {
    this.setState({
      schedulingModal: !this.state.schedulingModal,
      activeWf: workflow,
    });
  }

  showDependencyModal(workflow) {
    this.setState({
      dependencyModal: !this.state.dependencyModal,
      activeWf: workflow,
    });
  }

  showConfirmDeleteModal(workflow) {
    this.setState({
      confirmDeleteModal: !this.state.confirmDeleteModal,
      activeWf: workflow,
    });
  }

  getActiveWfScheduleName() {
    if (
      this.state.activeWf != null &&
      this.state.activeWf.expectedScheduleName != null
    ) {
      return this.state.activeWf.expectedScheduleName;
    }
    return null;
  }

  getDependencies(workflow) {
    const usedInWfs = this.state.data.filter((wf) => {
      let wfJSON = JSON.stringify(wf, null, 2);
      return (
        wfJSON.includes(`"name": "${workflow.name}"`) &&
        wf.name !== workflow.name
      );
    });
    return { length: usedInWfs.length, usedInWfs };
  }

  renderDefinitionModal() {
    return this.state.defModal ? (
      <DefinitionModal
        wf={this.state.activeWf}
        modalHandler={this.showDefinitionModal.bind(this)}
        show={this.state.defModal}
        backendApiUrlPrefix={this.backendApiUrlPrefix}
      />
    ) : null;
  }

  renderInputModal() {
    return this.state.inputModal ? (
      <InputModal
        wf={this.state.activeWf}
        modalHandler={this.showInputModal.bind(this)}
        show={this.state.inputModal}
        backendApiUrlPrefix={this.backendApiUrlPrefix}
        frontendUrlPrefix={this.frontendUrlPrefix}
      />
    ) : null;
  }

  renderDiagramModal() {
    return this.state.diagramModal ? (
      <DiagramModal
        wf={this.state.activeWf}
        modalHandler={this.showDiagramModal.bind(this)}
        show={this.state.diagramModal}
        backendApiUrlPrefix={this.backendApiUrlPrefix}
      />
    ) : null;
  }

  renderSchedulingModal() {
    return (
      <SchedulingModal
        name={this.getActiveWfScheduleName()}
        workflowName={this.state.activeWf?.name}
        workflowVersion={this.state.activeWf?.version}
        onClose={this.onSchedulingModalClose.bind(this)}
        show={this.state.schedulingModal}
        backendApiUrlPrefix={this.backendApiUrlPrefix}
      />
    );
  }

  renderDependencyModal() {
    return this.state.dependencyModal ? (
      <DependencyModal
        wf={this.state.activeWf}
        modalHandler={this.showDependencyModal.bind(this)}
        show={this.state.dependencyModal}
        data={this.state.data}
        backendApiUrlPrefix={this.backendApiUrlPrefix}
        frontendUrlPrefix={this.frontendUrlPrefix}
      />
    ) : null;
  }

  renderConfirmDeleteModal() {
    return this.state.confirmDeleteModal ? (
      <Modal
        size="mini"
        show={this.state.confirmDeleteModal}
        onHide={this.showConfirmDeleteModal.bind(this)}
      >
        <Modal.Header>
          <Modal.Title>Delete Workflow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Do you want to delete workflow <b>{this.state.activeWf.name}</b> ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            content="Delete"
            negative
            icon="trash"
            onClick={this.deleteWorkflow.bind(this, this.state.activeWf)}
          />
          <Button
            content="Cancel"
            onClick={this.showConfirmDeleteModal.bind(this)}
          />
        </Modal.Footer>
      </Modal>
    ) : null;
  }

  renderFavouritesHeader() {
    return (
      <Button
        primary
        style={{ margin: "0 0 15px 15px" }}
        onClick={this.searchFavourites.bind(this)}
        title="Favourites"
        icon={this.state.labels.includes("FAVOURITE") ? "star" : "star outline"}
        size="tiny"
      />
    );
  }

  renderSearchByLabel() {
    return (
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
    );
  }

  renderSearchByKeyword() {
    return (
      <Col>
        <Form.Group>
          <Form.Control
            value={this.state.keywords}
            onChange={this.onEditSearch}
            placeholder="Search by keyword."
          />
        </Form.Group>
      </Col>
    );
  }

  renderWorkflowTable() {
    return (
      <Table celled compact color="blue">
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell>Name/Version</Table.HeaderCell>
            <Table.HeaderCell>Labels</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Included in</Table.HeaderCell>
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
    );
  }

  render() {
    return (
      <div>
        {this.renderDefinitionModal()}
        {this.renderInputModal()}
        {this.renderDiagramModal()}
        {this.renderDependencyModal()}
        {this.renderSchedulingModal()}
        {this.renderConfirmDeleteModal()}
        <Row>
          {this.renderFavouritesHeader()}
          {this.renderSearchByLabel()}
          {this.renderSearchByKeyword()}
        </Row>
        {this.renderWorkflowTable()}
      </div>
    );
  }
}

export default withRouter(WorkflowDefs);
