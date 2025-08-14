import type { Position, Account } from '../../../types';
import type { EquityStats } from '../../../pages/Journal/types';
import type { PortfolioMetrics } from '../../../utils/metrics/facade';

export type PeriodFilter = 'all' | '2weeks' | '1month' | 'custom';

export interface MetricCard {
  id: string;
  title: string;
  groupId: string;
  visible?: boolean; // 기본 표시 여부
}

export interface MetricGroup {
  id: string;
  title: string;
  order: number;
}

export interface MetricsWidgetV2Props {
  widgetId?: string; // 위젯 인스턴스 구분용
  positions: Position[];
  activeAccount: Account | null;
  equityStats: EquityStats | undefined;
  portfolioMetrics: PortfolioMetrics | null;
  hiddenCards: string[];
  onRemoveCard: (cardId: string) => void;
  containerWidth?: number;
  onPeriodChange?: (periodFilter: PeriodFilter, dateRange?: [Date | null, Date | null]) => void;
  currentPeriodFilter?: PeriodFilter; // 현재 선택된 기간 필터
  currentDateRange?: [Date | null, Date | null]; // 현재 커스텀 날짜 범위
}

export interface MetricsSettings {
  categoryFontSize: number;
  titleFontSize: number;
  valueFontSize: number;
  subValueFontSize: number;
  categoryBold: boolean;
  titleBold: boolean;
  valueBold: boolean;
  subValueBold: boolean;
}

export interface SortableMetricItemProps {
  card: MetricCard;
  children: React.ReactNode;
  onRemove: (cardId: string) => void;
}

export interface MetricGroupProps {
  group: MetricGroup;
  cards: MetricCard[];
  hiddenCards: string[];
  onRemoveCard: (cardId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateTitle: (groupId: string, title: string) => void;
  settings: MetricsSettings;
}

export interface SettingsPopoverProps {
  settings: MetricsSettings;
  onSettingsChange: (settings: Partial<MetricsSettings>) => void;
  hiddenCards: string[];
  onToggleCard: (cardId: string) => void;
}