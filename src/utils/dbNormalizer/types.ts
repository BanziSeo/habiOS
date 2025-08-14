/**
 * DB Normalizer에서 사용하는 타입 정의
 * DB와 Frontend 간 변환 시 사용되는 중간 타입들
 */

/**
 * Position을 DB에 저장할 때 사용되는 타입
 * DB 필드명(snake_case)을 사용
 */
export interface DBPositionInput {
  id?: string;
  account_id?: string;
  ticker?: string;
  ticker_name?: string | null;
  status?: 'ACTIVE' | 'CLOSED';
  open_date?: string | null;
  close_date?: string | null;
  avg_buy_price?: string;
  total_shares?: number;
  max_shares?: number;
  realized_pnl?: string;
  max_risk_amount?: string | null;
  setup_type?: string | null;
  entry_time?: string | null;
  rating?: number | null;
  memo?: string | null;
}

/**
 * Trade를 DB에 저장할 때 사용되는 타입
 * DB 필드명(snake_case)을 사용
 */
export interface DBTradeInput {
  id?: string;
  position_id?: string;
  account_id?: string;
  ticker?: string;
  ticker_name?: string | null;
  trade_type?: 'BUY' | 'SELL';
  quantity?: number;
  price?: string;
  commission?: string;
  trade_date?: string | null;
  trade_time?: string | null;
  broker_date?: string | null;
  broker_time?: string | null;
  note?: string | null;  // Trade 타입에 없지만 DB에 있는 필드
}

/**
 * StopLoss를 DB에 저장할 때 사용되는 타입
 * DB 필드명(snake_case)을 사용
 */
export interface DBStopLossInput {
  id?: string;
  position_id?: string;
  stop_price?: string;
  stop_quantity?: number;
  stop_percentage?: number;
  input_mode?: 'percentage' | 'quantity';  // StopLoss 타입과 일치
  is_active?: number;  // SQLite boolean (0/1)
}

/**
 * Trade 타입의 확장 버전
 * DB normalizer에서 사용하는 추가 필드 포함
 */
export interface ExtendedTrade {
  positionId?: string;
  note?: string;
}

/**
 * StopLoss 타입의 확장 버전
 * DB normalizer에서 사용하는 추가 필드 포함
 */
export interface ExtendedStopLoss {
  inputMode?: 'percentage' | 'quantity';
}