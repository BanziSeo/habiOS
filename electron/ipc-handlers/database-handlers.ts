import { ipcMain, dialog, app } from 'electron';
import { db } from '../database/db.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';
import Store from 'electron-store';

const store = new Store();

export function registerDatabaseHandlers() {
  // 데이터베이스 쿼리 실행
  ipcMain.handle('db:query', async (event, sql, params) => {
    return db.query(sql, params);
  });

  // 데이터베이스 명령 실행
  ipcMain.handle('db:execute', async (event, sql, params) => {
    return db.execute(sql, params);
  });

  // 데이터베이스 백업
  ipcMain.handle('db:backup', async (event) => {
    try {
      // 현재 날짜/시간으로 파일명 생성
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
      const fileName = `tradeslog_backup_${timestamp}.zip`;
      
      // 저장 위치 선택 대화상자
      const result = await dialog.showSaveDialog({
        title: '데이터 백업 (DB + 설정)',
        defaultPath: fileName,
        filters: [
          { name: 'Backup Files', extensions: ['zip'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, cancelled: true };
      }

      // 현재 DB 파일 경로
      const userDataPath = app.getPath('userData');
      const currentDbPath = path.join(userDataPath, 'tradeslog.db');
      const configPath = path.join(userDataPath, 'config.json');

      // WAL 모드 체크포인트 실행 (데이터 동기화)
      db.getDatabase().pragma('wal_checkpoint(PASSIVE)');

      // ZIP 파일 생성
      const output = fs.createWriteStream(result.filePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // 최대 압축
      });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          resolve({
            success: true,
            filePath: result.filePath,
            size: archive.pointer()
          });
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // 백업 정보 메타데이터
        const backupInfo = {
          version: '1.0.0',
          appVersion: app.getVersion(),
          backupDate: new Date().toISOString(),
          platform: process.platform
        };

        // 파일들을 ZIP에 추가
        archive.append(JSON.stringify(backupInfo, null, 2), { name: 'backup_info.json' });
        archive.file(currentDbPath, { name: 'database.db' });
        
        // 설정 파일 추가
        if (fs.existsSync(configPath)) {
          archive.file(configPath, { name: 'config.json' });
        }

        // WAL 파일 추가 (있는 경우)
        const walPath = currentDbPath + '-wal';
        const shmPath = currentDbPath + '-shm';
        
        if (fs.existsSync(walPath)) {
          archive.file(walPath, { name: 'database.db-wal' });
        }
        if (fs.existsSync(shmPath)) {
          archive.file(shmPath, { name: 'database.db-shm' });
        }

        archive.finalize();
      });
    } catch (error) {
      console.error('Backup error:', error);
      return {
        success: false,
        error: error.message || '백업 중 오류가 발생했습니다'
      };
    }
  });

  // 데이터베이스 복원
  ipcMain.handle('db:restore', async (event) => {
    try {
      // 백업 파일 선택 대화상자
      const result = await dialog.showOpenDialog({
        title: '백업 파일 선택',
        filters: [
          { name: 'Backup Files', extensions: ['zip'] },
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || !result.filePaths[0]) {
        return { success: false, cancelled: true };
      }

      const backupPath = result.filePaths[0];
      
      // 백업 파일 유효성 검증
      const stats = await fs.promises.stat(backupPath);
      if (!stats.isFile()) {
        throw new Error('유효한 파일이 아닙니다');
      }

      // 현재 DB 경로
      const userDataPath = app.getPath('userData');
      const currentDbPath = path.join(userDataPath, 'tradeslog.db');
      const configPath = path.join(userDataPath, 'config.json');

      // ZIP 파일인지 확인
      if (backupPath.endsWith('.zip')) {
        // ZIP 파일 처리
        const zip = new AdmZip(backupPath);
        const zipEntries = zip.getEntries();
        
        // 백업 정보 확인
        const infoEntry = zipEntries.find(entry => entry.entryName === 'backup_info.json');
        if (infoEntry) {
          const backupInfo = JSON.parse(zip.readAsText(infoEntry));
          console.log('Backup info:', backupInfo);
        }

        // DB 파일 확인
        const dbEntry = zipEntries.find(entry => entry.entryName === 'database.db');
        if (!dbEntry) {
          throw new Error('백업 파일에 데이터베이스가 포함되어 있지 않습니다');
        }

        // 현재 DB 연결 종료
        db.close();

        // 기존 파일 백업 (안전을 위해)
        const tempBackupPath = currentDbPath + '.temp';
        const tempConfigPath = configPath + '.temp';
        
        await fs.promises.copyFile(currentDbPath, tempBackupPath);
        if (fs.existsSync(configPath)) {
          await fs.promises.copyFile(configPath, tempConfigPath);
        }

        try {
          // ZIP에서 파일 추출
          zipEntries.forEach(entry => {
            if (entry.entryName === 'database.db') {
              zip.extractEntryTo(entry, userDataPath, false, true);
              // 파일명 변경 (database.db -> tradeslog.db)
              fs.renameSync(
                path.join(userDataPath, 'database.db'),
                currentDbPath
              );
            } else if (entry.entryName === 'config.json') {
              zip.extractEntryTo(entry, userDataPath, false, true);
            } else if (entry.entryName === 'database.db-wal') {
              zip.extractEntryTo(entry, userDataPath, false, true);
              fs.renameSync(
                path.join(userDataPath, 'database.db-wal'),
                currentDbPath + '-wal'
              );
            } else if (entry.entryName === 'database.db-shm') {
              zip.extractEntryTo(entry, userDataPath, false, true);
              fs.renameSync(
                path.join(userDataPath, 'database.db-shm'),
                currentDbPath + '-shm'
              );
            }
          });

          // DB 재연결
          db.reconnect();

          // electron-store 리로드
          store.clear();
          const newConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          Object.keys(newConfig).forEach(key => {
            store.set(key, newConfig[key]);
          });

          // 임시 백업 삭제
          await fs.promises.unlink(tempBackupPath);
          if (fs.existsSync(tempConfigPath)) {
            await fs.promises.unlink(tempConfigPath);
          }

          return { success: true };
        } catch (error) {
          // 복원 실패 시 원래 파일로 롤백
          await fs.promises.copyFile(tempBackupPath, currentDbPath);
          if (fs.existsSync(tempConfigPath)) {
            await fs.promises.copyFile(tempConfigPath, configPath);
          }
          db.reconnect();
          await fs.promises.unlink(tempBackupPath);
          if (fs.existsSync(tempConfigPath)) {
            await fs.promises.unlink(tempConfigPath);
          }
          throw error;
        }
      } else {
        // 기존 .db 파일 처리 (하위 호환성)
        db.close();
        const tempBackupPath = currentDbPath + '.temp';
        await fs.promises.copyFile(currentDbPath, tempBackupPath);

        try {
          await fs.promises.copyFile(backupPath, currentDbPath);
          
          const backupWalPath = backupPath + '-wal';
          const backupShmPath = backupPath + '-shm';
          
          if (fs.existsSync(backupWalPath)) {
            await fs.promises.copyFile(backupWalPath, currentDbPath + '-wal');
          }
          if (fs.existsSync(backupShmPath)) {
            await fs.promises.copyFile(backupShmPath, currentDbPath + '-shm');
          }

          db.reconnect();
          await fs.promises.unlink(tempBackupPath);
          return { success: true };
        } catch (error) {
          await fs.promises.copyFile(tempBackupPath, currentDbPath);
          db.reconnect();
          await fs.promises.unlink(tempBackupPath);
          throw error;
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
      return {
        success: false,
        error: error.message || '복원 중 오류가 발생했습니다'
      };
    }
  });
}