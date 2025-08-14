import { autoUpdater } from 'electron-updater';
import { dialog, BrowserWindow } from 'electron';

export class UpdateManager {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.setupUpdater();
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  private setupUpdater() {
    // 개발 환경에서는 업데이트 체크 안함
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // Private 저장소를 위한 토큰 설정 (환경변수에서)
    if (process.env.GH_TOKEN) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'BanziSeo',
        repo: 'habiOS',
        private: true,
        token: process.env.GH_TOKEN
      });
    }

    // 자동 다운로드 설정
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // 업데이트 체크 이벤트
    autoUpdater.on('checking-for-update', () => {
      console.log('업데이트 확인 중...');
    });

    // 업데이트 발견
    autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: '업데이트 발견',
        message: `새 버전 ${info.version}이 발견되었습니다. 다운로드하시겠습니까?`,
        buttons: ['다운로드', '나중에'],
        defaultId: 0
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    // 업데이트 없음
    autoUpdater.on('update-not-available', () => {
      console.log('최신 버전입니다.');
    });

    // 다운로드 진행률
    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      const message = `다운로드 중... ${percent}%`;
      
      // 메인 윈도우에 진행률 전송
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('download-progress', {
          percent,
          bytesPerSecond: progressObj.bytesPerSecond,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }

      // Windows 작업 표시줄 진행률 표시
      if (this.mainWindow) {
        this.mainWindow.setProgressBar(percent / 100);
      }
    });

    // 다운로드 완료
    autoUpdater.on('update-downloaded', (info) => {
      if (this.mainWindow) {
        this.mainWindow.setProgressBar(-1); // 진행률 표시 제거
      }

      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: '업데이트 준비 완료',
        message: `버전 ${info.version} 다운로드가 완료되었습니다. 지금 재시작하여 업데이트를 적용하시겠습니까?`,
        buttons: ['재시작', '나중에'],
        defaultId: 0
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
    });

    // 에러 처리
    autoUpdater.on('error', (error) => {
      console.error('업데이트 에러:', error);
      
      // 토큰 관련 에러인 경우
      if (error.message.includes('401') || error.message.includes('403')) {
        dialog.showErrorBox(
          '업데이트 오류',
          'GitHub 인증에 실패했습니다. GH_TOKEN 환경변수를 확인해주세요.'
        );
      }
    });
  }

  // 수동으로 업데이트 체크
  checkForUpdates() {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates();
    }
  }
}