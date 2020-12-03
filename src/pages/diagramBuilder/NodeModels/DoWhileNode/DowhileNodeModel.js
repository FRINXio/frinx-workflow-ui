// @flow
import * as _ from 'lodash';
import { DowhileNodePortModel } from './DowhileNodePortModel';
import { DiagramEngine, Toolkit } from '@projectstorm/react-diagrams';
import { NodeModel } from '@projectstorm/react-diagrams';

export class DowhileNodeModel extends NodeModel {
  name: string;
  color: string;
  inputs: {};

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)', inputs: {}) {
    super('while');
    this.name = name;
    this.color = color;
    super.extras = { inputs: inputs };

    this.addPort(new DowhileNodePortModel(true, 'left'));
    this.addPort(new DowhileNodePortModel(false, 'right'));
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
