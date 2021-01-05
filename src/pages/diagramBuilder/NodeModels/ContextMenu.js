// @flow
import 'react-contexify/dist/ReactContexify.min.css';
import * as React from 'react';
import { GlobalContext } from '../../../common/GlobalContext';
import { Icon } from 'semantic-ui-react';
import { Item, Menu, MenuProvider, Separator } from 'react-contexify';
import { useContext } from 'react';

function getSubworkflowName(inputs) {
  if (inputs == null) {
    return null;
  }
  return inputs.type === 'SUB_WORKFLOW' ? inputs.name : null;
}

export const NodeContextMenu = props => {
  const global = useContext(GlobalContext);

  const taskRefName = props.node?.extras?.inputs?.taskReferenceName || '<no ref name>';
  const subwfName = getSubworkflowName(props.node?.extras?.inputs);

  const deleteNode = (node, diagramEngine) => {
    node.remove();
    diagramEngine.getDiagramModel().removeNode(node);
    diagramEngine.repaintCanvas();
  };

  const handleDelete = () => {
    deleteNode(props.node, props.diagramEngine);
  };

  const openSubworkflow = () => {
    // version is hardcoded to 1 since there is no version param in node
    window.open(`${global.frontendUrlPrefix}/builder/${subwfName}/1`);
  };

  return (
    <Menu id={props.node.id}>
      <Item disabled={true}>{taskRefName}</Item>
      <Separator />
      <Item onClick={handleDelete}>
        <Icon name="trash" />
        Delete
      </Item>
      {subwfName && (
        <Item onClick={openSubworkflow}>
          <Icon name="external alternate" />
          Open sub-workflow
        </Item>
      )}
    </Menu>
  );
};

export const NodeMenuProvider = props => {
  return <MenuProvider id={props.node.id}>{props.children}</MenuProvider>;
};

export const LinkContextMenu = props => {
  const deleteLink = (link, diagramEngine) => {
    link.remove();
    diagramEngine.getDiagramModel().removeLink(link);
    diagramEngine.repaintCanvas();
  };

  const handleDelete = () => {
    deleteLink(props.link, props.diagramEngine);
  };

  return (
    <Menu id={props.link.id} event="onContextMenu" storeRef={false}>
      <Item onClick={handleDelete}>
        <Icon name="trash" />
        Delete
      </Item>
    </Menu>
  );
};

export const LinkMenuProvider = props => {
  return (
    <MenuProvider id={props.link.id} component="g" event="onContextMenu" storeRef={false}>
      {props.children}
    </MenuProvider>
  );
};
