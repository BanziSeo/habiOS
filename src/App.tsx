import { useEffect, useState } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { HashRouter } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import { useTradingStore } from './stores/tradingStore.js';
import { useSettingsStore } from './stores/settingsStore';
import { useChartBookStore } from './stores/chartBookStore';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { GlobalLoading } from './components/Common/GlobalLoading';
import { AuthGuard } from './components/Auth/AuthGuard';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import { notifyError } from './utils/errorNotification';
import { createTheme, type ThemeType } from './constants/theme';
import { useLanguageStore } from './stores/languageStore';
import { ThemeTokenProvider } from './components/Common/ThemeTokenProvider';
import './i18n'; // i18n 초기화
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const { loadAccounts, setActiveAccount, activeAccount } = useTradingStore();
  const { generalSettings } = useSettingsStore();
  const { initializeCharts } = useChartBookStore();
  const { language } = useLanguageStore();
  const [isAppReady, setIsAppReady] = useState(false);
  
  // body 스타일 설정 - 테마에 따라 변경
  useEffect(() => {
    const themeColors = {
      // 다크 테마
      'masterpiece-dark': { bg: '#0D1117', text: '#C9D1D9' },
      'moonlight-mist': { bg: '#191B25', text: '#F5F7FF' },
      'arctic-twilight': { bg: '#141922', text: '#E8F4FF' },
      'deep-forest': { bg: '#0F1A14', text: '#E8F5F0' },
      'cosmic-dust': { bg: '#191621', text: '#F5F0FF' },
      'aurora': { bg: '#0F1424', text: '#E8EAED' },
      // 라이트 테마
      'pearl': { bg: '#FFFFFF', text: '#1A1F2E' },
      'sage': { bg: '#FFFFFF', text: '#1B2A1F' },
      'arctic': { bg: '#FFFFFF', text: '#0F172A' },
      'lavender': { bg: '#FFFFFF', text: '#1E1B2E' },
      'coral': { bg: '#FFFFFF', text: '#2D1F1F' },
      'slate': { bg: '#FFFFFF', text: '#0F172A' },
    };
    
    const currentColors = themeColors[generalSettings.colorTheme || 'moonlight-mist'];
    if (currentColors) {
      document.body.style.backgroundColor = currentColors.bg;
      document.body.style.color = currentColors.text;
    }
  }, [generalSettings.colorTheme]);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 차트 데이터 초기화 (병렬 처리)
        const chartsPromise = initializeCharts();
        
        // 초기 계정 로드 - localStorage에서 마지막 선택 계정 복원
        if (!activeAccount) {
          const accounts = await loadAccounts();
          if (accounts.length > 0) {
            // localStorage에서 마지막 선택 계정 ID 가져오기
            const savedAccountId = localStorage.getItem('activeAccountId');
            let accountToActivate = null;
            
            if (savedAccountId) {
              // 저장된 계정 ID로 계정 찾기
              accountToActivate = accounts.find(acc => acc.id === savedAccountId);
            }
            
            // 저장된 계정이 없거나 찾을 수 없으면 기본 계정 또는 첫 번째 계정 사용
            if (!accountToActivate) {
              accountToActivate = accounts.find(acc => acc.id === 'default-account') || accounts[0];
            }
            
            setActiveAccount(accountToActivate);
          }
        }
        
        // 차트 초기화 완료 대기
        await chartsPromise;
        
        // 모든 초기화 완료
        setIsAppReady(true);
        
      } catch (error) {
        notifyError(t('messages:app.initError'), error);
        console.error('App initialization failed:', error);
        // 에러가 발생해도 앱은 표시되도록 함
        setIsAppReady(true);
      }
    };
    
    initializeApp();
  }, []); // 빈 dependency array로 한 번만 실행
  
  // 테마 가져오기
  const currentTheme = createTheme((generalSettings.colorTheme || 'moonlight-mist') as ThemeType);
  
  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={language === 'ko' ? koKR : enUS}
        theme={currentTheme}
      >
      <AntdApp>
        <ThemeTokenProvider>
        {!isAppReady ? (
          <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentTheme.token?.colorBgLayout
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 48, 
                marginBottom: 24,
                color: currentTheme.token?.colorText || '#000'
              }}>
                TradesLog
              </div>
              <div style={{ 
                color: currentTheme.token?.colorTextSecondary || '#666'
              }}>
                앱을 초기화하는 중...
              </div>
            </div>
          </div>
        ) : (
          <AuthGuard>
            <HashRouter>
              <MainLayout />
              <GlobalLoading />
            </HashRouter>
          </AuthGuard>
        )}
        </ThemeTokenProvider>
      </AntdApp>
    </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;