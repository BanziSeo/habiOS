import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const PageLoader: React.FC = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'var(--ant-color-bg-layout)'
    }}>
      <Spin indicator={antIcon} size="large" />
    </div>
  );
};