/**
 * API 계층 간 데이터 타입 정의
 * 
 * 이 파일은 DB, API(IPC), Frontend 간의 데이터 계약을 명확히 정의합니다.
 * 
 * 명명 규칙:
 * - DB 레이어: snake_case (데이터베이스 컬럼명)
 * - API/Frontend 레이어: camelCase (JavaScript/TypeScript 표준)
 */

// ============================================
// 1. DB 레이어 타입 정의 (snake_case)
// ============================================

/**
 * positions 테이블 레코드
 */
export interface DBPositionRow {
  id: string;
  account_id: string;
  ticker: string;
  ticker_name?: string;
  status: 'ACTIVE' | 'CLOSED';
  open_date: string;
  close_date?: string;
  avg_buy_price: string;  // DB에서는 REAL이지만 문자열로 전달됨
  total_shares: number;
  max_shares: number;
  max_risk_amount?: string;
  realized_pnl: string;
  setup_type?: string;
  entry_time?: string;
  rating?: number;
  memo?: string;
  created_at: string;
  updated_at: string;
}

/**
 * stop_losses 테이블 레코드
 */
export interface DBStopLossRow {
  id: string;
  position_id: string;
  stop_price: string;
  stop_quantity: number;
  stop_percentage: number;
  is_active: number;  // SQLite boolean: 0 or 1
  created_at: string;
  updated_at: string;
}

/**
 * trades 테이블 레코드
 */
export interface DBTradeRow {
  id: string;
  account_id: string;
  ticker: string;
  ticker_name?: string;
  action: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
  trade_type?: string;  // action의 다른 이름
  quantity: number;
  price: string;
  commission: string;
  executed_at: string;
  trade_date: string;
  trade_time?: string;
  broker_date?: string;
  broker_time?: string;
  created_at: string;
  updated_at: string;
  note?: string;
}

/**
 * position_trades 관계 테이블 레코드
 */
export interface DBPositionTradeRow {
  position_id: string;
  trade_id: string;
  allocation_percentage: number;
}

/**
 * daily_plans 테이블 레코드
 */
export interface DBDailyPlanRow {
  id: string;
  date: string;
  content: string;
  mindset?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// 2. API/IPC 레이어 타입 정의 (camelCase)
// ============================================

/**
 * Position 데이터 전송 객체
 */
export interface PositionDTO {
  id: string;
  accountId: string;
  ticker: string;
  status: 'ACTIVE' | 'CLOSED';
  avgBuyPrice: number;
  totalShares: number;
  maxShares: number;
  maxRiskAmount?: number;
  realizedPnl: number;
  createdAt: Date;
  updatedAt: Date;
  // 관계 데이터
  stopLosses: StopLossDTO[];
  trades: TradeDTO[];
}

/**
 * StopLoss 데이터 전송 객체
 */
export interface StopLossDTO {
  id: string;
  positionId: string;
  stopPrice: number;
  stopQuantity: number;
  stopPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trade 데이터 전송 객체
 */
export interface TradeDTO {
  id: string;
  accountId: string;
  ticker: string;
  action: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
  quantity: number;
  price: number;
  commission: number;
  executedAt: Date;
  tradeDate: string;
  createdAt: Date;
  updatedAt: Date;
  note?: string;
}

/**
 * DailyPlan 데이터 전송 객체
 */
export interface DailyPlanDTO {
  id: string;
  date: string;
  content: string;
  mindset?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 3. API 요청/응답 타입
// ============================================

/**
 * 포지션 생성 요청
 */
export interface CreatePositionRequest {
  accountId: string;
  ticker: string;
  initialTrade: Omit<TradeDTO, 'id' | 'accountId' | 'ticker' | 'createdAt' | 'updatedAt'>;
}

/**
 * 스탑로스 업데이트 요청
 */
export interface UpdateStopLossesRequest {
  positionId: string;
  stopLosses: Array<{
    stopPrice: number;
    stopQuantity: number;
    stopPercentage: number;
  }>;
  setAsInitialR?: boolean;
}

/**
 * 트레이드 생성 요청
 */
export interface CreateTradeRequest {
  accountId: string;
  ticker: string;
  action: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
  quantity: number;
  price: number;
  commission: number;
  executedAt: Date;
  note?: string;
  positionId?: string;
}

// ============================================
// 4. 유틸리티 타입
// ============================================

/**
 * DB Row를 DTO로 변환하는 매핑 타입
 */
export type DBToDTO<T> = 
  T extends DBPositionRow ? PositionDTO :
  T extends DBStopLossRow ? StopLossDTO :
  T extends DBTradeRow ? TradeDTO :
  T extends DBDailyPlanRow ? DailyPlanDTO :
  never;

/**
 * 부분 업데이트를 위한 타입
 */
export type PartialUpdate<T> = {
  [P in keyof T]?: T[P];
};

/**
 * snake_case를 camelCase로 변환하는 타입 (타입 레벨)
 */
export type SnakeToCamelCase<S extends string> = 
  S extends `${infer T}_${infer U}` 
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

/**
 * 객체의 모든 키를 camelCase로 변환하는 타입
 */
export type CamelCaseKeys<T> = {
  [K in keyof T as SnakeToCamelCase<string & K>]: T[K];
};