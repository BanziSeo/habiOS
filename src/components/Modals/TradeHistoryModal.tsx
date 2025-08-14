import React from 'react';
import { Table, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import type { Trade, Position } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTradingStore } from '../../stores/tradingStore';
import { useMetricsStore } from '../../stores/metricsStore';
import Decimal from 'decimal.js';
import { TradeTypeTag } from '../Common/TradeTypeTag';

interface TradeHistoryModalProps {
  trades: Trade[];
  position?: Position;
}

interface TradeWithMetrics extends Trade {
  size?: number; // 해당 거래 시점의 포지션 사이즈
  realizedPnl?: Decimal; // 매도시 실현손익
  aumPnl?: number; // 실현손익 / 총자산
}

const TradeHistoryModal: React.FC<TradeHistoryModalProps> = ({ trades, position }) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const { generalSettings } = useSettingsStore();
  const { activeAccount } = useTradingStore();
  const { totalAssets } = useMetricsStore();
  const isbrokerTime = generalSettings.timeDisplay === 'broker';

  // 스타일 정의 (Design Token 사용)
  const styles = {
    // Quick Stats Bar
    quickStats: {
      display: 'flex',
      background: token.colorFillQuaternary,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    quickStat: {
      flex: 1,
      padding: 16,
      textAlign: 'center' as const,
      borderRight: `1px solid ${token.colorBorderSecondary}`,
    },
    quickStatLast: {
      flex: 1,
      padding: 16,
      textAlign: 'center' as const,
    },
    quickStatLabel: {
      fontSize: 12,
      color: token.colorTextSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: 6,
      fontWeight: 500,
    },
    quickStatValue: {
      fontSize: 20,
      fontWeight: 700,
      color: token.colorText,
    },
    quickStatValuePositive: {
      fontSize: 20,
      fontWeight: 700,
      color: token.colorSuccess,
    },
    quickStatValueNegative: {
      fontSize: 20,
      fontWeight: 700,
      color: token.colorError,
    },
    // Table Container
    tableContainer: {
      padding: 0,
    },
    // Value Styles
    sizeValue: {
      color: token.colorPrimary,
      fontWeight: 500,
    },
    positive: {
      color: token.colorSuccess,
      fontWeight: 500,
    },
    negative: {
      color: token.colorError,
      fontWeight: 500,
    },
  };

  // 총자산은 메트릭 스토어에서 가져오기 (기존 useEffect 제거)

  // 거래 데이터에 메트릭 추가
  const tradesWithMetrics: TradeWithMetrics[] = trades.map((trade, index) => {
    // 해당 시점까지의 누적 포지션 계산
    let cumulativeShares = 0;
    let cumulativeValue = new Decimal(0);
    
    for (let i = 0; i <= index; i++) {
      const t = trades[i];
      if (t.tradeType === 'BUY') {
        cumulativeShares += t.quantity;
        cumulativeValue = cumulativeValue.plus(t.price.times(t.quantity));
      } else {
        cumulativeShares -= t.quantity;
        cumulativeValue = cumulativeValue.minus(t.price.times(t.quantity));
      }
    }

    // 사이즈 계산 (포지션 가치 / 총자산)
    const size = totalAssets > 0 && cumulativeShares > 0
      ? (cumulativeValue.toNumber() / totalAssets) * 100
      : 0;

    // PnL 계산 (매도시에만)
    let realizedPnl: Decimal | undefined;
    let aumPnl: number | undefined;
    
    if (trade.tradeType === 'SELL' && position) {
      // 간단한 평균단가 기준 계산
      const avgPrice = position.avgBuyPrice;
      const pnl = trade.price.minus(avgPrice).times(trade.quantity);
      const totalCommissionRate = (generalSettings.buyCommissionRate || 0.0007) + 
                                 (generalSettings.sellCommissionRate || 0.0007);
      const commission = trade.price.times(trade.quantity).times(totalCommissionRate); // 수수료
      
      realizedPnl = pnl.minus(commission);
      aumPnl = totalAssets > 0 ? (realizedPnl.toNumber() / totalAssets) * 100 : 0;
    }

    return {
      ...trade,
      size,
      realizedPnl,
      aumPnl
    };
  });

  // Quick Stats 계산
  const totalTrades = trades.length;
  const currentSize = position && totalAssets > 0
    ? (position.avgBuyPrice.times(position.totalShares).toNumber() / totalAssets) * 100
    : 0;
  
  // Max Size 계산
  let maxSize = 0;
  let cumulativeShares = 0;
  let cumulativeValue = new Decimal(0);
  
  trades.forEach(trade => {
    if (trade.tradeType === 'BUY') {
      cumulativeShares += trade.quantity;
      cumulativeValue = cumulativeValue.plus(trade.price.times(trade.quantity));
    } else {
      cumulativeShares -= trade.quantity;
      cumulativeValue = cumulativeValue.minus(trade.price.times(trade.quantity));
    }
    
    const size = totalAssets > 0 && cumulativeShares > 0
      ? (cumulativeValue.toNumber() / totalAssets) * 100
      : 0;
    
    maxSize = Math.max(maxSize, size);
  });

  // Net P&L 계산
  const netPnl = tradesWithMetrics.reduce((sum, trade) => 
    sum.plus(trade.realizedPnl || new Decimal(0)), new Decimal(0)
  );
  
  const columns: ColumnsType<TradeWithMetrics> = [
    {
      title: t('tradeHistory.columns.dateTime'),
      dataIndex: 'tradeDate',
      key: 'tradeDate',
      render: (date: string, record: TradeWithMetrics) => {
        if (isbrokerTime && record.brokerDate && record.brokerTime) {
          return `${record.brokerDate} ${record.brokerTime}`;
        }
        // YYYY/MM/DD HH:mm 형식으로 표시
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
      },
      width: 150,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.type'),
      dataIndex: 'tradeType',
      key: 'tradeType',
      render: (tradeType: 'BUY' | 'SELL') => (
        <TradeTypeTag type={tradeType} />
      ),
      width: 80,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: (quantity: number) => quantity.toString(),
      width: 80,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.price'),
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price: Decimal) => formatCurrency(price, activeAccount?.currency),
      width: 100,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.amount'),
      key: 'amount',
      align: 'right',
      render: (_, record) => {
        const amount = new Decimal(record.price).mul(record.quantity);
        return formatCurrency(amount, activeAccount?.currency);
      },
      width: 120,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.size'),
      key: 'size',
      align: 'right',
      render: (_, record) => (
        <span style={styles.sizeValue}>
          {record.size ? `${record.size.toFixed(1)}%` : '-'}
        </span>
      ),
      width: 80,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.pnl'),
      key: 'pnl',
      align: 'right',
      render: (_, record) => {
        if (!record.realizedPnl) return '-';
        const isPositive = record.realizedPnl.gt(0);
        return (
          <span style={isPositive ? styles.positive : styles.negative}>
            {isPositive ? '+' : ''}{formatCurrency(record.realizedPnl, activeAccount?.currency)}
          </span>
        );
      },
      width: 100,
      sorter: false,
    },
    {
      title: t('tradeHistory.columns.aumPnl'),
      key: 'aumPnl',
      align: 'right',
      render: (_, record) => {
        if (record.aumPnl === undefined) return '-';
        const isPositive = record.aumPnl > 0;
        return (
          <span style={isPositive ? styles.positive : styles.negative}>
            {isPositive ? '+' : ''}{record.aumPnl.toFixed(2)}%
          </span>
        );
      },
      width: 80,
      sorter: false,
    },
  ];

  // 날짜 순으로 정렬 (최신이 아래로)
  const sortedTrades = [...tradesWithMetrics].sort((a, b) => 
    new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime()
  );

  return (
    <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Quick Stats */}
        <div style={styles.quickStats}>
          <div style={styles.quickStat}>
            <div style={styles.quickStatLabel}>{t('tradeHistory.quickStats.totalTrades')}</div>
            <div style={styles.quickStatValue}>{totalTrades}</div>
          </div>
          <div style={styles.quickStat}>
            <div style={styles.quickStatLabel}>{t('tradeHistory.quickStats.size')}</div>
            <div style={styles.quickStatValue}>{currentSize.toFixed(1)}%</div>
          </div>
          <div style={styles.quickStat}>
            <div style={styles.quickStatLabel}>{t('tradeHistory.quickStats.maxSize')}</div>
            <div style={styles.quickStatValue}>{maxSize.toFixed(1)}%</div>
          </div>
          <div style={styles.quickStatLast}>
            <div style={styles.quickStatLabel}>{t('tradeHistory.quickStats.netPnl')}</div>
            <div style={netPnl.gt(0) ? styles.quickStatValuePositive : netPnl.lt(0) ? styles.quickStatValueNegative : styles.quickStatValue}>
              {netPnl.gt(0) ? '+' : ''}{formatCurrency(netPnl, activeAccount?.currency)}
            </div>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <Table
            columns={columns}
            dataSource={sortedTrades}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 400 }}
            style={{
              backgroundColor: 'transparent',
            }}
          />
        </div>
    </div>
  );
};

export default React.memo(TradeHistoryModal, (prevProps, nextProps) => {
  // trades 배열의 길이와 position ID가 같으면 리렌더링 스킵
  return prevProps.trades.length === nextProps.trades.length &&
         prevProps.position?.id === nextProps.position?.id;
});