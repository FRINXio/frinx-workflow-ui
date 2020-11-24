// @flow
import React, { useContext } from 'react';
import { Button } from 'semantic-ui-react';
import { Modal } from 'react-bootstrap';
import { Tree, TreeNode } from 'react-organizational-chart';
import { withRouter } from 'react-router-dom';
import './DependencyModal.css';
import { GlobalContext } from '../../../../common/GlobalContext';

const DependencyModal = props => {
  const global = useContext(GlobalContext);

  const createDepTree = rootWorkflow => {
    let tree = [];
    let parents = getWorkflowParents(rootWorkflow);
    let rootNode = {
      workflow: rootWorkflow,
      parents,
    };
    tree.push(rootNode);

    let parentStack = [tree[0].parents];
    let currentParents = [];

    while (parentStack.length > 0) {
      currentParents = parentStack.pop();
      currentParents.forEach((wf, i) => {
        let parentsTmp = getWorkflowParents(wf);
        let node = {
          workflow: wf,
          parents: parentsTmp || [],
        };
        currentParents[i] = node;
        parentStack.push(parentsTmp);
      });
    }
    return tree;
  };

  const getWorkflowParents = workflow => {
    const usedInWfs = props.data.filter(wf => {
      let wfJSON = JSON.stringify(wf, null, 2);
      let wfMatch = `"name": "${workflow.name}"`;
      let wfMatchDF = `"expectedName": "${workflow.name}"`;
      return (wfJSON.includes(wfMatch) || wfJSON.includes(wfMatchDF)) && wf.name !== workflow.name;
    });
    return usedInWfs;
  };

  const nestBranch = wf => {
    return wf.parents.map(p => {
      return (
        <TreeNode
          label={
            <div
              className="tree-node"
              title="Edit"
              onClick={() =>
                props.history.push(`${global.frontendUrlPrefix}/builder/${p.workflow.name}/${p.workflow.version}`)
              }
            >
              {p.workflow.name + ' / ' + p.workflow.version}
            </div>
          }
        >
          {nestBranch(p)}
        </TreeNode>
      );
    });
  };

  const DependencyTree = () => {
    return createDepTree(props.wf).map(wf => {
      return (
        <Tree
          label={
            <div
              className="root-node tree-node"
              title="Edit"
              onClick={() =>
                props.history.push(`${global.frontendUrlPrefix}/builder/${wf.workflow.name}/${wf.workflow.version}`)
              }
            >
              {wf.workflow.name + ' / ' + wf.workflow.version}
            </div>
          }
        >
          {nestBranch(wf)}
        </Tree>
      );
    });
  };

  return (
    <Modal size="xl" show={props.show} onHide={props.modalHandler}>
      <Modal.Header>
        <Modal.Title>Workflow Dependency Tree</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflowX: 'scroll' }}>{DependencyTree()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.modalHandler}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default withRouter(DependencyModal);
