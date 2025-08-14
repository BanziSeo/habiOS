import React from 'react';
import { Typography, Space, Button, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DateSelector } from './DateSelector';
import { LayoutSettings } from './LayoutSettings';

const { Title } = Typography;

interface JournalHeaderProps {
  selectedDate: dayjs.Dayjs;
  onDateChange: (date: dayjs.Dayjs) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  settingsPopoverOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  hiddenWidgets: string[];
  onToggleWidgetVisibility: (widgetId: string) => void;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  selectedDate,
  onDateChange,
  isEditMode,
  onToggleEditMode,
  settingsPopoverOpen,
  onSettingsOpenChange,
  hiddenWidgets,
  onToggleWidgetVisibility
}) => {
  const { t } = useTranslation('journal');
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <Title level={2} style={{ margin: 0 }}>{t('header.title')}</Title>
      
      <Space>
        {/* 날짜 선택 */}
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
        
        {/* 편집 모드 버튼 */}
        <Tooltip title="Edit widget layout (E)">
          <Button 
            onClick={onToggleEditMode}
            type={isEditMode ? "primary" : "text"}
          >
            {t('header.viewMode')}
          </Button>
        </Tooltip>
        
        {/* 설정 버튼 */}
        <LayoutSettings
          open={settingsPopoverOpen}
          onOpenChange={onSettingsOpenChange}
          hiddenWidgets={hiddenWidgets}
          onToggleWidgetVisibility={onToggleWidgetVisibility}
        />
      </Space>
    </div>
  );
};