import React from "react";
import { Table } from "antd";

const ReusableTable = ({ dataSource, row, ...props }) => {
  const hasData = dataSource && dataSource.length > 0; // Check if table has data

  const components = hasData ? {
      body: {
        row, // Ensure it supports dragging
        cell: ({ children, ...restProps }) => (
          <td {...restProps}><span className="wrap-td">{children}</span></td>
        ),
      },
    }
  : {};

  return <Table {...props} dataSource={dataSource} components={components} scroll={{ x: 'max-content' }} className='lead-labels-list-table table2 table-responsive' />;
};

export default ReusableTable;
