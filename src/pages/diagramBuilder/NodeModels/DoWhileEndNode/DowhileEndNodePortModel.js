// @flow
import * as _ from 'lodash';
import { DefaultLinkModel, DiagramEngine, LinkModel, PortModel } from '@projectstorm/react-diagrams';

export class DowhileEndNodePortModel extends PortModel {
  position: string | 'top' | 'bottom' | 'left' | 'right';

  constructor(isInput: boolean, pos: string = 'left') {
    super(pos, 'while_end');
    this.in = isInput;
    this.position = pos;
  }

  serialize() {
    return _.merge(super.serialize(), {
      position: this.position,
    });
  }

  link(port: PortModel): LinkModel {
    const link = this.createLinkModel();
    link.setSourcePort(this);
    link.setTargetPort(port);
    return link;
  }

  deSerialize(data, engine: DiagramEngine) {
    super.deSerialize(data, engine);
    this.position = data.position;
  }

  canLinkToPort(port: PortModel): boolean {
    return !this.in && port.in;
  }

  createLinkModel(): LinkModel {
    return new DefaultLinkModel();
  }
}
