import React from 'react';
import { theme } from 'antd';

interface SettingGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingGroup: React.FC<SettingGroupProps> = ({
  title,
  children,
  className = ''
}) => {
  const { token } = theme.useToken();
  
  return (
    <div className={`setting-group ${className}`} style={{
      marginBottom: '24px'
    }}>
      {title && (
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: token.colorText,
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`
        }}>
          {title}
        </h3>
      )}
      <div className="setting-group-content">
        {children}
      </div>
    </div>
  );
};