// @flow
import * as React from 'react';
import * as SRD from '@projectstorm/react-diagrams';
import { DowhileEndNode } from './DowhileEndNode';
import { DowhileEndNodeModel } from './DowhileEndNodeModel';

export class DowhileEndNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('while_end');
  }

  generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
    return <DowhileEndNode node={node} diagramEngine={diagramEngine} />;
  }

  getNewInstance() {
    return new DowhileEndNodeModel();
  }
}
