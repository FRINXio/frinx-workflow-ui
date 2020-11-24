// @flow
import * as React from 'react';
import * as SRD from '@projectstorm/react-diagrams';
import DynamicNode from './DynamicNode';
import { DynamicNodeModel } from './DynamicNodeModel';

export class DynamicNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('dynamic');
  }

  generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
    return <DynamicNode node={node} diagramEngine={diagramEngine} />;
  }

  getNewInstance() {
    return new DynamicNodeModel();
  }
}
