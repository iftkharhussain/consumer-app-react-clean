import React, { useState } from 'react';
import { Banner } from '../../../../components';
import { Space, Table, Tag, Radio, Button, Dropdown, MenuProps, Tabs } from 'antd';



const items = [
  {
    label: (
      <a href="/" target="_blank" rel="noopener noreferrer">
        1st menu item
      </a>
    ),
    key: '0',
  },
  {
    label: (
      <a href="/" target="_blank" rel="noopener noreferrer">
        2nd menu item
      </a>
    ),
    key: '1',
  },
  {
    type: 'divider',
  },
  {
    label: '3rd menu item',
    key: '3',
  },
];


const PageBanner = ({ heading, subHeading, bannerActions }) => {

  const [position, setPosition] = useState('list-view');

  return (
    <Banner heading={'List of all Consumer App Prospects'} subHeading={
      <div className='description'>
        <p>Potential Value: 1504 CAD</p>
        <p>Leads: 2 leads</p>
        <div className='mt-16'>
        <Button.Group value={position} onChange={(e) => setPosition(e.target.value)}>
          <Button value="kanban-view">Kanban View</Button>
          <Button type='primary' value="list-view">List View</Button>
        </Button.Group>
        </div>
      </div>}
      bannerActions={
        <div className='flex align-items-start gap-10 mt-10'>
          <Dropdown menu={{ items }} trigger={['click']} >
            <Button>Leads <img src='/images/chevron-down.svg' alt='chevron-down'/></Button>
          </Dropdown>
          <Dropdown menu={{ items }} trigger={['click']} >
            <Button>Overflow <img src='/images/chevron-down.svg' alt='chevron-down'/></Button>
          </Dropdown>
          <Dropdown menu={{ items }} trigger={['click']} >
            <Button>All Open <img src='/images/chevron-down.svg' alt='chevron-down'/></Button>
          </Dropdown>

          <Button type="primary" style={{ marginRight: '10px' }}><img src='/images/plus.svg' alt='plus'/> Add Lead</Button>
          <Dropdown menu={{ items }} trigger={['click']} >
            <a onClick={(e) => e.preventDefault()}>
              <img src="/images/dots-vertical.svg" alt="menu" />
            </a>
          </Dropdown>
        </div>
      }
    />
  );
};

export default PageBanner;