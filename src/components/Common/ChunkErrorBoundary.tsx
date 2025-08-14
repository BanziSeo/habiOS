import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 청크 로딩 에러인 경우
    if (error.name === 'ChunkLoadError' || 
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module')) {
      return { hasError: true, error };
    }
    // 다른 에러는 상위로 전파
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chunk loading error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0b0d 0%, #1a1b1d 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '48px',
            maxWidth: '420px',
            width: '100%'
          }}>
            {/* 로딩 에러 아이콘 */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(255, 99, 72, 0.3)'
            }}>
              <ReloadOutlined style={{ 
                fontSize: '36px', 
                color: '#fff',
                animation: 'spin 3s linear infinite'
              }} />
            </div>
            
            {/* 타이틀 */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              페이지 로딩 실패
            </h1>
            
            {/* 설명 */}
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.6',
              marginBottom: '32px'
            }}>
              업데이트된 버전을 불러오는데 실패했습니다.
              <br />
              새로고침하여 최신 버전을 적용해주세요.
            </p>
            
            {/* 새로고침 버튼 */}
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={this.handleReload}
              size="large"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              새로고침
            </Button>
            
            {/* 도움말 */}
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: '24px'
            }}>
              문제가 계속되면 캐시를 삭제해주세요
              <br />
              (Ctrl + Shift + R)
            </p>
          </div>
          
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}