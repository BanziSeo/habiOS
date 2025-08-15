import React, { useState } from 'react';
import { Spin, Empty } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../../styles/editMode.css';

// Custom hooks
import { useJournalData } from './hooks/useJournalData';
import { useEquityStats } from './hooks/useEquityStats';
import { useWidgetLayout } from './hooks/useWidgetLayout';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useEditMode } from './hooks/useEditMode';
import { usePositionFiltering } from './hooks/usePositionFiltering';
import { useContainerWidth } from './hooks/useContainerWidth';

// Components
import { JournalHeader } from './components/JournalHeader';
import { EditModeOverlay } from './components/EditModeOverlay';
import { WidgetGrid } from './components/WidgetGrid';

const JournalPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<string>('active');
  
  // 영웅문 날짜로 초기화 (미국 동부 시간 기준)
  // 한국 시간 06:00 이전이면 전날로 설정 (미국 장 마감 시간 고려)
  const getHeroicDate = () => {
    const now = dayjs();
    const hour = now.hour();
    // 한국 시간 06:00 이전이면 전날로 설정
    if (hour < 6) {
      return now.subtract(1, 'day');
    }
    return now;
  };
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(getHeroicDate());
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);
  
  // Custom hooks
  const { positions, isLoading, activeAccount, totalAssets } = useJournalData();
  const { responsiveLayouts } = useResponsiveLayout();
  const {
    widgetLayouts,
    hiddenWidgets,
    hiddenMetricCards,
    handleWidgetLayoutChange,
    toggleWidgetVisibility,
    toggleCardVisibility,
    loadPreset
  } = useWidgetLayout(responsiveLayouts);
  const { isEditMode, toggleEditMode } = useEditMode();
  const {
    filteredPositions,
    currentPortfolioMetrics,
    handlePeriodChange,
    metricsPeriodFilter,
    metricsDateRange
  } = usePositionFiltering(positions, totalAssets, activeAccount?.id);
  const equityStats = useEquityStats(activeAccount?.id, metricsPeriodFilter, metricsDateRange);
  const { containerWidth, containerRef } = useContainerWidth();
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!activeAccount) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description={t('message.selectAccount')} />
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
      {/* 편집 모드 오버레이 */}
      {isEditMode && <EditModeOverlay onToggleEditMode={toggleEditMode} />}
      
      {/* 헤더 */}
      <JournalHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        settingsPopoverOpen={settingsPopoverOpen}
        onSettingsOpenChange={setSettingsPopoverOpen}
        hiddenWidgets={hiddenWidgets}
        onToggleWidgetVisibility={toggleWidgetVisibility}
        widgetLayouts={widgetLayouts}
        hiddenMetricCards={hiddenMetricCards}
        onLoadPreset={loadPreset}
      />
      
      {/* 위젯 그리드 */}
      <WidgetGrid
        widgetLayouts={widgetLayouts}
        hiddenWidgets={hiddenWidgets}
        containerWidth={containerWidth}
        isEditMode={isEditMode}
        onLayoutChange={handleWidgetLayoutChange}
        selectedDate={selectedDate}
        filteredPositions={filteredPositions}
        positions={positions}
        activeAccount={activeAccount}
        equityStats={equityStats}
        portfolioMetrics={currentPortfolioMetrics}
        hiddenMetricCards={hiddenMetricCards}
        onRemoveCard={toggleCardVisibility}
        onPeriodChange={handlePeriodChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentPeriodFilter={metricsPeriodFilter}
        currentDateRange={metricsDateRange}
      />
      
      {/* 하단 여백 - 드래그 시 스크롤 문제 방지 */}
      <div style={{ height: 50 }} />
    </div>
  );
};

export default JournalPage;