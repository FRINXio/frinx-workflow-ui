// @flow
import * as React from 'react';
import { NodeContextMenu, NodeMenuProvider } from '../ContextMenu';
import { PortWidget } from '@projectstorm/react-diagrams';

export class DowhileNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 120,
      height: 80,
    };
  }

  render() {
    let conditionLabel = this.props.node?.extras?.inputs?.loopCondition || '';

    conditionLabel = conditionLabel.replaceAll(
      `$.${this.props.node?.extras?.inputs?.taskReferenceName}['iteration']`,
      '$iteration',
    );
    conditionLabel = conditionLabel.replaceAll(`$.${this.props.node?.extras?.inputs?.taskReferenceName}`, '$this');
    return (
      <div>
        <NodeMenuProvider node={this.props.node}>
          <svg
            width={this.state.width}
            height={this.state.height}
            dangerouslySetInnerHTML={{
              __html: `
                <g id="Layer_2">
                  <polygon fill="${this.props.node.color}" points="30 65,105 65,105 15,30 15,15 40"/>
                  <text x="50" y="45" fill="white" font-size="13px" >while</text>
                  <text x="0" y="10" size="" fill="lightblue" font-size="11px" >${conditionLabel}
                  </text>
                </g>
        `,
            }}
          />
        </NodeMenuProvider>
        <div
          className="srd-node-glow"
          style={{
            position: 'absolute',
            zIndex: -1,
            left: 65,
            top: 40,
          }}
        />

        <div
          className="srd-node-glow"
          style={{
            position: 'absolute',
            zIndex: -1,
            left: 70,
            top: 50,
          }}
        />

        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: 7,
            top: this.state.height / 2 - 12,
          }}
        >
          <PortWidget name="left" node={this.props.node} />
        </div>

        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: this.state.width - 25,
            top: this.state.height / 2 - 12,
          }}
        >
          <PortWidget name="right" node={this.props.node} />
        </div>
        <NodeContextMenu node={this.props.node} diagramEngine={this.props.diagramEngine} />
      </div>
    );
  }
}
