import { ipcMain } from 'electron';
import { db, accountQueries, tradeQueries, positionQueries, equityCurveQueries } from '../database/db.js';
import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';

export function registerImportHandlers() {
  // CSV 임포트
  ipcMain.handle('csv:import', async (event, data) => {
    const { mode, importType, trades, positions, currentTotalAssets, accountId, positionTradeMap, buyCommissionRate, sellCommissionRate, equityCurveData } = data;
    const actualMode = mode || importType; // mode 또는 importType 모두 처리
    console.log('CSV Import - Received mode:', mode, 'importType:', importType, 'actualMode:', actualMode);
    console.log('CSV Import - AccountId:', accountId, 'Type:', typeof accountId);
    
    // accountId 필수 체크
    if (!accountId) {
      throw new Error('Account ID is required for CSV import');
    }
    
    let savedTradesCount = 0;
    let skippedTradesCount = 0;
    let savedPositionsCount = 0;
    let skippedPositionsCount = 0;

    // APPEND 모드일 때 trades 배열 내용 확인
    if (actualMode === 'APPEND') {
      console.log(`[DEBUG] Total trades to save: ${trades.length}`);
      const pltrTrades = trades.filter((t) => t.ticker === 'PLTR');
      const shopTrades = trades.filter((t) => t.ticker === 'SHOP');
      const dhiTrades = trades.filter((t) => t.ticker === 'DHI');
      console.log(`[DEBUG] PLTR trades in array: ${pltrTrades.length}`);
      console.log(`[DEBUG] SHOP trades in array: ${shopTrades.length}`);
      console.log(`[DEBUG] DHI trades in array: ${dhiTrades.length}`);
      
      // PLTR 거래 상세 출력
      if (pltrTrades.length > 0) {
        console.log('[DEBUG] PLTR trades detail:');
        pltrTrades.forEach((t) => {
          console.log(`  - ${t.id}`);
        });
      }
    }

    // 트랜잭션으로 실행
    let transactionSuccess = false;
    try {
      console.log('[Transaction] Starting transaction...');
      db.transaction(() => {
      if (actualMode === 'REPLACE' || actualMode === 'FULL') {
        console.log('REPLACE mode: Starting to delete existing data');
        
        // 외래키 제약 조건을 피하기 위해 순서대로 삭제
        // accountId를 포함하는 position들을 먼저 찾음
        const positionsToDelete = db.query('SELECT id FROM positions WHERE account_id = ?', [accountId]);
        const positionIds = positionsToDelete.map((p) => p.id);
        
        if (positionIds.length > 0) {
          // 1. position_trades 먼저 삭제 (positions와 trades 모두를 참조하므로)
          const placeholders = positionIds.map(() => '?').join(',');
          const positionTradesResult = db.execute(
            `DELETE FROM position_trades WHERE position_id IN (${placeholders})`,
            positionIds
          );
          console.log(`position_trades deleted: ${positionTradesResult.changes} rows`);
          
          // 2. stop_losses 삭제
          const stopLossesResult = db.execute(
            `DELETE FROM stop_losses WHERE position_id IN (${placeholders})`,
            positionIds
          );
          console.log(`stop_losses deleted: ${stopLossesResult.changes} rows`);
        } else {
          console.log('No positions to delete for account:', accountId);
        }
        
        // 3. trades 삭제
        const tradesResult = db.execute('DELETE FROM trades WHERE account_id = ?', [accountId]);
        console.log(`trades deleted: ${tradesResult.changes} rows`);
        
        // 4. positions 마지막에 삭제
        const positionsResult = db.execute('DELETE FROM positions WHERE account_id = ?', [accountId]);
        console.log(`positions deleted: ${positionsResult.changes} rows`);
        
        // equity_curve 삭제
        const equityResult = db.execute('DELETE FROM equity_curve WHERE account_id = ?', [accountId]);
        console.log(`equity_curve deleted: ${equityResult.changes} rows`);
        
        // Equity curve 계산은 트랜잭션 밖에서 처리
      }

      // 1단계: 포지션 저장
      for (const position of positions) {
        try {
          if (actualMode === 'APPEND') {
            // 기존 포지션 확인
            const existing = positionQueries.getById(position.id);
            if (existing) {
              // 기존 포지션 업데이트 (상태, 종료일, 실현손익 등)
              const updates: Record<string, unknown> = {
                status: position.status,
                total_shares: position.totalShares,
                realized_pnl: position.realizedPnl,
                max_shares: Math.max(existing.max_shares, position.maxShares)
              };
              
              if (position.status === 'CLOSED' && !existing.close_date) {
                updates.close_date = position.closeDate;
              }
              
              positionQueries.update(position.id, updates);
              savedPositionsCount++;
              continue;
            }
          }
          
          positionQueries.create({
            ...position,
            entryTime: position.entryTime ? new Date(position.entryTime).toISOString() : undefined
          });
          savedPositionsCount++;
        } catch (error) {
          if (error.code === 'SQLITE_CONSTRAINT') {
            console.log(`[Position Save Error - Constraint] Position ID: ${position.id}, Error:`, error.message);
            skippedPositionsCount++;
          } else {
            console.error(`[Position Save Error - Other] Position ID: ${position.id}, Error:`, error);
            throw error;
          }
        }
      }

      // 2단계: 거래 저장
      for (const trade of trades) {
        try {
          if (actualMode === 'APPEND') {
            // 중복 체크 - 같은 ID의 거래가 이미 있는지 확인
            const existingTrade = db.queryOne('SELECT id FROM trades WHERE id = ?', [trade.id]);
            if (existingTrade) {
              console.log(`[APPEND] Skipping duplicate trade: ${trade.id}`);
              skippedTradesCount++;
              continue;
            } else {
              console.log(`[APPEND] Adding new trade: ${trade.id}`);
              // PLTR/SHOP 거래 특별 추적
              if (trade.ticker === 'PLTR' || trade.ticker === 'SHOP') {
                console.log(`[DEBUG] Active position trade ${trade.ticker} - About to save`);
              }
            }
          }
          
          console.log(`[DEBUG-SAVE] Before create - Trade: ${trade.id}, Count: ${savedTradesCount}`);
          tradeQueries.create(trade);
          savedTradesCount++;
          console.log(`[DEBUG-SAVE] After create - Trade: ${trade.id}, Count: ${savedTradesCount}`);
          
          // PLTR/SHOP 거래 저장 성공 확인
          if (trade.ticker === 'PLTR' || trade.ticker === 'SHOP') {
            console.log(`[DEBUG] Active position trade ${trade.ticker} - SAVED SUCCESSFULLY`);
          }
        } catch (error) {
          if (error.code === 'SQLITE_CONSTRAINT') {
            console.log(`[Trade Save Error - Constraint] Trade ID: ${trade.id}, Error:`, error.message);
            skippedTradesCount++;
          } else {
            console.error(`[Trade Save Error - Other] Trade ID: ${trade.id}, Error:`, error);
            throw error;
          }
        }
      }
      
      // 3단계: position_trades 연결 저장 (포지션과 거래가 모두 저장된 후)
      if (positionTradeMap) {
        console.log('[DEBUG] Starting position_trades linking...');
        for (const [positionId, tradeIds] of Object.entries(positionTradeMap)) {
          // 포지션이 실제로 존재하는지 확인
          const positionExists = db.queryOne('SELECT id FROM positions WHERE id = ?', [positionId]);
          if (!positionExists) {
            console.log(`[DEBUG] Position ${positionId} not found, skipping`);
            continue; // 포지션이 없으면 건너뛰기
          }
          
          // APPEND 모드에서는 기존 연결 삭제 후 재생성 (포지션이 재계산되었으므로)
          if (actualMode === 'APPEND') {
            const deleteResult = db.execute('DELETE FROM position_trades WHERE position_id = ?', [positionId]);
            console.log(`[DEBUG] Deleted ${deleteResult.changes} existing links for position ${positionId}`);
          }
          
          let linkedCount = 0;
          for (const tradeId of tradeIds as string[]) {
            try {
              // 거래가 실제로 존재하는지 확인
              const tradeExists = db.queryOne('SELECT id FROM trades WHERE id = ?', [tradeId]);
              if (!tradeExists) {
                console.log(`[DEBUG] Trade ${tradeId} not found in DB, skipping link`);
                continue; // 거래가 없으면 건너뛰기
              }
              
              // FULL 모드에서만 중복 체크 (APPEND는 이미 삭제했으므로)
              if (actualMode === 'FULL' || actualMode === 'REPLACE') {
                // 이미 연결이 존재하는지 확인
                const linkExists = db.queryOne(
                  'SELECT 1 FROM position_trades WHERE position_id = ? AND trade_id = ?',
                  [positionId, tradeId]
                );
                
                if (linkExists) {
                  continue;
                }
              }
              
              db.execute(
                'INSERT INTO position_trades (position_id, trade_id) VALUES (?, ?)',
                [positionId, tradeId]
              );
              linkedCount++;
            } catch (error) {
              console.error(`Failed to link trade ${tradeId} to position ${positionId}:`, error);
            }
          }
          
          if (actualMode === 'APPEND' && positionId.includes('PLTR')) {
            console.log(`[DEBUG] PLTR position ${positionId}: linked ${linkedCount} trades out of ${(tradeIds as string[]).length}`);
          }
        }
        console.log('[DEBUG] position_trades linking completed');
      }

      // Equity curve 저장을 트랜잭션 내부로 이동
      if (equityCurveData && equityCurveData.length > 0) {
        console.log(`Starting to save Equity curve data... (${equityCurveData.length} rows, mode: ${actualMode})`);
        
        // Equity curve 데이터 저장
        equityCurveData.forEach(entry => {
          try {
            equityCurveQueries.create({
              accountId,
              date: dayjs(entry.date).format('YYYY-MM-DD'),
              totalValue: Number(entry.totalValue),
              cashValue: Number(entry.cashValue),
              stockValue: Number(entry.stockValue),
              dailyPnl: Number(entry.dailyPnl)
            });
          } catch (error: unknown) {
            // UNIQUE constraint 오류는 무시 (이미 해당 날짜 데이터가 있는 경우)
            if (!(error instanceof Error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE')) {
              console.error(`Equity curve save error (date: ${entry.date}):`, error);
              // 다른 오류는 재발생시켜 트랜잭션 롤백
              throw error;
            }
          }
        });
        
        console.log(`Equity curve data save completed`);
      }
      
      // 트랜잭션 성공 표시
      transactionSuccess = true;
      console.log('[Transaction] Transaction completed successfully');
    });
    } catch (error) {
      console.error('[Transaction Error] Import failed:', error);
      console.error('[Transaction] Rolling back all changes');
      transactionSuccess = false;
      throw error;
    }
    
    // 트랜잭션 성공 여부 확인
    if (!transactionSuccess) {
      console.error('[Transaction] Transaction did not complete successfully');
      savedTradesCount = 0;
      skippedTradesCount = 0;
      savedPositionsCount = 0;
      skippedPositionsCount = 0;
    }

    // 최종 카운트 확인
    if (actualMode === 'APPEND') {
      console.log('[DEBUG] Final counts:');
      console.log(`  - savedTradesCount: ${savedTradesCount}`);
      console.log(`  - skippedTradesCount: ${skippedTradesCount}`);
      console.log(`  - savedPositionsCount: ${savedPositionsCount}`);
      console.log(`  - skippedPositionsCount: ${skippedPositionsCount}`);
      console.log(`  - transactionSuccess: ${transactionSuccess}`);
      
      // 실제 DB 확인 - PLTR 거래가 있는지
      if (transactionSuccess) {
        console.log('[Verification] Checking if PLTR trades were actually saved...');
        const pltrTrades = db.query(
          'SELECT id FROM trades WHERE account_id = ? AND ticker = ? AND id LIKE ?',
          [accountId, 'PLTR', '%20250728%']
        );
        console.log(`[Verification] PLTR trades with 20250728 in DB: ${pltrTrades.length}`);
        if (pltrTrades.length > 0) {
          pltrTrades.forEach((t) => {
            console.log(`  - Found: ${t.id}`);
          });
        }
      }
    }

    return {
      success: true,
      savedTradesCount,
      skippedTradesCount,
      savedPositionsCount,
      skippedPositionsCount
    };
  });
}