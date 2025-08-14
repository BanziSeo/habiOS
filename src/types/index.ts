import { Decimal } from 'decimal.js';

// 계정 타입
export interface Account {
  id: string;
  name: string;
  accountType: 'US' | 'KR';
  currency: 'USD' | 'KRW';
  initialBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

// 거래 타입
export interface Trade {
  id: string;
  accountId: string;
  ticker: string;
  tickerName?: string;
  tradeType: 'BUY' | 'SELL';
  quantity: number;
  price: Decimal;
  commission: Decimal;
  tradeDate: Date;
  tradeTime?: string;
  brokerDate?: string; // 영웅문 표기 날짜 (YYYY-MM-DD)
  brokerTime?: string; // 영웅문 표기 시간 (HH:MM:SS)
  createdAt: Date;
}

// 포지션 타입
export interface Position {
  id: string; // YYYYMMDD_HHMMSS_TICKER
  accountId: string;
  ticker: string;
  tickerName?: string;
  status: 'ACTIVE' | 'CLOSED';
  openDate: Date;
  closeDate?: Date | null;
  avgBuyPrice: Decimal;
  totalShares: number;
  maxShares: number;
  realizedPnl: Decimal;
  maxRiskAmount?: Decimal; // Initial R (최대 리스크 금액)
  trades: Trade[];
  stopLosses: StopLoss[];
  // 분석용 필드
  setupType?: string;
  entryTime?: Date;
  rating?: number; // 1-5
  memo?: string;
  // 계산된 메트릭
  currentPrice?: Decimal;
  marketValue?: Decimal;
  unrealizedPnl?: Decimal;
  totalPnl?: Decimal;
  size?: number; // 총자산 대비 %
  maxSize?: number; // 총자산 대비 최대 %
  initialR?: Decimal;
  rMultiple?: number;
  pureRisk?: number;
  totalRisk?: number;
}

// 스탑로스 타입
export interface StopLoss {
  id: string;
  positionId: string;
  stopPrice: Decimal;
  stopQuantity: number;
  stopPercentage: number;
  inputMode?: 'percentage' | 'quantity'; // 사용자가 입력한 방식
  isActive: boolean;
  createdAt: Date;
}

// 일일 계획 타입
export interface DailyPlan {
  id?: string;
  accountId: string;
  planDate: string; // YYYY-MM-DD
  dailyRiskLimit: number;
  watchlist: string[];
  notes: string;
  moodCheck?: string;
  marketNotes?: string;
  checklist?: Array<{ text: string; checked: boolean }>;
  createdAt?: Date;
  updatedAt?: Date;
}

// 일일 계획 결과 타입
export interface DailyPlanResult {
  id?: string;
  dailyPlanId: string;
  actualPnl: number;
  tradesCount: number;
  winCount: number;
  lossCount: number;
  maxDrawdown: number;
  riskLimitBreached: boolean;
  notes?: string;
}

// CSV 임포트 타입
export interface CSVImportRow {
  계좌번호?: string;
  종목코드: string;
  종목명: string;
  매매구분: '매수' | '매도';
  체결수량: string;
  체결단가: string;
  체결금액: string;
  체결시간?: string;
  거래일자: string;
}

// 차트 설정 타입
export interface ChartSettings {
  chartType: 'candle' | 'hollow' | 'bar';
  candleColors: {
    up: string;
    down: string;
  };
  volumeColors: {
    up: string;
    down: string;
  };
  movingAverages: Array<{
    period: number;
    color: string;
    thickness: number;
  }>;
  viewport: number; // 초기 캔들 개수
  margins: {
    top: number;
    bottom: number;
    right: number;
  };
}

// Equity Curve 데이터 타입
export interface EquityCurveData {
  date: Date;
  totalValue: Decimal;
  cashValue?: Decimal;
  stockValue?: Decimal;
  dailyPnl: Decimal;
}

// Equity Curve DB 타입
export interface EquityCurve {
  id: number;
  account_id: number | string;
  date: string;
  total_value: string;
  cash_value?: string;
  stock_value?: string;
  daily_pnl: string;
  created_at?: string;
}