import React from 'react';
import { theme } from 'antd';

interface SettingItemProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
  vertical?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  label,
  children,
  description,
  className = '',
  vertical = false
}) => {
  const { token } = theme.useToken();
  
  if (vertical) {
    return (
      <div className={`form-item-vertical ${className}`} style={{ marginBottom: '20px' }}>
        <label className="form-label" style={{ 
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: 500,
          color: token.colorText 
        }}>
          {label}
        </label>
        <div className="form-control">
          {children}
        </div>
        {description && (
          <div style={{ 
            marginTop: '4px',
            fontSize: '12px',
            color: token.colorTextSecondary,
            lineHeight: 1.5
          }}>
            {description}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`form-row ${className}`} style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${token.colorBorderSecondary}`
    }}>
      <div style={{ flex: 1 }}>
        <label className="form-label" style={{ 
          fontSize: '14px',
          color: token.colorText 
        }}>
          {label}
        </label>
        {description && (
          <div style={{ 
            marginTop: '4px',
            fontSize: '12px',
            color: token.colorTextSecondary 
          }}>
            {description}
          </div>
        )}
      </div>
      <div className="form-control" style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {children}
      </div>
    </div>
  );
};