// @flow
import React, { Component } from 'react';
import Pagination from 'react-bootstrap/Pagination';

type Props = {
  defaultPages: number,
  handler: (defaultPageCount: number, pageCount: number) => void,
  dataSize: number,
};

type StateType = {};

class PageCount extends Component<Props, StateType> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Pagination style={{ float: 'left' }}>
        <Pagination.Item
          active={this.props.defaultPages === 10}
          onClick={e => {
            let dataSize = this.props.dataSize;
            let size = ~~(dataSize / 10);
            let pagesCount = dataSize === 0 ? 0 : dataSize % 10 ? ++size : size;
            this.props.handler(10, pagesCount);
          }}
        >
          10{' '}
        </Pagination.Item>
        <Pagination.Item
          active={this.props.defaultPages === 20}
          onClick={e => {
            let dataSize = this.props.dataSize;
            let size = ~~(dataSize / 20);
            let pagesCount = dataSize === 0 ? 0 : dataSize % 20 ? ++size : size;
            this.props.handler(20, pagesCount);
          }}
        >
          20{' '}
        </Pagination.Item>
        <Pagination.Item
          active={this.props.defaultPages === 50}
          onClick={e => {
            let dataSize = this.props.dataSize;
            let size = ~~(dataSize / 50);
            let pagesCount = dataSize === 0 ? 0 : dataSize % 50 ? ++size : size;
            this.props.handler(50, pagesCount);
          }}
        >
          50{' '}
        </Pagination.Item>
      </Pagination>
    );
  }
}

export default PageCount;
