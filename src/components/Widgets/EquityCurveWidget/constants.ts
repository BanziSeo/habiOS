import type { ChartSettings, BenchmarkOption, MovingAverage } from './types';

// 기본 이동평균선 설정
export const DEFAULT_MOVING_AVERAGES: MovingAverage[] = [
  { id: 'ma1', enabled: true, type: 'EMA', period: 10, color: '#ff0000', width: 1, lineStyle: 'dashed' },
  { id: 'ma2', enabled: true, type: 'EMA', period: 21, color: '#0000ff', width: 1, lineStyle: 'dashed' },
  { id: 'ma3', enabled: true, type: 'SMA', period: 50, color: '#ff8c00', width: 1, lineStyle: 'solid' },
  { id: 'ma4', enabled: true, type: 'SMA', period: 100, color: '#808080', width: 1, lineStyle: 'solid' },
  { id: 'ma5', enabled: true, type: 'SMA', period: 200, color: '#00ff00', width: 1, lineStyle: 'solid' }
];

// 기본 차트 설정
export const DEFAULT_CHART_SETTINGS: ChartSettings = {
  backgroundColor: '', // Design Token으로 자동 적용
  gridColor: '', // Design Token으로 자동 적용
  showGrid: true,
  portfolioLineColor: '#1890ff',
  portfolioLineWidth: 2,
  movingAverages: DEFAULT_MOVING_AVERAGES
};

// 벤치마크 옵션
export const BENCHMARK_OPTIONS: BenchmarkOption[] = [
  { value: 'SPY', label: 'S&P 500 (SPY)', color: '#5EEAD4' },
  { value: 'QQQ', label: 'NASDAQ 100 (QQQ)', color: '#F9A8BA' },
  { value: 'KOSPI', label: 'KOSPI', color: '#B8C5FF' },
  { value: 'KOSDAQ', label: 'KOSDAQ', color: '#A2B0F3' },
];

// 날짜 포맷
export const DATE_FORMAT = {
  DISPLAY: 'MMM DD, YYYY',
  DATA: 'YYYY-MM-DD'
};

// 차트 마진
export const CHART_MARGIN = { top: 5, right: 30, left: 20, bottom: 5 };

// 차트 높이
export const CHART_HEIGHT = 500;

// 초기 포트폴리오 값 (데이터가 없을 때 기본값)
export const INITIAL_PORTFOLIO_VALUE = 100;