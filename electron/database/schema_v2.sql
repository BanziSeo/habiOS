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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_trade_date ON trades(trade_date);
CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker);
CREATE INDEX IF NOT EXISTS idx_positions_account_id ON positions(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
CREATE INDEX IF NOT EXISTS idx_stop_losses_position_id ON stop_losses(position_id);
CREATE INDEX IF NOT EXISTS idx_equity_curve_account_date ON equity_curve(account_id, date);