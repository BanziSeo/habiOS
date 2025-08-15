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
  tradeCount: number;  // 이제 실제로는 포지션 수를 의미
  positionCount: number;  // 새로 추가: 명확한 포지션 수
  closedPositions: number;  // 클로즈된 포지션 수
  openedPositions: number;  // 오픈된 포지션 수
  winRate: number;
  volume: number;
  commission: number;
}

export interface CalendarSettings {
  viewMode: CalendarViewMode;
  period: CalendarPeriod;
  customRange?: [Dayjs | null, Dayjs | null];
  showPnL: boolean;
  showTradeCount: boolean;  // deprecated - 호환성 유지
  showPositionStats: boolean;  // 새로운 포지션 통계 표시
  showWinRate: boolean;
  showVolume: boolean;
  pnlDisplayMode?: 'currency' | 'percentage';  // 통화 또는 퍼센트 표시
  profitColor?: string;  // 수익 색상 (기본값: 녹색)
  lossColor?: string;    // 손실 색상 (기본값: 빨간색)
  heatmapDirection?: 'horizontal' | 'vertical';  // 히트맵 방향 (기본값: vertical)
}