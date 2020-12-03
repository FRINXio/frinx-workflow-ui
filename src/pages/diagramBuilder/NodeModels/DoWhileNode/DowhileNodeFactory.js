// @flow
import * as React from 'react';
import * as SRD from '@projectstorm/react-diagrams';
import { DowhileNode } from './DowhileNode';
import { DowhileNodeModel } from './DowhileNodeModel';

export class DowhileNodeFactory extends SRD.AbstractNodeFactory {
  constructor() {
    super('while');
  }

  generateReactWidget(diagramEngine: SRD.DiagramEngine, node: SRD.NodeModel): JSX.Element {
    return <DowhileNode node={node} diagramEngine={diagramEngine} />;
  }

  getNewInstance() {
    return new DowhileNodeModel();
  }
}
