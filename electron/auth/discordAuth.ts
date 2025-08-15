import { BrowserWindow, ipcMain, shell, app } from 'electron';
import crypto from 'crypto';
import Store from 'electron-store';
import * as http from 'http';
import { URL } from 'url';

const store = new Store();
// 프로덕션은 app.isPackaged가 true일 때만
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

// Discord 설정을 함수로 래핑 (lazy loading)
const getDiscordConfig = () => {
  // 모든 환경에서 동일한 값 사용 (하드코딩)
  const CLIENT_ID = '1405620685472010402';
  const CLIENT_SECRET = 'AT3eR2DBEzUxHJCR92-SSrEJK6UM9VuW';
  const BETA_SERVER_ID = '1159481575235403857';
  
  // 모든 환경에서 localhost 사용 (Discord가 custom protocol 지원 중단)
  const REDIRECT_URI = 'http://localhost:3000/auth/callback';
  
  return {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    BETA_SERVER_ID,
    // 프로덕션에서는 절대 SKIP_AUTH 사용 안 함
    SKIP_AUTH: false
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
  private authResolve: ((value: any) => void) | null = null;
  private localServer: http.Server | null = null;

  constructor() {
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    // Discord 로그인 시작
    ipcMain.handle('auth:discord-login', async () => {
      const config = getDiscordConfig();
      
      // 프로덕션에서 강제 설정
      if (app.isPackaged) {
        config.REDIRECT_URI = 'habios://auth/callback';
        config.SKIP_AUTH = false;
      }
      
      console.log('=== AUTH DEBUG ===');
      console.log('isDev:', isDev);
      console.log('app.isPackaged:', app.isPackaged);
      console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
      console.log('Config:', config);
      console.log('==================');
      
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
    
    // 로컬 서버 시작
    const serverStarted = await this.startLocalServer();
    
    if (!serverStarted) {
      return { success: false, error: 'Failed to start local server' };
    }
    
    // OAuth URL 생성
    const authUrl = new URL('https://discord.com/api/oauth2/authorize');
    authUrl.searchParams.append('client_id', config.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', config.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'identify guilds');
    authUrl.searchParams.append('state', this.state);
    
    console.log('Opening Discord OAuth in browser...');
    
    // 기본 브라우저에서 Discord OAuth 페이지 열기
    shell.openExternal(authUrl.toString());
    
    // 서버가 code를 받을 때까지 기다림 (타임아웃 60초)
    return new Promise((resolve) => {
      this.authResolve = resolve;
      
      // 60초 후 타임아웃
      setTimeout(() => {
        if (this.authResolve) {
          this.authResolve({ success: false, error: 'Authentication timeout' });
          this.authResolve = null;
          this.localServer?.close();
          this.localServer = null;
        }
      }, 60000);
    });
  }
  
  private async startLocalServer(): Promise<string | null> {
    return new Promise((resolve) => {
      // 이미 서버가 실행 중이면 먼저 종료
      if (this.localServer) {
        this.localServer.close();
      }
      
      this.localServer = http.createServer(async (req, res) => {
        const url = new URL(req.url || '', 'http://localhost:3000');
        
        if (url.pathname === '/auth/callback') {
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          
          // HTML 응답 보내기
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>habiOS - Authentication Complete</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  background: #0a0b0d;
                  color: #ffffff;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  overflow: hidden;
                }
                .container {
                  text-align: center;
                  padding: 60px 40px;
                  max-width: 500px;
                  animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .success-icon {
                  width: 80px;
                  height: 80px;
                  margin: 0 auto 30px;
                  background: linear-gradient(135deg, #667eea, #764ba2);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
                }
                .success-icon svg {
                  width: 40px;
                  height: 40px;
                  stroke: white;
                  stroke-width: 3;
                  fill: none;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  animation: checkmark 0.5s ease-out 0.3s both;
                }
                @keyframes checkmark {
                  from { stroke-dasharray: 50; stroke-dashoffset: 50; }
                  to { stroke-dasharray: 50; stroke-dashoffset: 0; }
                }
                h1 {
                  font-size: 28px;
                  font-weight: 600;
                  margin-bottom: 16px;
                  letter-spacing: -0.5px;
                }
                p {
                  font-size: 16px;
                  color: rgba(255, 255, 255, 0.7);
                  line-height: 1.5;
                  margin-bottom: 8px;
                }
                .status {
                  font-size: 14px;
                  color: rgba(255, 255, 255, 0.5);
                  margin-top: 30px;
                }
                .logo {
                  font-size: 14px;
                  font-weight: 600;
                  color: rgba(255, 255, 255, 0.3);
                  margin-top: 40px;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success-icon">
                  <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h1>Authentication Successful</h1>
                <p>Your Discord account has been successfully linked.</p>
                <p>You can now close this window and return to the application.</p>
                <div class="status">Redirecting to habiOS...</div>
                <div class="logo">habiOS v0.8.15</div>
              </div>
              <script>
                // 5초 후 자동으로 창 닫기 시도
                setTimeout(() => {
                  window.close();
                }, 5000);
              </script>
            </body>
            </html>
          `);
          
          // state 검증
          if (state !== this.state) {
            console.error('Invalid state parameter');
            if (this.authResolve) {
              this.authResolve({ success: false, error: 'Invalid state parameter' });
              this.authResolve = null;
            }
            this.localServer?.close();
            this.localServer = null;
            return;
          }
          
          // 코드로 토큰 교환
          if (code) {
            const result = await this.exchangeCodeForToken(code);
            if (this.authResolve) {
              this.authResolve(result);
              this.authResolve = null;
            }
          } else {
            if (this.authResolve) {
              this.authResolve({ success: false, error: 'No code received' });
              this.authResolve = null;
            }
          }
          
          // 서버 종료
          setTimeout(() => {
            this.localServer?.close();
            this.localServer = null;
          }, 1000);
        } else {
          // 404 응답
          res.writeHead(404);
          res.end('Not Found');
        }
      });
      
      // 포트 3000으로 서버 시작
      this.localServer.listen(3000, () => {
        console.log('Local auth server started on http://localhost:3000');
        resolve('server-started');
      });
      
      // 에러 처리
      this.localServer.on('error', (err: any) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
          console.log('Port 3000 is already in use, trying 3001...');
          // 포트 충돌 시 다른 포트 시도 (나중에 구현)
        }
        resolve(null);
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

  // Custom protocol callback 처리 (더 이상 사용 안 함 - Discord가 지원 중단)
  public async handleProtocolCallback(url: string) {
    // Discord가 custom protocol 지원을 중단하여 이 메서드는 사용되지 않음
    // localhost 서버 방식으로 대체됨
    return;
  }
}