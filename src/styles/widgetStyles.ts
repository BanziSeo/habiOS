/**
 * 위젯 공통 스타일 정의
 * 테마에 따라 동적으로 색상을 조정하는 함수
 */

import { theme } from 'antd';

export const getWidgetStyles = () => {
  const { token } = theme.useToken();
  
  return {
    // 카드 스타일
    sectionCard: {
      background: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: '8px',
      marginBottom: '16px',
    },
    
    cardHead: {
      background: token.colorFillQuaternary,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      padding: '12px 16px',
      minHeight: 'unset',
    },
    
    cardTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: token.colorText,
      margin: 0,
    },
    
    // 메트릭 박스 스타일
    metricBox: {
      flex: 1,
      textAlign: 'center' as const,
      padding: '16px 12px',
      background: token.colorFillQuaternary,
      borderRadius: '6px',
      border: `1px solid ${token.colorBorderSecondary}`,
    },
    
    metricLabel: {
      display: 'block',
      fontSize: '12px',
      color: token.colorTextSecondary,
      marginBottom: '8px',
    },
    
    metricValue: {
      small: {
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      medium: {
        fontSize: '18px',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      large: {
        fontSize: '24px',
        fontWeight: 700,
        lineHeight: 1.2,
      },
    },
    
    metricSubValue: {
      display: 'block',
      fontSize: '12px',
      color: token.colorTextTertiary,
      marginTop: '4px',
    },
    
    // 총합 박스 스타일
    totalBox: {
      marginTop: '12px',
      padding: '12px',
      background: token.colorFillQuaternary,
      borderRadius: '6px',
      border: `1px solid ${token.colorBorderSecondary}`,
      textAlign: 'center' as const,
    },
    
    // 색상 상수
    colors: {
      profit: token.colorSuccess || '#52c41a',  // 수익
      loss: token.colorError || '#ff4d4f',    // 손실
      primary: token.colorPrimary || '#4096ff', // 기본
      warning: token.colorWarning || '#faad14', // 경고
      textPrimary: token.colorText,
      textSecondary: token.colorTextSecondary,
      textTertiary: token.colorTextTertiary,
    },
  } as const;
};