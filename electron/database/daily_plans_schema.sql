-- 일일 계획 테이블
CREATE TABLE IF NOT EXISTS daily_plans (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    plan_date DATE NOT NULL,
    daily_risk_limit REAL NOT NULL DEFAULT 1000,
    watchlist TEXT, -- JSON 형태로 티커 배열 저장 ["AAPL", "MSFT", ...]
    notes TEXT,
    -- 추가 필드들
    mood_check TEXT, -- 감정/상태 체크 (계획대로, FOMO, 복수매매 등)
    market_notes TEXT, -- 시장 이슈 메모
    checklist TEXT, -- JSON 형태로 체크리스트 저장
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, plan_date),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 일일 계획 실행 기록 테이블 (선택적 - 실제 성과와 비교용)
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
CREATE INDEX IF NOT EXISTS idx_daily_plans_account_date ON daily_plans(account_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(plan_date);