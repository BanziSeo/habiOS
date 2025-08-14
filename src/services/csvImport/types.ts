import type { Trade, Position } from '../../types';
import { Decimal } from 'decimal.js';

export interface CSVImportRow {
  거래일자: string;
  종목코드: string;
  종목명: string;
  매매구분: '매수' | '매도';
  체결수량: string;
  체결단가: string;
  체결금액: string;
  체결시간: string;
}

export interface ImportResult {
  trades: Trade[];
  positions: Position[];
  positionTradeMap: Record<string, string[]>;
  errors: string[];
  needsExistingData?: boolean;
}

export interface ExistingData {
  positions: Position[];
  trades: Trade[];
}

export interface EquityCurvePoint {
  date: Date;
  totalValue: Decimal;
  cashValue: Decimal;
  stockValue: Decimal;
  dailyPnl: Decimal;
}

export type ImportType = 'FULL' | 'APPEND';