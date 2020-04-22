import * as _ from "lodash";
import { PortModel } from "storm-react-diagrams";
import { DiagramEngine } from "storm-react-diagrams";
import { DefaultLinkModel } from "storm-react-diagrams";
import { LinkModel } from "storm-react-diagrams";

export class DefaultPortModel extends PortModel {
  in: boolean;
  label: string;

  constructor(
    isInput: boolean,
    name: string,
    label: string = null,
    id?: string
  ) {
    super(name, "default", id);
    this.in = isInput;
    this.label = label || name;
  }

  deSerialize(object, engine: DiagramEngine) {
    super.deSerialize(object, engine);
    this.in = object.in;
    this.label = object.label;
  }

  serialize() {
    return _.merge(super.serialize(), {
      in: this.in,
      label: this.label
    });
  }

  link(port: PortModel): LinkModel {
    let link = this.createLinkModel();
    link.setSourcePort(this);
    link.setTargetPort(port);
    return link;
  }

  canLinkToPort(port: PortModel): boolean {
    return !this.in && port.in;
  }

  createLinkModel(): LinkModel {
    let link = super.createLinkModel();
    return link || new DefaultLinkModel();
  }
}
