import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Tooltip, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DateSelector } from './DateSelector';
import { LayoutSettings } from './LayoutSettings';
import { useJournalNames } from '../../../hooks/useJournalNames';
import { PresetManager } from './PresetManager';
import type { LayoutItem } from '../types';

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
  // 프리셋 관련 props 추가
  widgetLayouts: LayoutItem[];
  hiddenMetricCards: string[];
  onLoadPreset: (layoutData: {
    widgetLayouts: LayoutItem[];
    hiddenWidgets: string[];
    hiddenMetricCards: string[];
  }) => void;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  selectedDate,
  onDateChange,
  isEditMode,
  onToggleEditMode,
  settingsPopoverOpen,
  onSettingsOpenChange,
  hiddenWidgets,
  onToggleWidgetVisibility,
  widgetLayouts,
  hiddenMetricCards,
  onLoadPreset
}) => {
  const { t } = useTranslation('journal');
  const { journalNames, updateJournalName } = useJournalNames();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(journalNames.journal2);

  useEffect(() => {
    setTempTitle(journalNames.journal2);
  }, [journalNames.journal2]);

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    updateJournalName('journal2', tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(journalNames.journal2);
    setIsEditingTitle(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      {isEditingTitle ? (
        <Input
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onPressEnter={handleTitleSave}
          onBlur={handleTitleSave}
          onKeyDown={(e) => e.key === 'Escape' && handleTitleCancel()}
          style={{ width: 200, fontSize: 24, fontWeight: 500 }}
          maxLength={20}
          autoFocus
        />
      ) : (
        <Title 
          level={2} 
          style={{ 
            margin: 0, 
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
          onClick={handleTitleEdit}
        >
          {journalNames.journal2}
          <EditOutlined style={{ fontSize: 16, opacity: 0.5 }} />
        </Title>
      )}
      
      <Space>
        {/* 프리셋 관리 */}
        <PresetManager
          journalId="journal2"
          currentLayouts={widgetLayouts}
          hiddenWidgets={hiddenWidgets}
          hiddenMetricCards={hiddenMetricCards}
          onLoadPreset={onLoadPreset}
        />
        
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