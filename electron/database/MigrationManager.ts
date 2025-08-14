import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
  down?: (db: Database.Database) => void;
}

export class MigrationManager {
  private db: Database.Database;
  private migrations: Migration[] = [];

  constructor(db: Database.Database) {
    this.db = db;
    this.initializeMigrationsTable();
    this.loadMigrations();
  }

  private initializeMigrationsTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private loadMigrations() {
    // 마이그레이션들을 여기에 정의
    this.migrations = [
      {
        version: 1,
        name: 'initial_schema',
        up: (db) => {
          db.exec(`
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
                ticker_name TEXT,
                trade_type TEXT CHECK(trade_type IN ('BUY', 'SELL')) NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                commission REAL DEFAULT 0,
                trade_date DATETIME NOT NULL,
                trade_time TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );

            -- 포지션 테이블
            CREATE TABLE IF NOT EXISTS positions (
                id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                ticker TEXT NOT NULL,
                ticker_name TEXT,
                status TEXT CHECK(status IN ('ACTIVE', 'CLOSED')) NOT NULL,
                open_date DATETIME NOT NULL,
                close_date DATETIME,
                avg_buy_price REAL NOT NULL,
                total_shares INTEGER NOT NULL,
                max_shares INTEGER NOT NULL,
                realized_pnl REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );

            -- 포지션-거래 연결 테이블
            CREATE TABLE IF NOT EXISTS position_trades (
                position_id TEXT NOT NULL,
                trade_id TEXT NOT NULL,
                PRIMARY KEY (position_id, trade_id),
                FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
                FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE
            );

            -- 스탑로스 테이블
            CREATE TABLE IF NOT EXISTS stop_losses (
                id TEXT PRIMARY KEY,
                position_id TEXT NOT NULL,
                stop_price REAL NOT NULL,
                stop_quantity INTEGER NOT NULL,
                stop_percentage REAL NOT NULL,
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

            -- 인덱스 생성
            CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
            CREATE INDEX IF NOT EXISTS idx_trades_trade_date ON trades(trade_date);
            CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker);
            CREATE INDEX IF NOT EXISTS idx_positions_account_id ON positions(account_id);
            CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
            CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
            CREATE INDEX IF NOT EXISTS idx_stop_losses_position_id ON stop_losses(position_id);
            CREATE INDEX IF NOT EXISTS idx_equity_curve_account_date ON equity_curve(account_id, date);
          `);
        }
      },
      {
        version: 2,
        name: 'add_broker_date_time_to_trades',
        up: (db) => {
          // trades 테이블에 broker_date, broker_time 컬럼 추가
          const tableInfo = db.prepare("PRAGMA table_info(trades)").all() as Array<{name: string}>;
          const hasbrokerDate = tableInfo.some((col) => col.name === 'broker_date');
          const hasbrokerTime = tableInfo.some((col) => col.name === 'broker_time');
          
          if (!hasbrokerDate) {
            db.exec('ALTER TABLE trades ADD COLUMN broker_date TEXT');
          }
          if (!hasbrokerTime) {
            db.exec('ALTER TABLE trades ADD COLUMN broker_time TEXT');
          }
        }
      },
      {
        version: 3,
        name: 'add_max_risk_amount_to_positions',
        up: (db) => {
          // positions 테이블에 max_risk_amount 컬럼 추가
          const tableInfo = db.prepare("PRAGMA table_info(positions)").all() as Array<{name: string}>;
          const hasMaxRiskAmount = tableInfo.some((col) => col.name === 'max_risk_amount');
          
          if (!hasMaxRiskAmount) {
            db.exec('ALTER TABLE positions ADD COLUMN max_risk_amount REAL DEFAULT NULL');
          }
        }
      },
      {
        version: 4,
        name: 'add_daily_plans_table',
        up: (db) => {
          db.exec(`
            CREATE TABLE IF NOT EXISTS daily_plans (
                id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                plan_date DATE NOT NULL,
                daily_risk_limit REAL NOT NULL,
                watchlist TEXT DEFAULT '[]',
                notes TEXT DEFAULT '',
                mood_check TEXT,
                market_notes TEXT,
                checklist TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(account_id, plan_date),
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_daily_plans_account_date ON daily_plans(account_id, plan_date);
          `);
        }
      },
      {
        version: 5,
        name: 'add_analysis_fields_to_positions',
        up: (db) => {
          // positions 테이블에 분석용 필드 추가
          const tableInfo = db.prepare("PRAGMA table_info(positions)").all();
          const hasSetupType = tableInfo.some((col) => col.name === 'setup_type');
          const hasEntryTime = tableInfo.some((col) => col.name === 'entry_time');
          const hasRating = tableInfo.some((col) => col.name === 'rating');
          const hasMemo = tableInfo.some((col) => col.name === 'memo');
          
          if (!hasSetupType) {
            db.exec('ALTER TABLE positions ADD COLUMN setup_type TEXT');
          }
          if (!hasEntryTime) {
            db.exec('ALTER TABLE positions ADD COLUMN entry_time DATETIME');
          }
          if (!hasRating) {
            db.exec('ALTER TABLE positions ADD COLUMN rating INTEGER CHECK(rating >= 1 AND rating <= 5)');
          }
          if (!hasMemo) {
            db.exec('ALTER TABLE positions ADD COLUMN memo TEXT');
          }
          
          // 인덱스 추가
          db.exec('CREATE INDEX IF NOT EXISTS idx_positions_setup_type ON positions(setup_type)');
          db.exec('CREATE INDEX IF NOT EXISTS idx_positions_entry_time ON positions(entry_time)');
          db.exec('CREATE INDEX IF NOT EXISTS idx_positions_rating ON positions(rating)');
        }
      },
      {
        version: 6,
        name: 'add_input_mode_to_stop_losses',
        up: (db) => {
          // stop_losses 테이블에 input_mode 필드 추가
          const tableInfo = db.prepare("PRAGMA table_info(stop_losses)").all() as Array<{name: string}>;
          const hasInputMode = tableInfo.some((col) => col.name === 'input_mode');
          
          if (!hasInputMode) {
            db.exec(`
              ALTER TABLE stop_losses 
              ADD COLUMN input_mode TEXT DEFAULT 'percentage'
              CHECK(input_mode IN ('percentage', 'quantity'))
            `);
            
            // 기존 데이터는 모두 percentage로 설정 (기본값)
            db.exec(`UPDATE stop_losses SET input_mode = 'percentage' WHERE input_mode IS NULL`);
          }
        }
      }
    ];
  }

  public getCurrentVersion(): number {
    const result = this.db.prepare('SELECT MAX(version) as version FROM migrations').get() as { version: number | null };
    return result.version || 0;
  }

  public migrate() {
    const currentVersion = this.getCurrentVersion();
    console.log(`Current database version: ${currentVersion}`);

    const pendingMigrations = this.migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log('Database is up to date');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      
      try {
        this.db.transaction(() => {
          migration.up(this.db);
          this.db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name);
        })();
        
        console.log(`Migration ${migration.version} completed successfully`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  }

  public rollback(targetVersion: number) {
    const currentVersion = this.getCurrentVersion();
    
    if (targetVersion >= currentVersion) {
      console.log('Target version must be less than current version');
      return;
    }

    const migrationsToRollback = this.migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      if (migration.down) {
        console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
        
        try {
          this.db.transaction(() => {
            migration.down!(this.db);
            this.db.prepare('DELETE FROM migrations WHERE version = ?').run(migration.version);
          })();
          
          console.log(`Rollback of migration ${migration.version} completed`);
        } catch (error) {
          console.error(`Rollback of migration ${migration.version} failed:`, error);
          throw error;
        }
      } else {
        console.warn(`Migration ${migration.version} does not have a rollback function`);
      }
    }
  }
}