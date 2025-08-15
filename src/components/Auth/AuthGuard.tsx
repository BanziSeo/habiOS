import React, { useEffect, useState } from 'react';
import { Button, Spin } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');
  const [authError, setAuthError] = useState<string>('');
  const { setUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const result = await window.electronAPI.auth.checkToken();
      
      if (result.valid) {
        setAuthState('authorized');
        // authStore도 업데이트
        if (result.user) {
          setUser(result.user);
        }
      } else {
        setAuthState('unauthorized');
        
        switch (result.reason) {
          case 'expired':
            setAuthError('토큰이 만료되었습니다. 다시 로그인해주세요.');
            break;
          case 'not_member':
            setAuthError('베타 서버 멤버가 아닙니다.');
            break;
          case 'offline_too_long':
            setAuthError('7일 이상 오프라인 상태였습니다. 인터넷에 연결 후 다시 로그인해주세요.');
            break;
          default:
            setAuthError('로그인이 필요합니다.');
        }
      }
    } catch (error) {
      setAuthState('unauthorized');
      setAuthError('인증 확인 중 오류가 발생했습니다.');
    }
  };

  const handleLogin = async () => {
    setAuthState('checking');
    const result = await window.electronAPI.auth.loginDiscord();
    
    if (result.success) {
      setAuthState('authorized');
      // authStore도 업데이트
      if (result.user) {
        setUser(result.user);
      }
    } else {
      setAuthState('unauthorized');
      setAuthError(result.error || '로그인에 실패했습니다.');
    }
  };

  if (authState === 'checking') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0b0d'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0b0d 0%, #1a1b1d 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '48px',
          maxWidth: '420px',
          width: '100%'
        }}>
          {/* 모던한 아이콘 영역 */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <MessageOutlined style={{ fontSize: '36px', color: '#fff' }} />
          </div>
          
          {/* 타이틀 */}
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            베타 액세스 필요
          </h1>
          
          {/* 설명 */}
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            {authError}
          </p>
          
          {/* 로그인 버튼 */}
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={handleLogin}
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
            Discord로 로그인
          </Button>
          
          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '24px'
          }}>
            habiOS v0.8.15
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};