import { theme } from 'antd';
import { useMemo } from 'react';

export const useMetricStyles = () => {
  const { token } = theme.useToken();
  
  return useMemo(() => ({
    metricsWidgetV2: {
      width: '100%',
    },
    
    widgetHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    
    settingsBtn: {
      opacity: 0.6,
    },
    
    groupsContainer: {
      display: 'grid',
      gap: '12px',
    },
    
    metricGroup: {
      background: token.colorFillQuaternary,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: '6px',
      padding: '12px',
      minHeight: '100px',
    },
    
    groupHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    
    groupTitle: {
      color: token.colorPrimary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.3px',
      margin: 0,
    },
    
    groupActions: {
      display: 'flex',
      gap: '4px',
    },
    
    metricsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      minHeight: '50px',
    },
    
    metricItemWrapper: {
      width: '100%',
    },
    
    metricItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: token.colorFillQuaternary,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: '6px',
      transition: 'all 0.2s',
      cursor: 'move',
    },
    
    metricItemHover: {
      background: token.colorFillTertiary,
      borderColor: `${token.colorPrimary}33`, // 20% opacity
    },
    
    metricContent: {
      flex: 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    // Ant Statistic 제목 색상
    statisticTitle: {
      color: token.colorTextTertiary,
    },
    
    statisticContent: {
      lineHeight: 1.2,
    },
    
    removeBtn: {
      opacity: 0,
      transition: 'opacity 0.2s',
    },
    
    removeBtnHover: {
      opacity: 0.6,
    },
    
    removeBtnActive: {
      opacity: '1 !important',
    },
    
    addGroupBtn: {
      marginTop: '16px',
      width: '100%',
      borderStyle: 'dashed' as const,
    },
    
    emptyGroup: {
      padding: '20px',
      textAlign: 'center' as const,
      color: token.colorTextDisabled,
      fontSize: '12px',
    },
  }), [token]);
};