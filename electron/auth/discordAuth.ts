import { BrowserWindow, ipcMain, shell } from 'electron';
import crypto from 'crypto';
import Store from 'electron-store';

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

// Discord 설정을 함수로 래핑 (lazy loading)
const getDiscordConfig = () => {
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    throw new Error('Discord OAuth 설정이 필요합니다. .env 파일을 확인해주세요.');
  }
  
  return {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    REDIRECT_URI: 'http://localhost:3000/callback',
    BETA_SERVER_ID: process.env.DISCORD_BETA_SERVER_ID || '',
    SKIP_AUTH: process.env.SKIP_AUTH === 'true'
  };
};

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: DiscordUser;
}

export class DiscordAuthManager {
  private authWindow: BrowserWindow | null = null;
  private state: string = '';

  constructor() {
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    // Discord 로그인 시작
    ipcMain.handle('auth:discord-login', async () => {
      const config = getDiscordConfig();
      
      // 개발 모드면 스킵
      if (config.SKIP_AUTH) {
        const mockToken: AuthToken = {
          access_token: 'dev-token',
          refresh_token: 'dev-refresh',
          expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30일
          user: {
            id: 'dev-user',
            username: 'Developer',
            discriminator: '0000',
            avatar: ''
          }
        };
        store.set('discord_auth', mockToken);
        return { success: true, user: mockToken.user };
      }

      return this.startOAuthFlow();
    });

    // 토큰 확인
    ipcMain.handle('auth:check-token', async () => {
      const token = store.get('discord_auth') as AuthToken | undefined;
      
      if (!token) {
        return { valid: false };
      }

      // 토큰 만료 확인
      if (Date.now() > token.expires_at) {
        store.delete('discord_auth');
        return { valid: false, reason: 'expired' };
      }

      // 7일 이상 오프라인이면 재인증 필요
      const lastCheck = store.get('last_auth_check') as number || 0;
      const daysSinceCheck = (Date.now() - lastCheck) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCheck > 7) {
        // 온라인이면 서버 확인
        if (await this.isOnline()) {
          const isValid = await this.verifyServerMembership(token);
          if (!isValid) {
            store.delete('discord_auth');
            return { valid: false, reason: 'not_member' };
          }
          store.set('last_auth_check', Date.now());
        } else if (daysSinceCheck > 7) {
          // 7일 이상 오프라인
          return { valid: false, reason: 'offline_too_long' };
        }
      }

      return { valid: true, user: token.user };
    });

    // 로그아웃
    ipcMain.handle('auth:logout', async () => {
      store.delete('discord_auth');
      store.delete('last_auth_check');
      return { success: true };
    });
  }

  private async startOAuthFlow() {
    const config = getDiscordConfig();
    
    // 랜덤 state 생성 (CSRF 방지)
    this.state = crypto.randomBytes(16).toString('hex');
    
    // OAuth URL 생성
    const authUrl = new URL('https://discord.com/api/oauth2/authorize');
    authUrl.searchParams.append('client_id', config.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', config.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'identify guilds');
    authUrl.searchParams.append('state', this.state);

    // 브라우저 창 열기
    this.authWindow = new BrowserWindow({
      width: 500,
      height: 750,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    this.authWindow.loadURL(authUrl.toString());

    // 리다이렉트 감지
    return new Promise((resolve) => {
      const handleCallback = async (url: string) => {
        if (url.startsWith(config.REDIRECT_URI)) {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const state = urlObj.searchParams.get('state');

          if (state !== this.state) {
            resolve({ success: false, error: 'Invalid state' });
            this.authWindow?.close();
            return;
          }

          if (code) {
            const result = await this.exchangeCodeForToken(code);
            resolve(result);
          } else {
            resolve({ success: false, error: 'No code received' });
          }

          this.authWindow?.close();
        }
      };

      // will-navigate 이벤트 (리다이렉트 전)
      this.authWindow!.webContents.on('will-navigate', async (event, url) => {
        if (url.startsWith(config.REDIRECT_URI)) {
          event.preventDefault();
          await handleCallback(url);
        }
      });

      // did-navigate 이벤트 (백업)
      this.authWindow!.webContents.on('did-navigate', async (event, url) => {
        await handleCallback(url);
      });

      this.authWindow!.on('closed', () => {
        this.authWindow = null;
        resolve({ success: false, error: 'User closed window' });
      });
    });
  }

  private async exchangeCodeForToken(code: string) {
    const config = getDiscordConfig();
    
    try {
      // 코드를 토큰으로 교환
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.CLIENT_ID,
          client_secret: config.CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return { success: false, error: 'Failed to get token' };
      }

      // 사용자 정보 가져오기
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json() as DiscordUser;

      // 서버 멤버십 확인
      const isMember = await this.checkServerMembership(tokenData.access_token);
      if (!isMember) {
        return { success: false, error: 'Not a beta server member' };
      }

      // 토큰 저장
      const authToken: AuthToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        user: userData,
      };

      store.set('discord_auth', authToken);
      store.set('last_auth_check', Date.now());

      return { success: true, user: userData };
    } catch (error) {
      console.error('Token exchange error:', error);
      return { success: false, error: 'Token exchange failed' };
    }
  }

  private async checkServerMembership(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const guilds = await response.json();
      const config = getDiscordConfig();
      return guilds.some((guild: any) => guild.id === config.BETA_SERVER_ID);
    } catch {
      return false;
    }
  }

  private async verifyServerMembership(token: AuthToken): Promise<boolean> {
    return this.checkServerMembership(token.access_token);
  }

  private async isOnline(): Promise<boolean> {
    try {
      const response = await fetch('https://discord.com/api/v10/gateway', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}