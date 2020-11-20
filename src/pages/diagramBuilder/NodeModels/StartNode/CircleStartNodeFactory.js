// @flow
import * as React from 'react';
import * as SRD from '@projectstorm/react-diagrams';
import { CircleNodeStart } from './CircleNodeStart';
import { CircleStartNodeModel } from './CircleStartNodeModel';

export class CircleStartNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('start');
  }

  generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
    return <CircleNodeStart node={node} diagramEngine={diagramEngine} />;
  }

  getNewInstance() {
    return new CircleStartNodeModel();
  }
}
