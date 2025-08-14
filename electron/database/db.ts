import { getDatabase, closeDatabase, reconnectDatabase } from './DatabaseManager';
import crypto from 'crypto';

const dbInstance = getDatabase();

export const db = {
  query: dbInstance.query.bind(dbInstance),
  queryOne: dbInstance.queryOne.bind(dbInstance),
  execute: dbInstance.execute.bind(dbInstance),
  executeBatch: dbInstance.executeBatch.bind(dbInstance),
  transaction: dbInstance.transaction.bind(dbInstance),
  checkIntegrity: dbInstance.checkIntegrity.bind(dbInstance),
  backup: dbInstance.backup.bind(dbInstance),
  restore: dbInstance.restore.bind(dbInstance),
  getDatabase: dbInstance.getDatabase.bind(dbInstance),
  close: closeDatabase,
  reconnect: reconnectDatabase
};

// 각 테이블별로 업데이트 가능한 필드를 화이트리스트로 정의
const ALLOWED_UPDATE_FIELDS = {
  accounts: ['name', 'account_type', 'currency', 'initial_balance'],
  positions: ['status', 'close_date', 'avg_buy_price', 'total_shares', 'max_shares', 'realized_pnl', 'setup_type', 'rating', 'memo'],
  trades: ['ticker', 'trade_type', 'quantity', 'price', 'commission', 'trade_date', 'trade_time'],
  stop_losses: ['stop_price', 'stop_quantity', 'stop_percentage', 'is_active'],
  settings: ['value']
};

