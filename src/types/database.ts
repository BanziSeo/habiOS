// 데이터베이스에서 반환되는 raw 데이터 타입들

export interface DBPosition {
  id: string;
  account_id: string;
  ticker: string;
  ticker_name: string;
  status: 'ACTIVE' | 'CLOSED';
  open_date: string;
  close_date?: string;
  avg_buy_price: string;
  total_shares: number;
  max_shares: number;
  realized_pnl?: string;
  max_risk_amount?: string;
  setup_type?: string;
  entry_time?: string;
  rating?: number;
  memo?: string;
  created_at: string;
  updated_at: string;
  trades?: DBTrade[];
  stopLosses?: DBStopLoss[];
}

export interface DBTrade {
  id: string;
  position_id: string;
  account_id: string;
  ticker: string;
  ticker_name: string;
  trade_type: 'BUY' | 'SELL';
  quantity: number;
  price: string;
  commission: string;
  trade_date: string;
  trade_time?: string;
  broker_date?: string;
  broker_time?: string;
  created_at: string;
}

export interface DBStopLoss {
  id: string;
  position_id: string;
  stop_price: string;
  stop_quantity: number;
  stop_percentage: number;
  is_active: number; // SQLite boolean은 0/1
  created_at: string;
}