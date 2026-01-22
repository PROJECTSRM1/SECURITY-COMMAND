// import React from 'react';
import {Progress } from 'antd';
import type { ProgressProps } from 'antd';

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};

const ProgressBarsComponent = ({ title, value }: { title: string; value: number }) => {
  return (
  <div className="rjb-progress-wrapper">
    <Progress type="circle" percent={value} strokeColor={twoColors} />
    <strong className="rjb-progress-title">{title}</strong>
  </div>

)};

export default ProgressBarsComponent;