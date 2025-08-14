// 차트 데이터 타입
export interface ChartData {
  date: string;
  portfolio: number;
  SPY?: number;
  QQQ?: number;
  KOSPI?: number;
  KOSDAQ?: number;
  displayDate: string;
  [key: string]: number | string | undefined; // 이동평균선을 위한 동적 키
}

// 이동평균선 설정
export interface MovingAverage {
  id: string;
  enabled: boolean;
  type: 'EMA' | 'SMA';
  period: number;
  color: string;
  width: number;
}

// 차트 설정
export interface ChartSettings {
  backgroundColor: string;
  gridColor: string;
  showGrid: boolean;
  portfolioLineColor: string;
  portfolioLineWidth: number;
  movingAverages: MovingAverage[];
}

// 통계 정보
export interface EquityStatistics {
  currentValue: number;
  initialValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
}

// 벤치마크 타입
export type BenchmarkType = 'SPY' | 'QQQ' | 'KOSPI' | 'KOSDAQ';

// 벤치마크 옵션
export interface BenchmarkOption {
  value: BenchmarkType;
  label: string;
  color: string;
}