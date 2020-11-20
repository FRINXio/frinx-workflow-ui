// @flow
import * as SRD from '@projectstorm/react-diagrams';
import { SimplePortFactory } from './NodeModels/SimplePortFactory';
import { LinkWithContextFactory } from './NodeModels/LinkWithContextFactory';
import { NodeWithContextFactory } from './NodeModels/NodeWithContextFactory';
import { CircleStartPortModel } from './NodeModels/StartNode/CircleStartPortModel';
import { CircleStartNodeFactory } from './NodeModels/StartNode/CircleStartNodeFactory';
import { CircleEndPortModel } from './NodeModels/EndNode/CircleEndPortModel';
import { CircleEndNodeFactory } from './NodeModels/EndNode/CircleEndNodeFactory';
import { ForkNodeFactory } from './NodeModels/ForkNode/ForkNodeFactory';
import { ForkNodePortModel } from './NodeModels/ForkNode/ForkNodePortModel';
import { JoinNodePortModel } from './NodeModels/JoinNode/JoinNodePortModel';
import { JoinNodeFactory } from './NodeModels/JoinNode/JoinNodeFactory';
import { DecisionNodePortModel } from './NodeModels/DecisionNode/DecisionNodePortModel';
import { DecisionNodeFactory } from './NodeModels/DecisionNode/DecisionNodeFactory';
import { DynamicNodePortModel } from './NodeModels/DynamicForkNode/DynamicNodePortModel';
import { DynamicNodeFactory } from './NodeModels/DynamicForkNode/DynamicNodeFactory';
import { DowhileNodeFactory } from './NodeModels/DoWhileNode/DowhileNodeFactory';

import { DefaultLabelFactory } from '@projectstorm/react-diagrams';
import { DefaultPortModel } from './NodeModels/DefaultNodeModel/DefaultPortModel';
import { DowhileNodePortModel } from './NodeModels/DoWhileNode/DowhileNodePortModel';
import { DowhileEndNodeFactory } from './NodeModels/DoWhileEndNode/DowhileEndNodeFactory';
import { DowhileEndNodePortModel } from './NodeModels/DoWhileEndNode/DowhileEndNodePortModel';

export class Application {
  activeModel;
  diagramEngine;

  constructor() {
    this.diagramEngine = new SRD.DiagramEngine();

    this.diagramEngine.registerLinkFactory(new LinkWithContextFactory());
    this.diagramEngine.registerLabelFactory(new DefaultLabelFactory());

    this.diagramEngine.registerPortFactory(new SimplePortFactory('default', config => new DefaultPortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('start', config => new CircleStartPortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('end', config => new CircleEndPortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('fork', config => new ForkNodePortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('join', config => new JoinNodePortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('decision', config => new DecisionNodePortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('dynamic', config => new DynamicNodePortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('while', config => new DowhileNodePortModel()));
    this.diagramEngine.registerPortFactory(new SimplePortFactory('while_end', config => new DowhileEndNodePortModel()));

    this.diagramEngine.registerNodeFactory(new NodeWithContextFactory());
    this.diagramEngine.registerNodeFactory(new CircleStartNodeFactory());
    this.diagramEngine.registerNodeFactory(new CircleEndNodeFactory());
    this.diagramEngine.registerNodeFactory(new ForkNodeFactory());
    this.diagramEngine.registerNodeFactory(new DowhileNodeFactory());
    this.diagramEngine.registerNodeFactory(new DowhileEndNodeFactory());
    this.diagramEngine.registerNodeFactory(new JoinNodeFactory());
    this.diagramEngine.registerNodeFactory(new DecisionNodeFactory());
    this.diagramEngine.registerNodeFactory(new DynamicNodeFactory());
  }

  getActiveDiagram() {
    return this.activeModel;
  }

  getDiagramEngine() {
    return this.diagramEngine;
  }
}
