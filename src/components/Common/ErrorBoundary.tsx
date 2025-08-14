import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Button } from 'antd';
import { CloseCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import i18n from '../../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
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
            maxWidth: '480px',
            width: '100%'
          }}>
            {/* 에러 아이콘 */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(255, 71, 87, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <CloseCircleOutlined style={{ fontSize: '36px', color: '#fff' }} />
            </div>
            
            {/* 타이틀 */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              {i18n.t('messages:app.errorOccurred')}
            </h1>
            
            {/* 설명 */}
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.6',
              marginBottom: '32px'
            }}>
              {i18n.t('messages:error.unknown')}
            </p>
            
            {/* 개발 모드에서 에러 상세 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginBottom: 24, 
                textAlign: 'left',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 8,
                padding: 12
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '12px',
                  marginBottom: 8
                }}>
                  {i18n.t('common:errorDetails', 'Error Details')}
                </summary>
                <pre style={{ 
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: 11,
                  overflow: 'auto',
                  maxHeight: 200,
                  fontFamily: 'monospace'
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            {/* 액션 버튼들 */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
                size="large"
                style={{
                  flex: 1,
                  maxWidth: '200px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                {i18n.t('common:button.refresh')}
              </Button>
              <Button 
                icon={<HomeOutlined />}
                onClick={() => window.location.href = '/'}
                size="large"
                style={{
                  flex: 1,
                  maxWidth: '200px',
                  height: '44px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                {i18n.t('common:goHome', 'Go to Home')}
              </Button>
            </div>
            
            {/* 앱 버전 */}
            <p style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.3)',
              marginTop: '32px'
            }}>
              TradesLog v1.0
            </p>
          </div>
          
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}