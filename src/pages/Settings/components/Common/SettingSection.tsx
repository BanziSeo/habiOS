import React from 'react';
import { Card } from 'antd';
import { theme } from 'antd';

interface SettingSectionProps {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  icon,
  title,
  children,
  className = ''
}) => {
  const { token } = theme.useToken();
  
  return (
    <div className={`settings-group ${className}`}>
      <div className="group-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        {icon && <span className="group-icon" style={{ fontSize: '18px', color: token.colorPrimary }}>{icon}</span>}
        <h2 className="group-title" style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: 600,
          color: token.colorText 
        }}>
          {title}
        </h2>
      </div>
      
      <Card className="settings-card" style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius
      }}>
        {children}
      </Card>
    </div>
  );
};