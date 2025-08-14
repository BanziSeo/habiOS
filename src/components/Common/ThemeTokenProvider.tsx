import { useEffect } from 'react';
import { theme } from 'antd';
import { themes } from '../../constants/theme';
import { useSettingsStore } from '../../stores/settingsStore';

export const ThemeTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = theme.useToken();
  const { generalSettings } = useSettingsStore();
  
  useEffect(() => {
    // Ant Design의 Design Token을 CSS 변수로 설정
    const root = document.documentElement;
    
    // 기본 Ant Design 토큰
    root.style.setProperty('--ant-color-bg-container', token.colorBgContainer);
    root.style.setProperty('--ant-color-bg-elevated', token.colorBgElevated);
    root.style.setProperty('--ant-color-bg-layout', token.colorBgLayout);
    root.style.setProperty('--ant-color-bg-spotlight', token.colorBgSpotlight);
    root.style.setProperty('--ant-color-bg-mask', `rgba(0, 0, 0, 0.45)`);
    root.style.setProperty('--ant-color-border', token.colorBorder);
    root.style.setProperty('--ant-color-border-secondary', token.colorBorderSecondary);
    root.style.setProperty('--ant-color-text', token.colorText);
    root.style.setProperty('--ant-color-text-secondary', token.colorTextSecondary);
    root.style.setProperty('--ant-color-text-tertiary', token.colorTextTertiary);
    root.style.setProperty('--ant-color-primary', token.colorPrimary);
    root.style.setProperty('--ant-color-primary-bg', token.colorPrimaryBg);
    root.style.setProperty('--ant-color-primary-bg-hover', token.colorPrimaryBgHover);
    root.style.setProperty('--ant-color-primary-border', token.colorPrimaryBorder);
    root.style.setProperty('--ant-color-primary-border-hover', token.colorPrimaryBorderHover);
    root.style.setProperty('--ant-color-success', token.colorSuccess);
    root.style.setProperty('--ant-color-warning', token.colorWarning);
    root.style.setProperty('--ant-color-error', token.colorError);
    root.style.setProperty('--ant-color-error-bg', token.colorErrorBg);
    root.style.setProperty('--ant-color-info', token.colorInfo);
    root.style.setProperty('--ant-color-fill-quaternary', token.colorFillQuaternary);
    root.style.setProperty('--ant-color-fill-tertiary', token.colorFillTertiary);
    root.style.setProperty('--ant-color-split', token.colorSplit);
    
    // 커스텀 테마 레이어 색상
    const currentTheme = themes[generalSettings.colorTheme || 'moonlight-mist'];
    if (currentTheme) {
      root.style.setProperty('--theme-bg-l1', currentTheme.colors.L1);
      root.style.setProperty('--theme-bg-l2', currentTheme.colors.L2);
      root.style.setProperty('--theme-bg-l3', currentTheme.colors.L3);
      root.style.setProperty('--theme-bg-l4', currentTheme.colors.L4);
      root.style.setProperty('--theme-bg-l5', currentTheme.colors.L5);
    }
  }, [token, generalSettings.colorTheme]);
  
  return <>{children}</>;
};