// @flow
import * as React from 'react';
import {NodeContextMenu, NodeMenuProvider} from '../ContextMenu';
import {PortWidget} from '@projectstorm/react-diagrams';

export class DynamicNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: 100,
    };
  }

  render() {
    return (
      <div
        className={'srd-default-node'}
        style={{
          position: 'relative',
          width: "100px",
          height: "50px",
          backgroundColor: "rgb(11,60,139)",
        }}>
        <NodeMenuProvider node={this.props.node}>
          <svg
            width={this.state.size + 100}
            height={this.state.size + 5}
            style={{position: 'absolute', left: "-50px"}}
            dangerouslySetInnerHTML={{
              __html: `
                <text x="60" y="17" fill="white" font-size="13px" text-align="center">Dynamic fork</text>
                <text x="0" y="65" fill="lightblue" font-size="10px" text-align="center">name: ${this
                  .props.node?.extras?.inputs?.inputParameters?.validName}</text>
                <text x="0" y="80" fill="lightblue" font-size="10px">type: ${this
                  .props.node?.extras?.inputs?.inputParameters?.validType}</text>
              `,
            }}
          />
        </NodeMenuProvider>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: 25,
          }}>
          <PortWidget name="left" node={this.props.node} />
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: 75,
            top: 25,
          }}>
          <PortWidget name="right" node={this.props.node} />
        </div>
        <NodeContextMenu
          node={this.props.node}
          diagramEngine={this.props.diagramEngine}
        />
      </div>
    );
  }
}
