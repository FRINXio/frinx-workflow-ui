// @flow

import PageCount from '../../../common/PageCount';
import PageSelect from '../../../common/PageSelect';
import React, {useContext, useEffect, useState} from 'react';
import SchedulingModal from './SchedulingModal/SchedulingModal';
import superagent from 'superagent';
import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Row,
  Table,
} from 'react-bootstrap';
import {GlobalContext} from '../../../common/GlobalContext';
import {withRouter} from 'react-router-dom';

const Scheduling = () => {
  const global = useContext(GlobalContext);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [activeRow, setActiveRow] = useState();
  const [pagesCount, setPagesCount] = useState(1);
  const [data, setData] = useState(undefined);
  // TODO: display error
  const [error, setError] = useState(undefined);
  const [defaultPages, setDefaultPages] = useState(20);
  const [viewedPage, setViewedPage] = useState(1);

  const refresh = () => {
    const path = global.backendApiUrlPrefix + '/schedule/';
    const req = superagent.get(path).accept('application/json');
    req.end((err, res) => {
      if (res && res.ok && Array.isArray(res.body)) {
        const result = res.body;
        const dataset =
          result.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          ) || [];
        let size = Math.floor(dataset.length / defaultPages);
        setData(dataset);
        setPagesCount(dataset.length % defaultPages ? ++size : size);
        deselectActiveRow();
      } else {
        console.log('err res', res, 'err', err);
        const newError =
          err != null ? 'Network error: ' + err : 'Wrong response: ' + res;
        setError(newError);
        alert(newError); // TODO
      }
    });
  };

  useEffect(() => {
    // do network request just once
    refresh();
  }, []);

  const deselectActiveRow = () => {
    setActiveRow(null);
  };

  const changeActiveRow = i => {
    console.log('changeActiveRow', i);
    const deselectingCurrentRow = activeRow === i;
    if (deselectingCurrentRow) {
      deselectActiveRow();
    } else {
      setActiveRow(i);
    }
  };

  const setCountPages = (defaultPages, pagesCount) => {
    setDefaultPages(defaultPages);
    setPagesCount(pagesCount);
    setViewedPage(1);
  };

  const deleteEntry = schedulingEntry => {
    const path =
      global.backendApiUrlPrefix + '/schedule/' + schedulingEntry.name;
    const req = superagent.delete(path).accept('application/json');
    req.end((err, res) => {
      if (res && res.ok) {
        deselectActiveRow();
        refresh();
      } else {
        // TODO
        const newError = 'Network error';
        setError(newError);
        alert(newError);
      }
    });
  };

  const flipShowSchedulingModal = () => {
    setShowSchedulingModal(!showSchedulingModal);
  };

  const onModalClose = () => {
    flipShowSchedulingModal();
    refresh();
  };

  const getActiveScheduleName = () => {
    if (activeRow != null && data[activeRow] != null) {
      return data[activeRow]['name'];
    }
    return null;
  };

  const getActiveWorkflowName = () => {
    if (activeRow != null && data[activeRow] != null) {
      return data[activeRow]['workflowName'];
    }
    return null;
  };

  const getActiveWorkflowVersion = () => {
    if (activeRow != null && data[activeRow] != null) {
      return data[activeRow]['workflowVersion'];
    }
    return null;
  };

  const getDataLength = () => {
    if (data != null) {
      return data.length;
    }
    return null;
  };

  const repeat = () => {
    const output = [];
    if (data != null) {
      for (let i = 0; i < data.length; i++) {
        if (
          i >= (viewedPage - 1) * defaultPages &&
          i < viewedPage * defaultPages
        ) {
          output.push(
            <div className="wfRow" key={i}>
              <Accordion.Toggle
                id={`wf${i}`}
                onClick={changeActiveRow.bind(this, i)}
                className="clickable wfDef"
                as={Card.Header}
                variant="link"
                eventKey={i}>
                <b>{data[i]['workflowName']}</b> v.{data[i]['workflowVersion']}
                <br />
                <div className="description">{data[i]['cronString']}</div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={i}>
                <Card.Body style={{padding: '0px'}}>
                  <div
                    style={{
                      background:
                        'linear-gradient(-120deg, rgb(0, 147, 255) 0%, rgb(0, 118, 203) 100%)',
                      padding: '15px',
                      marginBottom: '10px',
                    }}>
                    <Button
                      variant="outline-light noshadow"
                      onClick={flipShowSchedulingModal}>
                      Edit
                    </Button>

                    <Button
                      variant="outline-danger noshadow"
                      style={{float: 'right'}}
                      onClick={deleteEntry.bind(this, data[i])}>
                      <i className="fas fa-trash-alt" />
                    </Button>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </div>,
          );
        }
      }
    }
    return output;
  };

  return (
    <div>
      <SchedulingModal
        name={getActiveScheduleName()}
        workflowName={getActiveWorkflowName()}
        workflowVersion={getActiveWorkflowVersion()}
        onClose={onModalClose}
        show={showSchedulingModal}
      />
      <Button
        variant="outline-primary"
        style={{marginLeft: '30px'}}
        onClick={() => refresh()}>
        <i className="fas fa-sync" />
        &nbsp;&nbsp;Refresh
      </Button>

      <div className="scrollWrapper" style={{maxHeight: '650px'}}>
        <Table>
          <thead>
            <tr>
              <th>Name/Cron</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding: '0'}}>
                <Accordion activeKey={activeRow}>{repeat()}</Accordion>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
      <Container style={{marginTop: '5px'}}>
        <Row>
          <Col sm={2}>
            <PageCount
              dataSize={getDataLength()}
              defaultPages={defaultPages}
              handler={setCountPages.bind(this)}
            />
          </Col>
          <Col sm={8} />
          <Col sm={2}>
            <PageSelect
              viewedPage={viewedPage}
              count={pagesCount}
              handler={setViewedPage}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default withRouter(Scheduling);
