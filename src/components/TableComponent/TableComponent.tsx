import React from 'react';
import { Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { markersData } from '../../utils/constants/data';
import { useAppDispatch } from '../../app/hooks';
import { setSelectedOfficer } from '../../app/features/posts/postsSlice';

interface DataType {
  key: string;
  name: string;
  // age: number;
  position: string;
  availability: string[];
}

const TableComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Officers',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Position 📍',
      dataIndex: 'position',
      key: 'position',
      render: (_, text: any) => <a href='#'
        onClick={(e) => {
          e.preventDefault();
          dispatch(setSelectedOfficer({ name: text.name, coords: text.position }));
        }}
      >{text.position[0] + ' , ' + text.position[1]}</a>,
    },
    {
      title: 'Availability',
      key: 'availability',
      dataIndex: 'availability',
      render: (availability) => {
        let color;
        let txt;
        if (availability) {
          color = 'volcano';
          txt = 'On-Post'
        } else {
          color = 'geekblue'
          txt = 'Offline'
        }
        return (
          <>
            <Tag color={color}>
              {txt}
            </Tag>
          </>
        )
      },
    },
  ];

  return <Table<DataType> columns={columns}
    className='rjb-header-cards'
    dataSource={markersData}
    pagination={{
      pageSize: 4,
      showSizeChanger: false,
      position: ['bottomCenter'],
    }}
  />;
}
export default TableComponent;