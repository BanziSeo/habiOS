import { ipcMain } from 'electron';
import { tradeQueries, positionQueries, stopLossQueries, settingsQueries, db } from '../database/db.js';
import { fetchMultipleBenchmarks } from '../utils/benchmark.js';

export function registerTradingHandlers() {
  // 거래 생성
  ipcMain.handle('trades:create', async (event, trade) => {
    return tradeQueries.create(trade);
  });

  // 계정별 거래 조회
  ipcMain.handle('trades:getByAccount', async (event, accountId) => {
    return tradeQueries.getByAccount(accountId);
  });

  // 계정별 포지션 조회
  ipcMain.handle('positions:getByAccount', async (event, accountId, status) => {
    const positions = positionQueries.getByAccount(accountId, status);
    
    // 각 포지션에 trades 정보 추가
    return positions.map(position => {
      const trades = tradeQueries.getByPosition(position.id);
      const stopLosses = stopLossQueries.getByPosition(position.id);
      return {
        ...position,
        trades,
        stopLosses
      };
    });
  });

  // 특정 포지션 조회 (메트릭 포함)
  ipcMain.handle('positions:getById', async (event, positionId) => {
    const position = positionQueries.getById(positionId);
    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }
    
    const trades = tradeQueries.getByPosition(position.id);
    const stopLosses = stopLossQueries.getByPosition(position.id);
    
    const result = {
      ...position,
      trades,
      stopLosses
    };
    
    console.log('[positions:getById] Returning position with stopLosses:', {
      positionId: position.id,
      stopLossesCount: stopLosses.length,
      stopLossesData: stopLosses
    });
    
    return result;
  });

  // 스탑로스 업데이트
  ipcMain.handle('stopLoss:update', async (event, positionId, stopLosses, setAsInitialR = false) => {
    try {
      console.log('[stopLoss:update] Updating stopLosses for position:', positionId, 'with:', stopLosses, 'setAsInitialR:', setAsInitialR);
      
      // 포지션 정보 가져오기
      const position = positionQueries.getById(positionId);
      if (!position) {
        throw new Error('Position not found');
      }
      
      // 설정값 가져오기
      const buyCommissionRate = settingsQueries.get('buyCommissionRate') || 0.0007;
      const sellCommissionRate = settingsQueries.get('sellCommissionRate') || 0.0007;
      const totalCommissionRate = buyCommissionRate + sellCommissionRate;
      
      // 기존 스탑로스 삭제
      const deleteResult = stopLossQueries.deleteByPosition(positionId);
      console.log('[stopLoss:update] Deleted existing stop losses:', deleteResult);
      
      // 새 스탑로스 추가 및 리스크 계산
      let currentTotalRisk = 0;
      
      if (stopLosses && stopLosses.length > 0) {
        stopLosses.forEach((sl) => {
          const createResult = stopLossQueries.create({
            positionId,
            stopPrice: sl.stopPrice,
            stopQuantity: sl.stopQuantity,
            stopPercentage: sl.stopPercentage || sl.pricePercentage || sl.percentage,
            inputMode: sl.inputMode || 'percentage' // 입력 모드 저장
          });
          console.log('[stopLoss:update] Created stop loss with inputMode:', createResult);
          
          // 리스크 계산 (평균매수가 - 스탑가격) * 수량 + 수수료
          const loss = (position.avg_buy_price - sl.stopPrice) * sl.stopQuantity;
          const commission = position.avg_buy_price * sl.stopQuantity * totalCommissionRate;
          currentTotalRisk += loss + commission;
        });
      }
      
      // max_risk_amount 업데이트 로직
      if (currentTotalRisk > 0) {
        const currentMaxRisk = position.max_risk_amount || 0;
        
        if (setAsInitialR) {
          // setAsInitialR이 true면 현재 리스크를 max_risk_amount로 설정
          positionQueries.updateMaxRiskAmount(positionId, currentTotalRisk);
          console.log('[stopLoss:update] Set as Initial R - updated max_risk_amount to:', currentTotalRisk);
        } else if (currentTotalRisk > currentMaxRisk) {
          // 아니면 현재 리스크가 기존 최대값보다 클 때만 갱신
          positionQueries.updateMaxRiskAmount(positionId, currentTotalRisk);
          console.log('[stopLoss:update] Updated max_risk_amount to:', currentTotalRisk, '(was:', currentMaxRisk, ')');
        } else {
          console.log('[stopLoss:update] Current risk', currentTotalRisk, 'is not greater than existing max risk', currentMaxRisk, '- no update');
        }
      }
      
      console.log('[stopLoss:update] Stop losses updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[stopLoss:update] Error:', error);
      throw error;
    }
  });

  // Initial R (max_risk_amount) 업데이트
  ipcMain.handle('positions:updateInitialR', async (event, positionId: string, initialR: number) => {
    try {
      console.log('[positions:updateInitialR] Updating Initial R for position:', positionId, 'to:', initialR);
      
      // 포지션 존재 확인
      const position = positionQueries.getById(positionId);
      if (!position) {
        throw new Error('Position not found');
      }
      
      // max_risk_amount 업데이트
      positionQueries.updateMaxRiskAmount(positionId, initialR);
      console.log('[positions:updateInitialR] Updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[positions:updateInitialR] Error:', error);
      throw error;
    }
  });

  // 포지션 업데이트 (셋업, 메모, 레이팅 등)
  ipcMain.handle('positions:update', async (event, positionId: string, data: Record<string, unknown>) => {
    try {
      console.log('[positions:update] Updating position:', positionId, 'with data:', data);
      
      // 포지션 존재 확인
      const position = positionQueries.getById(positionId);
      if (!position) {
        throw new Error('Position not found');
      }
      
      // 업데이트 실행
      positionQueries.update(positionId, data);
      console.log('[positions:update] Updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[positions:update] Error:', error);
      throw error;
    }
  });

  // 벤치마크 데이터 가져오기
  ipcMain.handle('benchmark:fetch', async (event, symbols: string[], startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const benchmarkData = await fetchMultipleBenchmarks(symbols as any, start, end);
      return benchmarkData;
    } catch (error) {
      console.error('Failed to fetch benchmark data:', error);
      return {};
    }
  });
}