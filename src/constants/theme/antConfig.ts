import type { ThemeConfig } from 'antd';
import { theme } from 'antd';
import type { ThemeType } from './types';
import { themes } from './colors';

// 테마 생성 함수
export const createTheme = (themeType: ThemeType): ThemeConfig => {
  // 정의되지 않은 테마인 경우 기본값 사용
  const validThemeType = themes[themeType] ? themeType : 'moonlight-mist';
  const themeDefinition = themes[validThemeType];
  const themeColors = themeDefinition.colors;
  
  return {
    algorithm: themeDefinition.mode === 'light' 
      ? theme.defaultAlgorithm 
      : theme.darkAlgorithm,
    token: {
      // 브랜드 색상
      colorPrimary: themeColors.primary,
      
      // 배경색 계층
      colorBgContainer: themeColors.L3,      // L3: 카드/위젯
      colorBgElevated: themeColors.L4,       // L4: 모달/드롭다운 (수정됨)
      colorBgLayout: themeColors.L2,         // L2: 메인 배경
      colorBgSpotlight: themeColors.L4,      // L4: 호버 상태
      
      // 테두리
      colorBorder: themeColors.border,
      colorBorderSecondary: themeColors.borderSecondary,
      
      // 텍스트
      colorText: themeColors.text,
      colorTextSecondary: themeColors.textSecondary,
      colorTextTertiary: themeColors.textTertiary,
      colorTextDisabled: themeColors.textDisabled,
      
      // 시맨틱 색상
      colorSuccess: themeColors.success,
      colorError: themeColors.error,
      colorWarning: themeColors.warning,
      colorInfo: themeColors.info,
      
      // 기타
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
      fontFamily: '"SUITE Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
    },
    components: {
      // 메뉴
      Menu: {
        itemBorderRadius: 8,
        itemMarginInline: 8,
        itemHeight: 48,
        itemBg: 'transparent',
        itemHoverBg: themeColors.L4,
        itemSelectedBg: `${themeColors.primary}26`, // 15% opacity
        itemSelectedColor: themeColors.primary,
        subMenuItemBg: themeColors.L3,
      },
      
      // 레이아웃
      Layout: {
        siderBg: themeColors.L1,
        headerBg: themeColors.L1,
        bodyBg: themeColors.L2,
        footerBg: themeColors.L1,
      },
      
      // 테이블
      Table: {
        colorBgContainer: themeColors.L3,
        headerBg: themeColors.L2,
        headerColor: themeColors.text,
        rowHoverBg: themeColors.L4,
        rowSelectedBg: `${themeColors.primary}1A`, // 10% opacity
        rowSelectedHoverBg: `${themeColors.primary}26`, // 15% opacity
        borderColor: themeColors.borderSecondary,
        headerBorderRadius: 8,
      },
      
      // Tooltip
      Tooltip: {
        colorBgSpotlight: themeColors.L4,
        colorTextLightSolid: themeColors.text,
      },
      
      // 카드
      Card: {
        colorBgContainer: themeColors.L3,
        colorBorderSecondary: themeColors.border,
        paddingLG: 24,
        boxShadowTertiary: '0 1px 2px rgba(0, 0, 0, 0.4)',
      },
      
      // 버튼
      Button: {
        colorPrimary: themeColors.primary,
        colorPrimaryHover: `${themeColors.primary}E6`, // 90% opacity
        colorPrimaryActive: `${themeColors.primary}CC`, // 80% opacity
        primaryColor: themeType === 'moonlight-mist' ? themeColors.L2 : themeColors.L2,
        defaultBg: themeColors.borderSecondary,
        defaultBorderColor: themeColors.border,
      },
      
      // 셀렉트
      Select: {
        colorBgContainer: themeColors.L2,
        colorBgElevated: themeColors.L3,
        colorBorder: themeColors.border,
        optionSelectedBg: themeColors.L4,
        optionActiveBg: themeColors.L4,
        controlItemBgHover: themeColors.L4,
        controlItemBgActive: themeColors.borderSecondary,
      },
      
      // 인풋
      Input: {
        colorBgContainer: themeColors.L2,
        colorBorder: themeColors.border,
        activeBorderColor: themeColors.primary,
        hoverBorderColor: themeColors.borderSecondary,
        activeBg: themeColors.L3,
        hoverBg: themeColors.L2,
      },
      
      // 모달
      Modal: {
        contentBg: themeColors.L2,
        headerBg: themeColors.L2,
        footerBg: themeColors.L2,
        titleColor: themeColors.text,
      },
      
      // 드롭다운
      Dropdown: {
        colorBgElevated: themeColors.L3,
        colorText: themeColors.text,
        controlItemBgHover: themeColors.L4,
        controlItemBgActive: themeColors.borderSecondary,
      },
      
      // DatePicker
      DatePicker: {
        colorBgContainer: themeColors.L2,
        colorBgElevated: themeColors.L3,
        cellHoverBg: themeColors.L4,
        cellActiveWithRangeBg: `${themeColors.primary}26`, // 15% opacity
        cellRangeBorderColor: 'transparent',
      },
      
      // Descriptions
      Descriptions: {
        labelBg: themeColors.L2,
        colorText: themeColors.text,
        colorTextSecondary: themeColors.textSecondary,
      },
      
      // Tag
      Tag: {
        colorBgContainer: themeColors.borderSecondary,
        colorBorder: themeColors.border,
        colorText: themeColors.text,
      },
      
      // Spin
      Spin: {
        colorPrimary: themeColors.primary,
      },
      
      // Empty
      Empty: {
        colorTextDescription: themeColors.textTertiary,
      },
      
      // Tabs
      Tabs: {
        colorText: themeColors.textSecondary,
        colorPrimary: themeColors.primary,
        colorPrimaryHover: themeColors.primary,
        inkBarColor: themeColors.primary,
      },
      
      // Statistic
      Statistic: {
        titleFontSize: 12,
        contentFontSize: 20,
        colorTextDescription: themeColors.textTertiary,
      },
    }
  };
};