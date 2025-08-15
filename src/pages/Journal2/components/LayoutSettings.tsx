import React from 'react';
import { Button, Popover, Typography, Space, Checkbox } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ALL_WIDGETS } from '../constants';

interface LayoutSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hiddenWidgets: string[];
  onToggleWidgetVisibility: (widgetId: string) => void;
}

export const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  open,
  onOpenChange,
  hiddenWidgets,
  onToggleWidgetVisibility
}) => {
  const { t } = useTranslation('common');
  const settingsContent = (
    <div style={{ width: 350 }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
        Dashboard Settings
      </Typography.Text>
      
      {/* 위젯 표시/숨기기 */}
      <div style={{ marginBottom: 20 }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
          Show/Hide Widgets
        </Typography.Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          {ALL_WIDGETS.map(widget => (
            <Checkbox
              key={widget.id}
              checked={!hiddenWidgets.includes(widget.id)}
              onChange={() => onToggleWidgetVisibility(widget.id)}
            >
              {widget.title}
            </Checkbox>
          ))}
        </Space>
      </div>
    </div>
  );
  
  return (
    <Popover
      content={settingsContent}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Button icon={<SettingOutlined />} type="text">
        {t('navigation.settings')}
      </Button>
    </Popover>
  );
};