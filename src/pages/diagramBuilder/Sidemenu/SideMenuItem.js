// @flow
import React from 'react';
import { Card, Menu } from 'semantic-ui-react';

const getDescription = wfObject => {
  if (!wfObject?.description) {
    return null;
  }

  try {
    return JSON.parse(wfObject?.description)?.description;
  } catch (e) {
    return wfObject.description;
  }
};

const SideMenuItem = props => {
  const description = getDescription(props.model.wfObject);

  return (
    <Menu.Item
      title={description}
      color="blue"
      fluid
      as={Card}
      draggable={true}
      onDragStart={e => {
        e.dataTransfer.setData('storm-diagram-node', JSON.stringify(props.model));
      }}
      style={{ cursor: 'grab', backgroundColor: 'white' }}
    >
      <div style={{ maxWidth: '90%', float: 'left' }}>
        <div style={{ display: props.icon ? 'inline-block' : 'hidden', marginRight: '10px' }}>{props?.icon}</div>
        <div style={{ display: 'inline-block' }}>{props.name}</div>
      </div>
      <div
        style={{
          float: 'right',
          color: 'grey',
          opacity: '30%',
        }}
      >
        <i className="fas fa-grip-vertical" />
      </div>
    </Menu.Item>
  );
};

export default SideMenuItem;
