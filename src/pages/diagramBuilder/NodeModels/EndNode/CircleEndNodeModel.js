// @flow
import * as _ from 'lodash';
import { CircleEndPortModel } from './CircleEndPortModel';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { NodeModel } from '@projectstorm/react-diagrams';

export class CircleEndNodeModel extends NodeModel {
  name: string;
  color: string;

  constructor(name: string = 'Untitled', color: string = 'rgb(0,192,255)') {
    super('end', 'end');
    this.name = name;
    this.color = color;

    this.addPort(new CircleEndPortModel(true, 'left'));
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
