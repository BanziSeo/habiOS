import type { Dayjs } from 'dayjs';
import type { Position } from '../../../types';

export type CalendarViewMode = 'week' | 'month' | 'heatmap';

export type CalendarPeriod = '1week' | '2weeks' | '4weeks' | 'month' | 'custom';

export interface CalendarWidgetProps {
  widgetId: string;
  positions: Position[];
  containerWidth?: number;
}

export interface DailyData {
  date: string;
  pnl: number;
  tradeCount: number;
  winRate: number;
  volume: number;
  commission: number;
}

export interface CalendarSettings {
  viewMode: CalendarViewMode;
  period: CalendarPeriod;
  customRange?: [Dayjs | null, Dayjs | null];
  showPnL: boolean;
  showTradeCount: boolean;
  showWinRate: boolean;
  showVolume: boolean;
}