// 안전한 업데이트 함수 생성
function createSafeUpdateQuery(tableName: keyof typeof ALLOWED_UPDATE_FIELDS, updates: Record<string, unknown>) {
  const allowedFields = ALLOWED_UPDATE_FIELDS[tableName];
  const safeUpdates: Record<string, unknown> = {};
  
  // 화이트리스트에 있는 필드만 필터링
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      safeUpdates[key] = updates[key];
    }
  }
  
  if (Object.keys(safeUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const fields = Object.keys(safeUpdates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(safeUpdates);
  
  return { fields, values };
}

// 계정 관련 쿼리
export const accountQueries = {
  create: (account: {
    name: string;
    accountType: 'US' | 'KR';
    currency: 'USD' | 'KRW';
    initialBalance?: number;
  }) => {
    const id = crypto.randomUUID();
    return db.execute(
      `INSERT INTO accounts (id, name, account_type, currency, initial_balance) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, account.name, account.accountType, account.currency, account.initialBalance || 0]
    );
  },

  getAll: () => {
    return db.query('SELECT * FROM accounts ORDER BY created_at DESC');
  },

  getById: (id: string) => {
    return db.queryOne('SELECT * FROM accounts WHERE id = ?', [id]);
  },

  update: (id: string, updates: Record<string, unknown>) => {
    try {
      const { fields, values } = createSafeUpdateQuery('accounts', updates);
      return db.execute(
        `UPDATE accounts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
    } catch (error) {
      console.error('Invalid update fields for accounts:', error);
      throw error;
    }
  },

  delete: (id: string) => {
    return db.execute('DELETE FROM accounts WHERE id = ?', [id]);
  }
};

// 거래 관련 쿼리
export const tradeQueries = {
  create: (trade: {
    id?: string; // ID가 있으면 사용, 없으면 생성
    accountId: string;
    ticker: string;
    tradeType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    commission: number;
    tradeDate: string;
    tradeTime?: string;
    brokerDate?: string;
    brokerTime?: string;
  }) => {
    const id = trade.id || crypto.randomUUID();
    return db.execute(
      `INSERT INTO trades (id, account_id, ticker, ticker_name, trade_type, quantity, price, commission, trade_date, trade_time, broker_date, broker_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, trade.accountId, trade.ticker, trade.tickerName || null, trade.tradeType, trade.quantity, 
       trade.price, trade.commission, trade.tradeDate, trade.tradeTime || null,
       trade.brokerDate || null, trade.brokerTime || null]
    );
  },

  getByAccount: (accountId: string) => {
    return db.query(
      'SELECT * FROM trades WHERE account_id = ? ORDER BY trade_date DESC, trade_time DESC',
      [accountId]
    );
  },

  getByPosition: (positionId: string) => {
    return db.query(
      `SELECT t.* FROM trades t 
       JOIN position_trades pt ON t.id = pt.trade_id 
       WHERE pt.position_id = ? 
       ORDER BY t.trade_date, t.trade_time`,
      [positionId]
    );
  }
};

// 포지션 관련 쿼리
export const positionQueries = {
  create: (position: {
    id: string; // YYYYMMDD_HHMMSS_TICKER 형식
    accountId: string;
    ticker: string;
    status: 'ACTIVE' | 'CLOSED';
    openDate: string;
    closeDate?: string;
    avgBuyPrice: number;
    totalShares: number;
    maxShares: number;
    realizedPnl: number;
    entryTime?: string; // 포지션 진입 시간
  }) => {
    return db.execute(
      `INSERT INTO positions (id, account_id, ticker, ticker_name, status, open_date, close_date, 
        avg_buy_price, total_shares, max_shares, realized_pnl, entry_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [position.id, position.accountId, position.ticker, position.tickerName || null, position.status, 
       position.openDate, position.closeDate || null, position.avgBuyPrice, 
       position.totalShares, position.maxShares, position.realizedPnl,
       position.entryTime || null]
    );
  },

  getByAccount: (accountId: string, status?: 'ACTIVE' | 'CLOSED') => {
    let query = 'SELECT * FROM positions WHERE account_id = ?';
    const params: unknown[] = [accountId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY CASE WHEN status = \'ACTIVE\' THEN 0 ELSE 1 END, open_date DESC';
    
    return db.query(query, params);
  },

  update: (id: string, updates: Record<string, unknown>) => {
    try {
      const { fields, values } = createSafeUpdateQuery('positions', updates);
      return db.execute(
        `UPDATE positions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
    } catch (error) {
      console.error('Invalid update fields for positions:', error);
      throw error;
    }
  },

  linkTrade: (positionId: string, tradeId: string) => {
    return db.execute(
      'INSERT INTO position_trades (position_id, trade_id) VALUES (?, ?)',
      [positionId, tradeId]
    );
  },

  getById: (id: string) => {
    return db.queryOne('SELECT * FROM positions WHERE id = ?', [id]);
  },

  updateMaxRiskAmount: (id: string, maxRiskAmount: number) => {
    return db.execute(
      'UPDATE positions SET max_risk_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [maxRiskAmount, id]
    );
  }
};

// 스탑로스 관련 쿼리
export const stopLossQueries = {
  create: (stopLoss: {
    positionId: string;
    stopPrice: number;
    stopQuantity: number;
    stopPercentage: number;
    inputMode?: 'percentage' | 'quantity';
  }) => {
    const id = crypto.randomUUID();
    return db.execute(
      `INSERT INTO stop_losses (id, position_id, stop_price, stop_quantity, stop_percentage, input_mode) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, stopLoss.positionId, stopLoss.stopPrice, stopLoss.stopQuantity, stopLoss.stopPercentage, stopLoss.inputMode || 'percentage']
    );
  },

  getByPosition: (positionId: string) => {
    return db.query(
      'SELECT * FROM stop_losses WHERE position_id = ? AND is_active = 1 ORDER BY stop_price DESC',
      [positionId]
    );
  },

  update: (id: string, updates: Record<string, unknown>) => {
    try {
      const { fields, values } = createSafeUpdateQuery('stop_losses', updates);
      return db.execute(
        `UPDATE stop_losses SET ${fields} WHERE id = ?`,
        [...values, id]
      );
    } catch (error) {
      console.error('Invalid update fields for stop_losses:', error);
      throw error;
    }
  },

  deactivate: (id: string) => {
    return db.execute('UPDATE stop_losses SET is_active = 0 WHERE id = ?', [id]);
  },

  deleteByPosition: (positionId: string) => {
    return db.execute('DELETE FROM stop_losses WHERE position_id = ?', [positionId]);
  }
};

// Equity Curve 관련 쿼리
export const equityCurveQueries = {
  create: (data: {
    accountId: string;
    date: string;
    totalValue: number;
    cashValue: number;
    stockValue: number;
    dailyPnl: number;
  }) => {
    return db.execute(
      `INSERT INTO equity_curve (account_id, date, total_value, cash_value, stock_value, daily_pnl) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(account_id, date) DO UPDATE SET
         total_value = excluded.total_value,
         cash_value = excluded.cash_value,
         stock_value = excluded.stock_value,
         daily_pnl = excluded.daily_pnl`,
      [data.accountId, data.date, data.totalValue, data.cashValue, data.stockValue, data.dailyPnl]
    );
  },

  getByAccount: (accountId: string, startDate?: string, endDate?: string) => {
    let query = 'SELECT * FROM equity_curve WHERE account_id = ?';
    const params: unknown[] = [accountId];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY date';
    
    const results = db.query(query, params);
    
    // 디버깅: 주말 날짜 확인
    console.log('\n=== Equity Curve Database Data ===');
    results.forEach((row) => {
      const date = new Date(row.date);
      const dayOfWeek = date.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`WEEKEND FOUND: ${row.date} (${dayName}) - Total Value: ${row.total_value}`);
      }
    });
    console.log(`Total equity curve entries: ${results.length}`);
    console.log('=================================\n');
    
    return results;
  },
  
  getLatestByAccount: (accountId: string) => {
    return db.queryOne(
      'SELECT * FROM equity_curve WHERE account_id = ? ORDER BY date DESC LIMIT 1',
      [accountId]
    );
  },
  
  // 디버깅용: 특정 날짜 범위의 데이터 확인
  debugWeekendData: (accountId: string) => {
    const query = `
      SELECT date, 
             strftime('%w', date) as day_of_week,
             CASE strftime('%w', date) 
               WHEN '0' THEN 'Sunday'
               WHEN '1' THEN 'Monday'
               WHEN '2' THEN 'Tuesday'
               WHEN '3' THEN 'Wednesday'
               WHEN '4' THEN 'Thursday'
               WHEN '5' THEN 'Friday'
               WHEN '6' THEN 'Saturday'
             END as day_name,
             total_value
      FROM equity_curve 
      WHERE account_id = ?
      AND (strftime('%w', date) = '0' OR strftime('%w', date) = '6'
           OR date IN ('2024-06-28', '2024-06-29', '2024-06-30',
                       '2024-07-26', '2024-07-27', '2024-07-28'))
      ORDER BY date
    `;
    
    const results = db.query(query, [accountId]);
    console.log('\n=== Weekend Debug Data ===');
    console.log('Checking dates around weekends and actual weekend dates:');
    results.forEach((row) => {
      console.log(`${row.date} (${row.day_name}) - Total Value: ${row.total_value}`);
    });
    console.log('========================\n');
    
    return results;
  }
};

// 설정 관련 쿼리
export const settingsQueries = {
  set: (key: string, value: unknown) => {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return db.execute(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [key, valueStr]
    );
  },

  get: (key: string) => {
    const result = db.queryOne('SELECT value FROM settings WHERE key = ?', [key]);
    if (!result) return null;
    
    try {
      return JSON.parse(result.value);
    } catch {
      return result.value;
    }
  },

  getAll: () => {
    const results = db.query('SELECT * FROM settings');
    return results.reduce((acc: Record<string, unknown>, row) => {
      try {
        acc[row.key] = JSON.parse(row.value);
      } catch {
        acc[row.key] = row.value;
      }
      return acc;
    }, {});
  }
};

// 데이터베이스 초기화 함수
export async function initDatabase() {
  // initial_balance 컬럼이 없으면 추가
  try {
    db.execute('ALTER TABLE accounts ADD COLUMN initial_balance REAL DEFAULT 0');
    console.log('Added initial_balance column to accounts table');
  } catch (err) {
    // 이미 컬럼이 존재하면 무시
    if (!err.message.includes('duplicate column name')) {
      console.error('Failed to add initial_balance column:', err);
    }
  }

  // 기본 계정 생성 (없는 경우)
  const existingAccount = db.queryOne('SELECT * FROM accounts WHERE id = ?', ['default-account']);
  if (!existingAccount) {
    db.execute(
      `INSERT INTO accounts (id, name, account_type, currency, initial_balance)
       VALUES (?, ?, ?, ?, ?)`,
      ['default-account', 'Default Account', 'US', 'USD', 0]
    );
    console.log('Default account created');
  }
  
  // 기본 설정 초기화
  const defaultSettings = {
    theme: 'light',
    currency: 'USD',
    buyCommission: 0.0025,
    sellCommission: 0.0025,
    chartType: 'candle',
    chartCandles: 100,
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = settingsQueries.get(key);
    if (!existing) {
      settingsQueries.set(key, value);
    }
  }
}