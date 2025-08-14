import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { MigrationManager } from './MigrationManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseManager {
  private db: Database.Database;
  private writeQueue: Array<() => void> = [];
  private isWriting = false;
  private readonly MAX_QUEUE_SIZE = 1000; // 큐 최대 크기 제한
  private readonly MAX_RETRIES = 3; // 최대 재시도 횟수
  private readonly RETRY_DELAY = 1000; // 재시도 지연 시간 (ms)

  constructor(dbPath?: string) {
    // 데이터베이스 파일 경로 설정
    const userDataPath = app.getPath('userData');
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const dbFileName = isDev ? 'tradeslog-dev.db' : 'tradeslog.db';
    const dbFilePath = dbPath || path.join(userDataPath, dbFileName);
    
    // 디렉토리가 없으면 생성
    const dbDir = path.dirname(dbFilePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 데이터베이스 연결 (재시도 로직 포함)
    this.db = this.connectWithRetry(dbFilePath);
    
    // WAL 모드로 동시성 향상
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('synchronous = NORMAL');
    
    // 마이그레이션 실행
    const migrationManager = new MigrationManager(this.db);
    migrationManager.migrate();
    
    // 앱 종료 시 정리
    app.on('before-quit', async (event) => {
      event.preventDefault();
      await this.close();
      app.exit();
    });
    
    // 비정상 종료 대비
    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }

  private connectWithRetry(dbFilePath: string): Database.Database {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`데이터베이스 연결 시도 (${attempt}/${this.MAX_RETRIES}): ${dbFilePath}`);
        const db = new Database(dbFilePath);
        
        // 연결 테스트
        db.prepare('SELECT 1').get();
        
        console.log('데이터베이스 연결 성공');
        return db;
      } catch (error) {
        lastError = error as Error;
        console.error(`데이터베이스 연결 실패 (시도 ${attempt}/${this.MAX_RETRIES}):`, error);
        
        if (attempt < this.MAX_RETRIES) {
          console.log(`${this.RETRY_DELAY}ms 후 재시도...`);
          // 동기적 대기 (생성자에서는 비동기를 사용할 수 없음)
          const start = Date.now();
          while (Date.now() - start < this.RETRY_DELAY) {
            // 대기
          }
        }
      }
    }
    
    throw new Error(`데이터베이스 연결 실패: ${lastError?.message || 'Unknown error'}`);
  }

  private initializeSchema() {
    // 스키마를 직접 문자열로 포함
    const schema = `
-- 계정 테이블
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_type TEXT CHECK(account_type IN ('US', 'KR')) NOT NULL,
    currency TEXT CHECK(currency IN ('USD', 'KRW')) NOT NULL,
    initial_balance REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 거래 테이블
CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    ticker TEXT NOT NULL,
    trade_type TEXT CHECK(trade_type IN ('BUY', 'SELL')) NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    commission REAL DEFAULT 0,
    trade_date DATETIME NOT NULL,
    trade_time TEXT,
    broker_date TEXT,
    broker_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 포지션 테이블
CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY, -- 형식: YYYYMMDD_HHMMSS_TICKER
    account_id TEXT NOT NULL,
    ticker TEXT NOT NULL,
    status TEXT CHECK(status IN ('ACTIVE', 'CLOSED')) NOT NULL,
    open_date DATETIME NOT NULL,
    close_date DATETIME,
    avg_buy_price REAL NOT NULL,
    total_shares INTEGER NOT NULL,
    max_shares INTEGER NOT NULL, -- Max Size 계산용
    realized_pnl REAL DEFAULT 0,
    max_risk_amount REAL DEFAULT NULL, -- Initial R (최대 리스크 금액)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 포지션-거래 연결 테이블
CREATE TABLE IF NOT EXISTS position_trades (
    position_id TEXT NOT NULL,
    trade_id TEXT NOT NULL,
    PRIMARY KEY (position_id, trade_id),
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
);

-- 스탑로스 테이블
CREATE TABLE IF NOT EXISTS stop_losses (
    id TEXT PRIMARY KEY,
    position_id TEXT NOT NULL,
    stop_price REAL NOT NULL,
    stop_quantity INTEGER NOT NULL,
    stop_percentage REAL NOT NULL, -- 전체 포지션 대비 비율
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
);

-- Equity Curve 테이블
CREATE TABLE IF NOT EXISTS equity_curve (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_value REAL NOT NULL,
    cash_value REAL NOT NULL,
    stock_value REAL NOT NULL,
    daily_pnl REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, date),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 설정 테이블
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 일일 계획 테이블
CREATE TABLE IF NOT EXISTS daily_plans (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    plan_date DATE NOT NULL,
    daily_risk_limit REAL NOT NULL DEFAULT 1000,
    watchlist TEXT, -- JSON 형태로 티커 배열 저장
    notes TEXT,
    mood_check TEXT,
    market_notes TEXT,
    checklist TEXT, -- JSON 형태로 체크리스트 저장
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, plan_date),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 일일 계획 실행 기록 테이블
CREATE TABLE IF NOT EXISTS daily_plan_results (
    id TEXT PRIMARY KEY,
    daily_plan_id TEXT NOT NULL,
    actual_pnl REAL DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    loss_count INTEGER DEFAULT 0,
    max_drawdown REAL DEFAULT 0,
    risk_limit_breached BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (daily_plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_trade_date ON trades(trade_date);
CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker);
CREATE INDEX IF NOT EXISTS idx_positions_account_id ON positions(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
CREATE INDEX IF NOT EXISTS idx_stop_losses_position_id ON stop_losses(position_id);
CREATE INDEX IF NOT EXISTS idx_equity_curve_account_date ON equity_curve(account_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_account_date ON daily_plans(account_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(plan_date);
    `;
    
    // 스키마 실행
    this.db.exec(schema);
    
    // 마이그레이션: max_risk_amount 컬럼 추가 (기존 DB 대응)
    try {
      this.db.exec(`
        ALTER TABLE positions ADD COLUMN max_risk_amount REAL DEFAULT NULL;
      `);
    } catch (error) {
      // 컬럼이 이미 존재하는 경우 무시
      if (!error.message.includes('duplicate column name')) {
        console.error('Migration error:', error);
      }
    }
  }

  // Write 작업 큐잉
  async executeWrite<T>(fn: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
      // 큐 크기 확인
      if (this.writeQueue.length >= this.MAX_QUEUE_SIZE) {
        reject(new Error(`Write queue is full (${this.MAX_QUEUE_SIZE} operations pending)`));
        return;
      }
      
      this.writeQueue.push(() => {
        try {
          const result = fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isWriting || this.writeQueue.length === 0) return;
    
    this.isWriting = true;
    const task = this.writeQueue.shift();
    
    try {
      task?.();
    } finally {
      this.isWriting = false;
      // 다음 작업 처리
      setImmediate(() => this.processQueue());
    }
  }

  // 트랜잭션 래퍼
  transaction<T>(fn: () => T): T {
    const transaction = this.db.transaction(fn);
    return transaction.immediate();
  }

  // 기본 쿼리 메서드들 - 제네릭 타입 적용
  query<T = unknown>(sql: string, params?: unknown[]): T[] {
    const stmt = this.db.prepare(sql);
    if (!params || params.length === 0) {
      return stmt.all() as T[];
    }
    return stmt.all.apply(stmt, params) as T[];
  }

  queryOne<T = unknown>(sql: string, params?: unknown[]): T | undefined {
    const stmt = this.db.prepare(sql);
    if (!params || params.length === 0) {
      return stmt.get() as T | undefined;
    }
    // Better-SQLite3는 spread 연산자로 파라미터를 전달해야 함
    return stmt.get(...params) as T | undefined;
  }

  execute(sql: string, params?: unknown[]): Database.RunResult {
    const stmt = this.db.prepare(sql);
    if (!params || params.length === 0) {
      return stmt.run();
    }
    return stmt.run.apply(stmt, params);
  }

  // 일괄 처리
  executeBatch(sql: string, paramsArray: unknown[][]): void {
    const stmt = this.db.prepare(sql);
    const batch = this.db.transaction((items) => {
      for (const params of items) {
        stmt.run(...params);
      }
    });
    batch(paramsArray);
  }

  // 데이터베이스 무결성 검사
  async checkIntegrity(): Promise<boolean> {
    try {
      const result = this.db.pragma('integrity_check');
      return result[0].integrity_check === 'ok';
    } catch (error) {
      console.error('Database integrity check failed:', error);
      return false;
    }
  }

  // 백업
  backup(backupPath: string): void {
    this.db.backup(backupPath);
  }

  // 복구
  restore(backupPath: string): void {
    if (fs.existsSync(backupPath)) {
      this.close();
      fs.copyFileSync(backupPath, this.db.name);
      this.db = new Database(this.db.name);
      console.log('Database restored from backup');
    }
  }

  async close() {
    // 모든 쓰기 작업 완료 대기
    if (this.writeQueue.length > 0) {
      console.log(`Waiting for ${this.writeQueue.length} pending writes...`);
      
      // 모든 작업이 완료될 때까지 대기 (최대 10초)
      const maxWaitTime = 10000;
      const startTime = Date.now();
      
      while (this.writeQueue.length > 0 || this.isWriting) {
        if (Date.now() - startTime > maxWaitTime) {
          console.warn('Timeout waiting for write queue to empty');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // WAL 체크포인트
    this.db.pragma('wal_checkpoint(TRUNCATE)');
    this.db.close();
  }

  reconnect() {
    // DB 경로 저장
    const dbPath = this.db.name;
    
    // 기존 DB 닫기
    try {
      this.db.close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
    
    // 새 DB 연결 (재시도 로직 포함)
    this.db = this.connectWithRetry(dbPath);
    
    // WAL 모드로 동시성 향상
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('synchronous = NORMAL');
    
    console.log('Database reconnected');
  }

  getDatabase() {
    return this.db;
  }
}

// 싱글톤 인스턴스
let databaseInstance: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!databaseInstance) {
    databaseInstance = new DatabaseManager();
  }
  return databaseInstance;
}

// DB 재연결을 위한 export
export function reconnectDatabase() {
  if (databaseInstance) {
    databaseInstance.reconnect();
  }
}

// DB 닫기를 위한 export
export function closeDatabase() {
  if (databaseInstance) {
    databaseInstance.close();
  }
}