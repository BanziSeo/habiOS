import type { 
  DBPositionRow, 
  DBTradeRow, 
  DBStopLossRow,
  CreateTradeRequest,
  UpdateStopLossesRequest 
} from './api';
import type { Account, CSVImportData } from './index';

// 데이터베이스 쿼리 결과 타입
interface QueryResult<T> {
  rows: T[];
  changes?: number;
  lastInsertRowid?: number;
}

// 다이얼로그 옵션 타입
interface FileDialogOptions {
  title?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
}

// 설정값 타입
type SettingsValue = string | number | boolean | Record<string, unknown>;

export interface ElectronAPI {
  database: {
    query: <T = unknown>(sql: string, params?: (string | number | null)[]) => Promise<QueryResult<T>>;
    execute: (sql: string, params?: (string | number | null)[]) => Promise<{
      changes: number;
      lastInsertRowid: number;
    }>;
    backup: () => Promise<{
      success: boolean;
      filePath?: string;
      error?: string;
    }>;
    restore: () => Promise<{
      success: boolean;
      cancelled?: boolean;
      error?: string;
    }>;
  };
  csv: {
    import: (data: CSVImportData) => Promise<{
      success: boolean;
      imported: number;
      errors?: string[];
      savedTradesCount?: number;
      skippedTradesCount?: number;
      savedPositionsCount?: number;
      skippedPositionsCount?: number;
    }>;
  };
  dialog: {
    openFile: (options?: FileDialogOptions) => Promise<string | null>;
  };
  account: {
    create: (account: {
      name: string;
      accountType: 'US' | 'KR';
      currency: 'USD' | 'KRW';
      initialBalance: number;
    }) => Promise<Account>;
    getAll: () => Promise<Account[]>;
    getById: (id: string) => Promise<Account | null>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  trades: {
    create: (trade: CreateTradeRequest) => Promise<DBTradeRow>;
    getByAccount: (accountId: string) => Promise<DBTradeRow[]>;
  };
  positions: {
    getByAccount: (accountId: string, status?: 'ACTIVE' | 'CLOSED') => Promise<Array<
      DBPositionRow & {
        trades: DBTradeRow[];
        stopLosses: DBStopLossRow[];
      }
    >>;
    getById: (positionId: string) => Promise<DBPositionRow & {
      trades: DBTradeRow[];
      stopLosses: DBStopLossRow[];
    } | null>;
    update: (positionId: string, updates: Partial<{
      ticker_name: string;
      status: 'ACTIVE' | 'CLOSED';
      setup_type: string;
      rating: number;
      memo: string;
    }>) => Promise<{ success: boolean }>;
    updateInitialR: (positionId: string, initialR: number) => Promise<{ success: boolean }>;
  };
  stopLoss: {
    update: (positionId: string, stopLosses: UpdateStopLossesRequest['stopLosses']) => Promise<void>;
  };
  settings: {
    get: (key: string) => Promise<SettingsValue | null>;
    set: (key: string, value: SettingsValue) => Promise<{ success: boolean }>;
    getAll: () => Promise<Record<string, SettingsValue>>;
  };
  equityCurve: {
    getLatest: (accountId: string) => Promise<{
      id: string;
      account_id: string;
      date: string;
      total_value: number;
      cash_value: number;
      stock_value: number;
      daily_pnl: number;
    } | null>;
    getByAccount: (accountId: string) => Promise<Array<{
      id: number;
      account_id: number;
      date: string;
      total_value: string;
      cash_value: string;
      stock_value: string;
      daily_pnl: string;
    }>>;
  };
  benchmark: {
    fetch: (symbols: string[], startDate: string, endDate: string) => Promise<{
      [key: string]: Array<{
        date: string;
        value: number;
        symbol: string;
      }>;
    }>;
  };
  fetchPriceData: (symbol: string, days?: number, interval?: string) => Promise<{
    success: boolean;
    symbol?: string;
    data?: Array<{
      timestamp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
    error?: string;
  }>;
  dailyPlan: {
    get: (accountId: string, planDate: string) => Promise<import('./index').DailyPlan | null>;
    save: (plan: import('./index').DailyPlan) => Promise<import('./index').DailyPlan>;
    listByMonth: (accountId: string, year: number, month: number) => Promise<import('./index').DailyPlan[]>;
    delete: (accountId: string, planDate: string) => Promise<void>;
    saveResult: (result: import('./index').DailyPlanResult) => Promise<void>;
  };
  auth: {
    loginDiscord: () => Promise<{
      success: boolean;
      user?: {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
      };
      error?: string;
    }>;
    checkToken: () => Promise<{
      valid: boolean;
      user?: {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
      };
      reason?: string;
    }>;
    logout: () => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};