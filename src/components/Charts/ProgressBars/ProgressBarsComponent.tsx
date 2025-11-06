// import React from 'react';
import {Progress } from 'antd';
import type { ProgressProps } from 'antd';

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};

const ProgressBarsComponent = ({ title, value }: { title: string; value: number }) => {
  return (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
    <Progress type="circle" percent={value} strokeColor={twoColors} />
    <strong style={{marginTop:10}}>{title}</strong>
  </div>

)};

export default ProgressBarsComponent;