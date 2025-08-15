import type { Widget, LayoutItem } from './types';

// localStorage 키
export const STORAGE_KEYS = {
  WIDGET_LAYOUTS: 'journal1WidgetLayouts',
  HIDDEN_WIDGETS: 'journal1HiddenWidgets',
  HIDDEN_CARDS: 'journal1HiddenCards',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed'
} as const;

// 사이드바 너비
export const SIDEBAR_WIDTH = {
  COLLAPSED: 80,
  EXPANDED: 240
} as const;

// 모든 위젯 정의
export const ALL_WIDGETS: Widget[] = [
  { id: 'daily-risk-limit', title: 'Daily Risk Limit', type: 'daily-risk-limit' },
  { id: 'daily-pnl', title: 'Today\'s Realized P&L', type: 'daily-pnl' },
  { id: 'daily-notes', title: 'Daily Notes', type: 'daily-notes' },
  { id: 'today-trades', title: 'Today\'s Trades', type: 'today-trades' },
  // 카드형 메트릭 위젯 (최대 3개)
  { id: 'metrics-1', title: 'Metrics Cards 1', type: 'metrics' },
  { id: 'metrics-2', title: 'Metrics Cards 2', type: 'metrics' },
  { id: 'metrics-3', title: 'Metrics Cards 3', type: 'metrics' },
  // 테이블형 메트릭 위젯 (최대 3개)
  { id: 'metrics-table-1', title: 'Metrics Table 1', type: 'metrics-table' },
  { id: 'metrics-table-2', title: 'Metrics Table 2', type: 'metrics-table' },
  { id: 'metrics-table-3', title: 'Metrics Table 3', type: 'metrics-table' },
  // 달력 위젯 (최대 3개)
  { id: 'calendar-1', title: 'Calendar 1', type: 'calendar' },
  { id: 'calendar-2', title: 'Calendar 2', type: 'calendar' },
  { id: 'calendar-3', title: 'Calendar 3', type: 'calendar' },
  // Equity Curve 위젯
  { id: 'equity-curve-full', title: 'Equity Curve', type: 'equity-curve-full' },
  { id: 'equity-curve-mini', title: 'Equity Curve (Mini)', type: 'equity-curve-mini' },
  { id: 'positions', title: 'Positions', type: 'positions' },
];

// 반응형 레이아웃 - 작은 화면용
export const COMPACT_LAYOUTS: LayoutItem[] = [
  { i: 'daily-risk-limit', x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 8, maxW: 12, maxH: 50 },
  { i: 'daily-pnl', x: 6, y: 0, w: 6, h: 12, minW: 4, minH: 8, maxW: 12, maxH: 50 },
  { i: 'daily-notes', x: 0, y: 12, w: 12, h: 12, minW: 4, minH: 8, maxW: 12, maxH: 50 },
  { i: 'today-trades', x: 0, y: 24, w: 12, h: 15, minW: 4, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-1', x: 0, y: 39, w: 12, h: 15, minW: 4, minH: 10, maxW: 12, maxH: 50 },
  { i: 'positions', x: 0, y: 54, w: 12, h: 23, minW: 4, minH: 12, maxW: 12, maxH: 50 },
  // 추가 메트릭 위젯들은 기본적으로 숨김
  { i: 'metrics-2', x: 0, y: 77, w: 12, h: 15, minW: 4, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-3', x: 0, y: 92, w: 12, h: 15, minW: 4, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-table-1', x: 0, y: 107, w: 12, h: 15, minW: 1, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-table-2', x: 0, y: 122, w: 12, h: 15, minW: 1, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-table-3', x: 0, y: 137, w: 12, h: 15, minW: 1, minH: 10, maxW: 12, maxH: 50 },
  // 달력 위젯들 (기본적으로 숨김)
  { i: 'calendar-1', x: 0, y: 152, w: 12, h: 20, minW: 2, minH: 15, maxW: 12, maxH: 50 },
  { i: 'calendar-2', x: 0, y: 172, w: 12, h: 20, minW: 2, minH: 15, maxW: 12, maxH: 50 },
  { i: 'calendar-3', x: 0, y: 192, w: 12, h: 20, minW: 2, minH: 15, maxW: 12, maxH: 50 },
  // Equity Curve 위젯들 (기본적으로 숨김)
  { i: 'equity-curve-full', x: 0, y: 212, w: 12, h: 25, minW: 6, minH: 20, maxW: 12, maxH: 50 },
  { i: 'equity-curve-mini', x: 0, y: 237, w: 6, h: 15, minW: 3, minH: 10, maxW: 12, maxH: 50 },
];

// 반응형 레이아웃 - 큰 화면용
export const DEFAULT_LAYOUTS: LayoutItem[] = [
  // 상단 3개 위젯 (메트릭 카드 / 메트릭 테이블 / 오늘의 거래)
  { i: 'metrics-1', x: 0, y: 0, w: 4, h: 15, minW: 3, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-table-1', x: 4, y: 0, w: 4, h: 15, minW: 1, minH: 10, maxW: 12, maxH: 50 },
  { i: 'today-trades', x: 8, y: 0, w: 4, h: 15, minW: 3, minH: 10, maxW: 12, maxH: 50 },
  // 하단 포지션 테이블
  { i: 'positions', x: 0, y: 15, w: 12, h: 25, minW: 4, minH: 12, maxW: 12, maxH: 50 },
  // 숨겨진 위젯들 (나중에 표시할 때 위치)
  { i: 'daily-risk-limit', x: 0, y: 40, w: 3, h: 12, minW: 2, minH: 8, maxW: 12, maxH: 50 },
  { i: 'daily-pnl', x: 3, y: 40, w: 3, h: 12, minW: 2, minH: 8, maxW: 12, maxH: 50 },
  { i: 'daily-notes', x: 6, y: 40, w: 3, h: 12, minW: 2, minH: 8, maxW: 12, maxH: 50 },
  { i: 'metrics-2', x: 0, y: 52, w: 6, h: 15, minW: 4, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-3', x: 6, y: 52, w: 6, h: 15, minW: 4, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-table-2', x: 0, y: 67, w: 6, h: 15, minW: 1, minH: 10, maxW: 12, maxH: 50 },
  { i: 'metrics-table-3', x: 6, y: 67, w: 6, h: 15, minW: 1, minH: 10, maxW: 12, maxH: 50 },
  // 달력 위젯들 (기본적으로 숨김)
  { i: 'calendar-1', x: 0, y: 82, w: 4, h: 20, minW: 2, minH: 15, maxW: 12, maxH: 50 },
  { i: 'calendar-2', x: 4, y: 82, w: 4, h: 20, minW: 2, minH: 15, maxW: 12, maxH: 50 },
  { i: 'calendar-3', x: 8, y: 82, w: 4, h: 20, minW: 2, minH: 15, maxW: 12, maxH: 50 },
  // Equity Curve 위젯들 (기본적으로 숨김)
  { i: 'equity-curve-full', x: 0, y: 102, w: 6, h: 20, minW: 6, minH: 20, maxW: 12, maxH: 50 },
  { i: 'equity-curve-mini', x: 6, y: 102, w: 3, h: 12, minW: 3, minH: 10, maxW: 12, maxH: 50 },
];

// GridLayout 설정
export const GRID_CONFIG = {
  COLS: 12,
  ROW_HEIGHT: 20,
  MARGIN: [16, 16] as [number, number],
  CONTAINER_PADDING: [0, 0] as [number, number],
  DRAG_HANDLE: '.widget-drag-handle',
  DRAG_CANCEL: '.widget-no-drag'
} as const;