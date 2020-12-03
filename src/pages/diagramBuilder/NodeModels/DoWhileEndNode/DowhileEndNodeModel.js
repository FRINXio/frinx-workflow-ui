// @flow
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { DowhileEndNodePortModel } from './DowhileEndNodePortModel';
import { NodeModel } from '@projectstorm/react-diagrams';

export class DowhileEndNodeModel extends NodeModel {
  name: string;
  color: string;
  inputs: {};

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)', inputs: {}) {
    super('while_end');
    this.name = name;
    this.color = color;
    super.extras = { inputs: inputs };

    this.addPort(new DowhileEndNodePortModel(true, 'left'));
    this.addPort(new DowhileEndNodePortModel(false, 'right'));
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
