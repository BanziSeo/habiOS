import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  WidgetContainer,
  DailyRiskLimitWidget,
  DailyPnLWidget,
  DailyNotesWidget,
  TodayTradesWidget,
  MetricsWidgetV2,
  PositionTableWidget,
  CalendarWidget,
} from '../../../components/Widgets';
import { MetricsTableWidget } from '../../../components/Widgets/MetricsTableWidget';
import { ALL_WIDGETS } from '../constants';
import type { EquityStats } from '../types';
import type { PortfolioMetrics } from '../../../utils/metrics/facade';
import type { Account, Position } from '../../../types';
import type { PeriodFilter } from '../../../components/Widgets/MetricsWidget/types';

interface WidgetRendererProps {
  widgetId: string;
  selectedDate: dayjs.Dayjs;
  filteredPositions: Position[];
  positions: Position[];
  activeAccount: Account | null;
  equityStats: EquityStats | undefined;
  portfolioMetrics: PortfolioMetrics | null;
  hiddenMetricCards: string[];
  onRemoveCard: (cardId: string) => void;
  containerWidth: number;
  onPeriodChange: (periodFilter: PeriodFilter, dateRange?: [Date | null, Date | null]) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentPeriodFilter?: PeriodFilter;
  currentDateRange?: [Date | null, Date | null];
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widgetId,
  selectedDate,
  filteredPositions,
  positions,
  activeAccount,
  equityStats,
  portfolioMetrics,
  hiddenMetricCards,
  onRemoveCard,
  containerWidth,
  onPeriodChange,
  activeTab,
  onTabChange,
  currentPeriodFilter,
  currentDateRange
}) => {
  const { t } = useTranslation('journal');
  const widget = ALL_WIDGETS.find(w => w.id === widgetId);
  if (!widget) return null;
  
  switch (widget.type) {
    case 'daily-risk-limit':
      return (
        <WidgetContainer title={t('widget.dailyRisk.title')}>
          <DailyRiskLimitWidget selectedDate={selectedDate} />
        </WidgetContainer>
      );
    
    case 'daily-pnl':
      return (
        <WidgetContainer title={t('widget.dailyPnl.title')}>
          <DailyPnLWidget selectedDate={selectedDate} />
        </WidgetContainer>
      );
    
    case 'daily-notes':
      return (
        <WidgetContainer title={t('widget.dailyNotes.title')}>
          <DailyNotesWidget selectedDate={selectedDate} />
        </WidgetContainer>
      );
    
    case 'today-trades':
      return (
        <WidgetContainer title={t('widget.todayTrades.title')}>
          <TodayTradesWidget selectedDate={selectedDate} />
        </WidgetContainer>
      );
    
    case 'metrics':
      return (
        <WidgetContainer title={`${t('widget.metrics.title')} - ${widgetId.split('-')[1] || '1'}`}>
          <MetricsWidgetV2
            widgetId={widgetId}
            positions={filteredPositions.length > 0 ? filteredPositions : positions}
            activeAccount={activeAccount}
            equityStats={equityStats}
            portfolioMetrics={portfolioMetrics}
            hiddenCards={hiddenMetricCards}
            onRemoveCard={onRemoveCard}
            containerWidth={containerWidth}
            onPeriodChange={onPeriodChange}
            currentPeriodFilter={currentPeriodFilter}
            currentDateRange={currentDateRange}
          />
        </WidgetContainer>
      );
    
    case 'positions':
      return (
        <WidgetContainer title={t('widget.positions.title')}>
          <PositionTableWidget
            positions={positions}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </WidgetContainer>
      );
    
    case 'metrics-table':
      return (
        <WidgetContainer title={`${t('widget.metricsTable.title', 'Metrics Table')} - ${widgetId.split('-')[2] || '1'}`}>
          <MetricsTableWidget
            widgetId={widgetId}
            positions={filteredPositions.length > 0 ? filteredPositions : positions}
            activeAccount={activeAccount}
            equityStats={equityStats}
            portfolioMetrics={portfolioMetrics}
            onPeriodChange={onPeriodChange}
            currentPeriodFilter={currentPeriodFilter}
            currentDateRange={currentDateRange}
          />
        </WidgetContainer>
      );
    
    case 'calendar':
      return (
        <WidgetContainer title={`${t('widget.calendar.title', 'Calendar')} - ${widgetId.split('-')[1] || '1'}`}>
          <CalendarWidget
            widgetId={widgetId}
            positions={filteredPositions.length > 0 ? filteredPositions : positions}
            containerWidth={containerWidth}
          />
        </WidgetContainer>
      );
    
    default:
      return null;
  }
};