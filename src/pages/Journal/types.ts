import type { PeriodFilter } from '../../components/Widgets/MetricsWidget';
import type dayjs from 'dayjs';

// 위젯 타입 정의
export interface Widget {
  id: string;
  title: string;
  type: 'daily-risk-limit' | 'daily-pnl' | 'daily-notes' | 'today-trades' | 'metrics' | 'positions' | 'metrics-table';
}

// Equity 통계 타입
export interface EquityStats {
  currentValue: number;
  initialValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  tradingDays: number;
}

// 레이아웃 아이템 타입
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

// Journal 페이지 Props
export interface JournalPageProps {
  // 현재는 props가 없지만 향후 확장을 위해 정의
}

// 날짜 필터 상태
export interface DateFilterState {
  selectedDate: dayjs.Dayjs;
  metricsPeriodFilter: PeriodFilter;
  metricsDateRange: [Date | null, Date | null];
}

// 레이아웃 상태
export interface LayoutState {
  widgetLayouts: LayoutItem[];
  hiddenWidgets: string[];
  hiddenMetricCards: string[];
  containerWidth: number;
}