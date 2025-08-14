import React, { useMemo } from 'react';
import { theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTradingStore } from '../../stores/tradingStore';
import { useMetricsStore } from '../../stores/metricsStore';
import { formatCurrency } from '../../utils/formatters';
import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';


interface DailyPnLWidgetProps {
  selectedDate: dayjs.Dayjs;
}

const DailyPnLWidgetComponent: React.FC<DailyPnLWidgetProps> = ({ selectedDate }) => {
  const { t } = useTranslation('widgets');
  const { activeAccount, positions } = useTradingStore();
  const { totalAssets } = useMetricsStore();
  const { token } = theme.useToken();

  // 스타일 정의 (Design Token 사용)
  const styles = useMemo(() => ({
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: token.colorTextTertiary,
      fontSize: 14,
    },
    summaryBar: {
      padding: '16px 20px',
      background: token.colorFillQuaternary,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLabel: {
      fontSize: 12,
      color: token.colorTextSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    summaryValue: {
      textAlign: 'right' as const,
    },
    summaryPercent: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1,
    },
    summaryAmount: {
      fontSize: 14,
      opacity: 0.8,
      marginTop: 2,
    },
    pnlTable: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    tableRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      transition: 'background 0.15s',
    },
    tableRowHover: {
      background: token.colorFillQuaternary,
    },
    rowLabel: {
      flex: 1,
      fontSize: 14,
      color: token.colorTextSecondary,
      display: 'flex',
      alignItems: 'center',
    },
    rowIcon: {
      width: 16,
      height: 16,
      marginRight: 8,
      opacity: 0.6,
    },
    rowValues: {
      textAlign: 'right' as const,
    },
    rowPercent: {
      fontSize: 16,
      fontWeight: 600,
    },
    rowAmount: {
      fontSize: 12,
      color: token.colorTextTertiary,
      marginTop: 2,
    },
    positive: {
      color: token.colorSuccess,
    },
    negative: {
      color: token.colorError,
    },
    neutral: {
      color: token.colorTextSecondary,
    },
  }), [token]);

  // 선택된 날짜의 P&L 계산
  const pnlMetrics = useMemo(() => {
    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    const selectedDateSlash = selectedDate.format('YYYY/MM/DD'); // 슬래시 형식도 지원
    
    // 기존 포지션 손익: 오픈일이 오늘 이전인 포지션들의 오늘 실현손익
    let existingPositionsPnL = new Decimal(0);
    // 신규 포지션 손익: 오픈일이 오늘인 포지션들의 실현손익
    let newPositionsPnL = new Decimal(0);
    
    // 오늘 마감된 포지션들의 실현 손익 계산
    positions.forEach(pos => {
      if (pos.status === 'CLOSED' && pos.realizedPnl) {
        // 포지션의 마지막 SELL 거래의 brokerDate 확인
        let isClosedToday = false;
        let isOpenedToday = false;
        
        if (pos.trades && pos.trades.length > 0) {
          // 마지막 SELL 거래 찾기 (마감일) - brokerDate로만 판단
          const lastSell = pos.trades
            .filter(t => t.tradeType === 'SELL')
            .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())[0];
          
          // brokerDate로만 판단 (영웅문 거래일 기준)
          isClosedToday = lastSell?.brokerDate === selectedDateStr || 
                         lastSell?.brokerDate === selectedDateSlash;
          
          // 첫 BUY 거래 찾기 (오픈일) - brokerDate로만 판단
          const firstBuy = pos.trades.find(t => t.tradeType === 'BUY');
          isOpenedToday = firstBuy?.brokerDate === selectedDateStr || 
                         firstBuy?.brokerDate === selectedDateSlash;
        }
        
        if (isClosedToday) {
          if (isOpenedToday) {
            // 오늘 오픈, 오늘 마감
            newPositionsPnL = newPositionsPnL.plus(pos.realizedPnl);
          } else {
            // 이전 오픈, 오늘 마감
            existingPositionsPnL = existingPositionsPnL.plus(pos.realizedPnl);
          }
        }
      }
    });
    
    // 총자산 대비 퍼센트 계산
    // metricsStore의 totalAssets 사용 (number 타입)
    const totalAssetsNum = totalAssets > 0 ? totalAssets : (activeAccount?.initialBalance || 0);
    
    // totalAssets가 0이면 퍼센트 계산 불가
    if (totalAssetsNum === 0) {
      return {
        existing: existingPositionsPnL,
        existingPercent: new Decimal(0),
        new: newPositionsPnL,
        newPercent: new Decimal(0),
        total: existingPositionsPnL.plus(newPositionsPnL),
        totalPercent: new Decimal(0)
      };
    }
    
    const existingPnLPercent = existingPositionsPnL.div(totalAssetsNum).mul(100);
    const newPnLPercent = newPositionsPnL.div(totalAssetsNum).mul(100);
    const totalPnL = existingPositionsPnL.plus(newPositionsPnL);
    const totalPnLPercent = totalPnL.div(totalAssetsNum).mul(100);
    
    return {
      existing: existingPositionsPnL,
      existingPercent: existingPnLPercent,
      new: newPositionsPnL,
      newPercent: newPnLPercent,
      total: totalPnL,
      totalPercent: totalPnLPercent
    };
  }, [positions, selectedDate, totalAssets, activeAccount]);

  if (!activeAccount) {
    return <div style={styles.emptyState}>{t('dailyPnl.selectAccount')}</div>;
  }

  const totalPnLStyle = pnlMetrics.total.gte(0) ? styles.positive : styles.negative;
  const existingPnLStyle = pnlMetrics.existing.gte(0) ? styles.positive : styles.negative;
  const newPnLStyle = pnlMetrics.new.gte(0) ? styles.positive : styles.negative;

  return (
    <div style={styles.container}>
      {/* Summary Bar */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryLabel}>{t('dailyPnl.totalRealizedPnl')}</div>
        <div style={styles.summaryValue}>
          <div style={{ ...styles.summaryPercent, ...totalPnLStyle }}>
            {pnlMetrics.total.gte(0) ? '+' : ''}{pnlMetrics.totalPercent.toFixed(2)}%
          </div>
          <div style={{ ...styles.summaryAmount, ...totalPnLStyle }}>
            {pnlMetrics.total.gte(0) ? '+' : ''}{formatCurrency(pnlMetrics.total, activeAccount.currency)}
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div style={styles.pnlTable}>
        <div 
          style={styles.tableRow}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = token.colorFillQuaternary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={styles.rowLabel}>
            <svg style={styles.rowIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            {t('dailyPnl.existingPositions')}
          </div>
          <div style={styles.rowValues}>
            <div style={{ ...styles.rowPercent, ...existingPnLStyle }}>
              {pnlMetrics.existing.gte(0) ? '+' : ''}{pnlMetrics.existingPercent.toFixed(2)}%
            </div>
            <div style={styles.rowAmount}>
              {pnlMetrics.existing.gte(0) ? '+' : ''}{formatCurrency(pnlMetrics.existing, activeAccount.currency)}
            </div>
          </div>
        </div>

        <div 
          style={styles.tableRow}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = token.colorFillQuaternary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={styles.rowLabel}>
            <svg style={styles.rowIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            {t('dailyPnl.newPositions')}
          </div>
          <div style={styles.rowValues}>
            <div style={{ ...styles.rowPercent, ...newPnLStyle }}>
              {pnlMetrics.new.gte(0) ? '+' : ''}{pnlMetrics.newPercent.toFixed(2)}%
            </div>
            <div style={styles.rowAmount}>
              {pnlMetrics.new.gte(0) ? '+' : ''}{formatCurrency(pnlMetrics.new, activeAccount.currency)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DailyPnLWidget = React.memo(DailyPnLWidgetComponent, (prevProps, nextProps) => {
  // selectedDate가 같으면 리렌더링 스킵
  return prevProps.selectedDate.isSame(nextProps.selectedDate, 'day');
});