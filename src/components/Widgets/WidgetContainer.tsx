import React from 'react';
import { Card, theme } from 'antd';
import { useSettingsStore } from '../../stores/settingsStore';
import './WidgetContainer.css';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  onSettingsClick?: () => void;
  showSettings?: boolean;
  extra?: React.ReactNode;
  className?: string;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  title,
  children,
  className = '',
}) => {
  const { token } = theme.useToken();
  const { generalSettings } = useSettingsStore();
  const isEditMode = generalSettings.isEditMode;

  return (
    <div 
      className={`widget-container ${className} ${isEditMode ? 'widget-edit-mode' : ''}`}
      style={isEditMode ? {
        '--edit-border': `2px dashed ${token.colorPrimary}`,
      } as React.CSSProperties : {}}
    >
      <Card
        styles={{ 
          header: { display: 'none' },
          body: { 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }
        }}
      >
        <div className={`widget-content ${isEditMode ? 'edit-mode' : ''}`}>
          {children}
        </div>
      </Card>
      {isEditMode && (
        <div className="widget-edit-header">
          <div 
            className="widget-drag-handle"
            style={{
              background: `linear-gradient(180deg, ${token.colorSuccessBg} 0%, ${token.colorSuccessBgHover} 100%)`,
              border: `2px solid ${token.colorSuccessBorder}`,
              borderBottom: `2px solid ${token.colorSuccessBorderHover}`,
            }}
          >
            <span 
              className="widget-title"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
              }}
            >
              {title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};