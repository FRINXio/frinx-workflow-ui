// @flow
import * as _ from 'lodash';
import { DynamicNodePortModel } from './DynamicNodePortModel';
import { DiagramEngine, Toolkit } from '@projectstorm/react-diagrams';
import { NodeModel } from '@projectstorm/react-diagrams';

export class DynamicNodeModel extends NodeModel {
  name: string;
  color: string;
  inputs: {};

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)', inputs: {}) {
    super('dynamic');
    this.name = name;
    this.color = color;
    super.extras = { inputs: inputs };

    this.addPort(new DynamicNodePortModel(true, 'left', 'In'));
    this.addPort(new DynamicNodePortModel(false, 'right', 'Out'));
  }

  deSerialize(object, engine: DiagramEngine) {
    super.deSerialize(object, engine);
    this.name = object.name;
    this.color = object.color;
  }

  serialize() {
    return _.merge(super.serialize(), {
      name: this.name,
      color: this.color,
    });
  }

  getInputs() {
    return this.inputs;
  }
}
