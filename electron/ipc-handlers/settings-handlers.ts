import { ipcMain } from 'electron';
import { settingsQueries, equityCurveQueries } from '../database/db.js';

export function registerSettingsHandlers() {
  // 설정 조회
  ipcMain.handle('settings:get', async (event, key) => {
    return settingsQueries.get(key);
  });

  // 설정 저장
  ipcMain.handle('settings:set', async (event, key, value) => {
    return settingsQueries.set(key, value);
  });

  // 모든 설정 조회
  ipcMain.handle('settings:getAll', async () => {
    return settingsQueries.getAll();
  });

  // Equity Curve - 최신 데이터 조회
  ipcMain.handle('equityCurve:getLatest', async (event, accountId) => {
    return equityCurveQueries.getLatestByAccount(accountId);
  });

  // Equity Curve - 계정별 전체 데이터 조회
  ipcMain.handle('equityCurve:getByAccount', async (event, accountId) => {
    return equityCurveQueries.getByAccount(accountId);
  });
  
  // Equity Curve - 디버깅용 주말 데이터 확인
  ipcMain.handle('equityCurve:debugWeekendData', async (event, accountId) => {
    return equityCurveQueries.debugWeekendData(accountId);
  });
}