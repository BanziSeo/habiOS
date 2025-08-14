import React from 'react';
import { Spin } from 'antd';
import { useLoadingStore } from '../../stores/loadingStore';

export const GlobalLoading: React.FC = () => {
  const { isLoading, loadingText } = useLoadingStore();
  
  if (!isLoading) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '24px 48px',
        borderRadius: '8px',
        boxShadow: '0 4px 60px rgba(0, 0, 0, 0.15)',
        textAlign: 'center'
      }}>
        <Spin size="large" />
        {loadingText && (
          <div style={{ 
            marginTop: 16, 
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.65)' 
          }}>
            {loadingText}
          </div>
        )}
      </div>
    </div>
  );
};