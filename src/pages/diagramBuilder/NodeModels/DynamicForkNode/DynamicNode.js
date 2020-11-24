// @flow
import React from 'react';
import { NodeContextMenu, NodeMenuProvider } from '../ContextMenu';
import { PortWidget } from '@projectstorm/react-diagrams';
import './DynamicNode.css';

function DynamicNode(props) {
  return (
    <NodeMenuProvider node={props.node}>
      <div className="dynamicNode-shape">
        <span className="dynamicNode-title">Dynamic fork</span>
      </div>
      <div className="dynamicNode-meta">
        {props.node?.extras?.inputs?.inputParameters?.expectedName}
        <br />
        {props.node?.extras?.inputs?.inputParameters?.expectedType}
      </div>
      <div
        className="srd-node-glow"
        style={{
          position: 'absolute',
          zIndex: -1,
          left: 45,
          top: 30,
        }}
      />
      <div className="dynamicNode-portLeft">
        <PortWidget name="left" node={props.node} />
      </div>
      <div className="dynamicNode-portRight">
        <PortWidget name="right" node={props.node} />
      </div>
      <NodeContextMenu node={props.node} diagramEngine={props.diagramEngine} />
    </NodeMenuProvider>
  );
}

export default DynamicNode;
