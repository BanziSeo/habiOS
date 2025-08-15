import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// .env 파일 로드 - 가장 먼저!
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// electron 폴더에서 한 단계 위로 (tradeslog 폴더의 .env)
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Environment variables loaded

// 이제 다른 import들
import { app, BrowserWindow, dialog, protocol, Menu } from 'electron';
import { initDatabase } from './database/db.js';
import { registerAllHandlers } from './ipc-handlers/index.js';
import { DiscordAuthManager } from './auth/discordAuth.js';
import { UpdateManager } from './updater.js';
// import { DatabaseMigration } from './database/migration.js';

let mainWindow: BrowserWindow | null = null;
let updateManager: UpdateManager | null = null;

// Custom protocol 등록 (프로덕션용)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('habios', process.execPath, [__dirname]);
  }
} else {
  app.setAsDefaultProtocolClient('habios');
}

async function createWindow() {
  // 메뉴바 완전 제거
  Menu.setApplicationMenu(null);
  
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'habiOS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin'
  });

  // 개발/프로덕션 분기
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 확대/축소 및 개발자 도구 단축키 등록
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control || input.meta) {
      if (input.key === '+' || input.key === '=' || input.key === 'ArrowUp') {
        mainWindow?.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5);
        event.preventDefault();
      } else if (input.key === '-' || input.key === 'ArrowDown') {
        mainWindow?.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5);
        event.preventDefault();
      } else if (input.key === '0') {
        mainWindow?.webContents.setZoomLevel(0);
        event.preventDefault();
      }
    }
    
    // F12 또는 Ctrl/Cmd + Shift + I로 개발자 도구 토글
    if (input.key === 'F12' || 
        ((input.control || input.meta) && input.shift && input.key === 'I')) {
      if (mainWindow?.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow?.webContents.openDevTools();
      }
      event.preventDefault();
    }
  });
}

// Deep link 핸들링을 위한 변수
let discordAuthManager: DiscordAuthManager | null = null;

// Windows에서 single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    // 누군가 두 번째 인스턴스를 실행하려고 하면 첫 번째 인스턴스 포커스
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    
    // Windows에서 deep link 처리
    const url = commandLine.find((arg) => arg.startsWith('habios://'));
    if (url && discordAuthManager) {
      discordAuthManager.handleProtocolCallback(url);
    }
  });
}

// macOS/Linux deep link 핸들링
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (discordAuthManager) {
    discordAuthManager.handleProtocolCallback(url);
  }
});

app.whenReady().then(async () => {
  // 자동 업데이트 매니저 초기화
  updateManager = new UpdateManager();
  
  // Discord 인증 매니저 초기화
  discordAuthManager = new DiscordAuthManager();
  
  // 데이터베이스 초기화
  await initDatabase();
  
  // 마이그레이션 확인 및 실행 - 현재는 사용하지 않음
  // if (DatabaseMigration.needsMigration()) {
  //   const result = await dialog.showMessageBox({
  //     type: 'warning',
  //     title: '데이터베이스 업그레이드',
  //     message: '데이터베이스 스키마 업그레이드가 필요합니다.\n\n기존 데이터는 백업되지만, 업그레이드 후에는 모든 데이터가 초기화됩니다.\n\n계속하시겠습니까?',
  //     buttons: ['업그레이드', '취소'],
  //     defaultId: 0,
  //     cancelId: 1
  //   });
    
  //   if (result.response === 0) {
  //     try {
  //       await DatabaseMigration.migrateToV2();
  //       dialog.showMessageBox({
  //         type: 'info',
  //         title: '업그레이드 완료',
  //         message: '데이터베이스가 성공적으로 업그레이드되었습니다.'
  //       });
  //     } catch (error) {
  //       dialog.showErrorBox(
  //         '업그레이드 실패',
  //         '데이터베이스 업그레이드 중 오류가 발생했습니다.\n\n' + error
  //       );
  //       app.quit();
  //       return;
  //     }
  //   } else {
  //     app.quit();
  //     return;
  //   }
  // }
  
  // 모든 IPC 핸들러 등록
  registerAllHandlers();
  
  createWindow();
  
  // 메인 윈도우 생성 후 UpdateManager에 전달
  if (mainWindow && updateManager) {
    updateManager.setMainWindow(mainWindow);
    // 앱 시작 3초 후 업데이트 체크 (사용자 경험 개선)
    setTimeout(() => {
      updateManager.checkForUpdates();
    }, 3000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});