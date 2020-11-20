// @flow
import * as _ from 'lodash';
import { CircleStartPortModel } from './CircleStartPortModel';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { NodeModel } from '@projectstorm/react-diagrams';

export class CircleStartNodeModel extends NodeModel {
  name: string;
  color: string;

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)') {
    super('start', 'start');
    this.name = name;
    this.color = color;

    this.addPort(new CircleStartPortModel(false, 'right'));
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
}
