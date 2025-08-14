import React, { useState, useEffect } from 'react';
import { Button, Space, Select, DatePicker, Popover } from 'antd';
import { SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import dayjs, { type Dayjs } from 'dayjs';

import type { MetricsWidgetV2Props, PeriodFilter } from './types';
import { useMetricsSettings } from './hooks/useMetricsSettings';
import { useMetricsGroups } from './hooks/useMetricsGroups';
import { useMetricsCards } from './hooks/useMetricsCards';
import { SettingsPopover } from './components/SettingsPopover';
import { MetricGroup } from './components/MetricGroup';

import './styles.css';

export const MetricsWidgetV2: React.FC<MetricsWidgetV2Props> = ({
  positions: _positions,
  activeAccount,
  equityStats,
  portfolioMetrics,
  hiddenCards,
  onRemoveCard,
  containerWidth = 1200,
  onPeriodChange,
  currentPeriodFilter = 'all',
  currentDateRange = [null, null],
}) => {
  const { t } = useTranslation('widgets');
  // 상태 관리
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(currentPeriodFilter);
  const [customDateRange, setCustomDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    currentDateRange[0] ? dayjs(currentDateRange[0]) : null,
    currentDateRange[1] ? dayjs(currentDateRange[1]) : null,
  ]);
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);

  // 외부에서 전달받은 기간 필터가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setPeriodFilter(currentPeriodFilter);
  }, [currentPeriodFilter]);
  
  useEffect(() => {
    setCustomDateRange([
      currentDateRange[0] ? dayjs(currentDateRange[0]) : null,
      currentDateRange[1] ? dayjs(currentDateRange[1]) : null,
    ]);
  }, [currentDateRange]);

  // 커스텀 훅 사용
  const { settings, updateSettings } = useMetricsSettings();
  const { groups, isLoaded: groupsLoaded, addGroup, updateGroupTitle, deleteGroup } = useMetricsGroups();
  const { cards, isLoaded: cardsLoaded, moveCardsToFirstGroup, handleDragEnd } = useMetricsCards(groups);

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 그룹 삭제 핸들러
  const handleDeleteGroup = (groupId: string) => {
    moveCardsToFirstGroup(groupId);
    deleteGroup(groupId);
  };

  // 레이아웃 스타일
  const getLayoutStyle = () => {
    if (containerWidth < 800) {
      return { gridTemplateColumns: '1fr' };
    } else if (containerWidth < 1200) {
      return { gridTemplateColumns: 'repeat(2, 1fr)' };
    } else {
      return { gridTemplateColumns: 'repeat(3, 1fr)' };
    }
  };

  if (!groupsLoaded || !cardsLoaded) {
    return <div style={{ minHeight: 200 }} />;
  }

  return (
    <div className="metrics-widget-v2">
      <style>{`
        .group-title {
          font-size: ${settings.categoryFontSize}px;
          font-weight: ${settings.categoryBold ? 'bold' : '600'};
        }
        
        .metric-content .ant-statistic-content-value {
          font-size: ${settings.valueFontSize}px;
          font-weight: ${settings.valueBold ? 'bold' : 'normal'};
        }
      `}</style>
      
      {/* 위젯 헤더 */}
      <div className="widget-header">
        {/* 기간 필터 */}
        <Space size={8}>
          <Select
            value={periodFilter}
            onChange={(value) => {
              setPeriodFilter(value);
              if (value !== 'custom') {
                setCustomDateRange([null, null]);
                onPeriodChange?.(value);
              }
            }}
            size="small"
            style={{ width: 130 }}
          >
            <Select.Option value="2weeks">{t('metricsWidget.periods.twoWeeks')}</Select.Option>
            <Select.Option value="1month">{t('metricsWidget.periods.oneMonth')}</Select.Option>
            <Select.Option value="custom">{t('metricsWidget.periods.custom')}</Select.Option>
            <Select.Option value="all">{t('metricsWidget.periods.allTrades')}</Select.Option>
          </Select>
          
          {periodFilter === 'custom' && (
            <DatePicker.RangePicker
              value={customDateRange}
              onChange={(dates) => {
                setCustomDateRange(dates as [Dayjs | null, Dayjs | null]);
                if (dates && dates[0] && dates[1]) {
                  onPeriodChange?.('custom', [dates[0].toDate(), dates[1].toDate()]);
                }
              }}
              size="small"
              style={{ width: 240 }}
              placeholder={[t('common.startDate'), t('common.endDate')]}
              format="YYYY-MM-DD"
            />
          )}
        </Space>
        
        <Popover
          content={
            <SettingsPopover
              settings={settings}
              onSettingsChange={updateSettings}
              hiddenCards={hiddenCards}
              onToggleCard={onRemoveCard}
            />
          }
          trigger="click"
          placement="leftTop"
          open={settingsPopoverOpen}
          onOpenChange={setSettingsPopoverOpen}
        >
          <Button 
            icon={<SettingOutlined />} 
            size="small" 
            type="text"
            className="settings-btn"
          />
        </Popover>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="groups-container" style={getLayoutStyle()}>
          {groups.sort((a, b) => a.order - b.order).map(group => (
            <MetricGroup
              key={group.id}
              group={group}
              cards={cards}
              hiddenCards={hiddenCards}
              onRemoveCard={onRemoveCard}
              onDeleteGroup={handleDeleteGroup}
              onUpdateTitle={updateGroupTitle}
              settings={settings}
              equityStats={equityStats}
              portfolioMetrics={portfolioMetrics}
              activeAccount={activeAccount}
              isLastGroup={groups.length === 1}
              containerWidth={containerWidth / Math.min(3, groups.length)}
            />
          ))}
        </div>
      </DndContext>

      <Button
        icon={<PlusOutlined />}
        onClick={addGroup}
        className="add-group-btn"
        type="dashed"
      >
        {t('metricsWidget.addCategories')}
      </Button>
    </div>
  );
};