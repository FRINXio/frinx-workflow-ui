// @flow
import * as React from 'react';
import * as SRD from '@projectstorm/react-diagrams';
import { JoinNode } from './JoinNode';
import { JoinNodeModel } from './JoinNodeModel';

export class JoinNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('join');
  }

  generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
    return <JoinNode node={node} diagramEngine={diagramEngine} />;
  }

  getNewInstance() {
    return new JoinNodeModel();
  }
}
