import React from 'react';
import GridLayout from 'react-grid-layout';
import { theme } from 'antd';
import type { LayoutItem, EquityStats } from '../types';
import { GRID_CONFIG } from '../constants';
import { WidgetRenderer } from './WidgetRenderer';
import dayjs from 'dayjs';
import type { PortfolioMetrics } from '../../../utils/metrics/facade';
import type { Account, Position } from '../../../types';
import type { PeriodFilter } from '../../../components/Widgets/MetricsWidget/types';

interface WidgetGridProps {
  widgetLayouts: LayoutItem[];
  hiddenWidgets: string[];
  containerWidth: number;
  isEditMode: boolean;
  onLayoutChange: (layout: LayoutItem[]) => void;
  selectedDate: dayjs.Dayjs;
  filteredPositions: Position[];
  positions: Position[];
  activeAccount: Account | null;
  equityStats: EquityStats | undefined;
  portfolioMetrics: PortfolioMetrics | null;
  hiddenMetricCards: string[];
  onRemoveCard: (cardId: string) => void;
  onPeriodChange: (periodFilter: PeriodFilter, dateRange?: [Date | null, Date | null]) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentPeriodFilter?: PeriodFilter;
  currentDateRange?: [Date | null, Date | null];
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgetLayouts,
  hiddenWidgets,
  containerWidth,
  isEditMode,
  onLayoutChange,
  selectedDate,
  filteredPositions,
  positions,
  activeAccount,
  equityStats,
  portfolioMetrics,
  hiddenMetricCards,
  onRemoveCard,
  onPeriodChange,
  activeTab,
  onTabChange,
  currentPeriodFilter,
  currentDateRange
}) => {
  const { token } = theme.useToken();
  
  return (
    <div 
      style={{ 
        width: '100%',
        ...(isEditMode && {
          '--grid-focus-outline': `2px solid ${token.colorSuccess}`,
          '--grid-placeholder-bg': `${token.colorSuccessBg}`,
          '--grid-placeholder-border': `2px dashed ${token.colorPrimary}`,
          '--resize-handle-color': `${token.colorSuccess}`,
          '--hover-shadow': `0 4px 20px ${token.colorSuccessBg}`,
          '--ant-color-primary': token.colorPrimary,
          '--ant-color-primary-rgb': token.colorPrimary.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', '),
          '--ant-color-warning-rgb': token.colorWarning.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', '),
          '--ant-color-success-rgb': token.colorSuccess.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', '),
        } as React.CSSProperties)
      }} 
      className={isEditMode ? 'edit-mode-active' : ''}
    >
      <GridLayout
        className="layout"
        layout={widgetLayouts}
        cols={GRID_CONFIG.COLS}
        rowHeight={GRID_CONFIG.ROW_HEIGHT}
        width={containerWidth}
        onLayoutChange={onLayoutChange}
        margin={GRID_CONFIG.MARGIN}
        containerPadding={GRID_CONFIG.CONTAINER_PADDING}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
        draggableHandle={GRID_CONFIG.DRAG_HANDLE}
        draggableCancel={GRID_CONFIG.DRAG_CANCEL}
      >
        {widgetLayouts
          .filter(layout => !hiddenWidgets.includes(layout.i))
          .map(layout => (
            <div key={layout.i} style={{ height: '100%' }}>
              <WidgetRenderer
                widgetId={layout.i}
                selectedDate={selectedDate}
                filteredPositions={filteredPositions}
                positions={positions}
                activeAccount={activeAccount}
                equityStats={equityStats}
                portfolioMetrics={portfolioMetrics}
                hiddenMetricCards={hiddenMetricCards}
                onRemoveCard={onRemoveCard}
                containerWidth={containerWidth}
                onPeriodChange={onPeriodChange}
                activeTab={activeTab}
                onTabChange={onTabChange}
                currentPeriodFilter={currentPeriodFilter}
                currentDateRange={currentDateRange}
              />
            </div>
          ))}
      </GridLayout>
    </div>
  );
};