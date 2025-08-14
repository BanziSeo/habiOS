import type { Position, Account } from '../../../types';
import type { PortfolioMetrics } from '../../../utils/metrics/facade';
import type { EquityStats } from '../../../pages/Journal/types';

export interface TableCategory {
  id: string;
  name: string;
  metricIds: string[];
  order: number;
}

export interface MetricsTableSettings {
  categories: TableCategory[];
}

export interface MetricsTableWidgetProps {
  positions: Position[];
  activeAccount: Account | null;
  equityStats?: EquityStats;
  portfolioMetrics: PortfolioMetrics | null;
  widgetId?: string;
  onPeriodChange?: (filter: 'all' | '2weeks' | '1month' | 'custom', dateRange?: [Date | null, Date | null]) => void;
  currentPeriodFilter?: 'all' | '2weeks' | '1month' | 'custom';
  currentDateRange?: [Date | null, Date | null];
}

export interface TableRow {
  key: string;
  category?: string;
  name: string;
  value?: string;
  description?: string;
  color?: string;
  isCategory?: boolean;
  children?: TableRow[];
}