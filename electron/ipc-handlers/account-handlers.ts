import { ipcMain } from 'electron';
import { accountQueries } from '../database/db.js';

export function registerAccountHandlers() {
  // 계정 생성
  ipcMain.handle('accounts:create', async (event, account) => {
    return accountQueries.create(account);
  });

  // 모든 계정 조회
  ipcMain.handle('accounts:getAll', async () => {
    return accountQueries.getAll();
  });

  // ID로 계정 조회
  ipcMain.handle('accounts:getById', async (event, id) => {
    return accountQueries.getById(id);
  });

  // 계정 삭제
  ipcMain.handle('accounts:delete', async (event, id) => {
    // 마지막 계정인지 확인
    const allAccounts = await accountQueries.getAll();
    if (allAccounts.length <= 1) {
      throw new Error('마지막 계정은 삭제할 수 없습니다.');
    }
    
    return accountQueries.delete(id);
  });
}