import { ipcMain } from 'electron';
import { db } from '../database/db';

export interface DailyPlan {
  id: string;
  accountId: string;
  planDate: string; // YYYY-MM-DD
  dailyRiskLimit: number;
  watchlist: string[];
  notes: string;
  moodCheck?: string;
  marketNotes?: string;
  checklist?: Array<{ text: string; checked: boolean }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyPlanResult {
  id: string;
  dailyPlanId: string;
  actualPnl: number;
  tradesCount: number;
  winCount: number;
  lossCount: number;
  maxDrawdown: number;
  riskLimitBreached: boolean;
  notes?: string;
}

export function registerDailyPlanHandlers() {

  // 특정 날짜의 계획 조회
  ipcMain.handle('daily-plan:get', async (_, accountId: string, planDate: string): Promise<DailyPlan | null> => {
    try {
      const query = `
        SELECT 
          id,
          account_id as accountId,
          plan_date as planDate,
          daily_risk_limit as dailyRiskLimit,
          watchlist,
          notes,
          mood_check as moodCheck,
          market_notes as marketNotes,
          checklist,
          created_at as createdAt,
          updated_at as updatedAt
        FROM daily_plans
        WHERE account_id = ? AND plan_date = ?
      `;
      
      const row = db.queryOne(query, [accountId, planDate]);
      
      if (!row) return null;
      
      // JSON 필드 파싱
      return {
        ...row,
        watchlist: row.watchlist ? JSON.parse(row.watchlist) : [],
        checklist: row.checklist ? JSON.parse(row.checklist) : []
      };
    } catch (error) {
      console.error('Failed to get daily plan:', error);
      throw error;
    }
  });

  // 계획 저장 (생성 또는 업데이트)
  ipcMain.handle('daily-plan:save', async (_, plan: DailyPlan): Promise<DailyPlan> => {
    try {
      const id = plan.id || `${plan.planDate}_${plan.accountId}`;
      
      const query = `
        INSERT INTO daily_plans (
          id, account_id, plan_date, daily_risk_limit, 
          watchlist, notes, mood_check, market_notes, checklist
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(account_id, plan_date) DO UPDATE SET
          daily_risk_limit = excluded.daily_risk_limit,
          watchlist = excluded.watchlist,
          notes = excluded.notes,
          mood_check = excluded.mood_check,
          market_notes = excluded.market_notes,
          checklist = excluded.checklist,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      db.execute(query, [
        id,
        plan.accountId,
        plan.planDate,
        plan.dailyRiskLimit,
        JSON.stringify(plan.watchlist || []),
        plan.notes || '',
        plan.moodCheck || null,
        plan.marketNotes || null,
        JSON.stringify(plan.checklist || [])
      ]);
      
      // 저장된 데이터 조회해서 반환
      const savedRow = db.queryOne(
        'SELECT * FROM daily_plans WHERE account_id = ? AND plan_date = ?',
        [plan.accountId, plan.planDate]
      );
      
      if (!savedRow) return null;
      
      // JSON 필드 파싱 및 필드명 정규화
      return {
        id: savedRow.id,
        accountId: savedRow.account_id,
        planDate: savedRow.plan_date,
        dailyRiskLimit: savedRow.daily_risk_limit,
        watchlist: savedRow.watchlist ? JSON.parse(savedRow.watchlist) : [],
        notes: savedRow.notes,
        moodCheck: savedRow.mood_check,
        marketNotes: savedRow.market_notes,
        checklist: savedRow.checklist ? JSON.parse(savedRow.checklist) : [],
        createdAt: savedRow.created_at,
        updatedAt: savedRow.updated_at
      };
    } catch (error) {
      console.error('Failed to save daily plan:', error);
      throw error;
    }
  });

  // 월별 계획 목록 조회
  ipcMain.handle('daily-plan:list-by-month', async (_, accountId: string, year: number, month: number): Promise<DailyPlan[]> => {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      const query = `
        SELECT 
          id,
          account_id as accountId,
          plan_date as planDate,
          daily_risk_limit as dailyRiskLimit,
          watchlist,
          notes,
          mood_check as moodCheck,
          market_notes as marketNotes,
          checklist,
          created_at as createdAt,
          updated_at as updatedAt
        FROM daily_plans
        WHERE account_id = ? AND plan_date >= ? AND plan_date <= ?
        ORDER BY plan_date DESC
      `;
      
      const rows = db.query(query, [accountId, startDate, endDate]);
      
      return rows.map(row => ({
        ...row,
        watchlist: row.watchlist ? JSON.parse(row.watchlist) : [],
        checklist: row.checklist ? JSON.parse(row.checklist) : []
      }));
    } catch (error) {
      console.error('Failed to list daily plans:', error);
      throw error;
    }
  });

  // 계획 삭제
  ipcMain.handle('daily-plan:delete', async (_, accountId: string, planDate: string): Promise<void> => {
    try {
      db.execute(
        'DELETE FROM daily_plans WHERE account_id = ? AND plan_date = ?',
        [accountId, planDate]
      );
    } catch (error) {
      console.error('Failed to delete daily plan:', error);
      throw error;
    }
  });

  // 결과 저장
  ipcMain.handle('daily-plan:save-result', async (_, result: DailyPlanResult): Promise<void> => {
    try {
      const query = `
        INSERT OR REPLACE INTO daily_plan_results (
          id, daily_plan_id, actual_pnl, trades_count, 
          win_count, loss_count, max_drawdown, risk_limit_breached, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.execute(query, [
        result.id || `${result.dailyPlanId}_result`,
        result.dailyPlanId,
        result.actualPnl,
        result.tradesCount,
        result.winCount,
        result.lossCount,
        result.maxDrawdown,
        result.riskLimitBreached ? 1 : 0,
        result.notes || null
      ]);
    } catch (error) {
      console.error('Failed to save daily plan result:', error);
      throw error;
    }
  });
}