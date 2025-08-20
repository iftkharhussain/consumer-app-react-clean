import React from 'react';
import { Card as AntCard } from 'antd';

const Card = ({ children, ...props }) => (
  <AntCard {...props}>
    {children ? children : (
      <>
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </>
    )}
  </AntCard>
);
export default Card;