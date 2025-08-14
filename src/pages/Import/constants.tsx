import { Space, Typography } from 'antd';
import { Decimal } from 'decimal.js';
import type { Position } from '../../types/index.js';

const { Text } = Typography;

export const getPositionColumns = (t: (key: string) => string) => [
  {
    title: t('table.ticker'),
    dataIndex: 'ticker',
    key: 'ticker',
    render: (ticker: string, record: Position) => (
      <Space direction="vertical" size={0}>
        <Text strong>{ticker}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>{record.tickerName}</Text>
      </Space>
    ),
  },
  {
    title: t('table.status'),
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Text type={status === 'ACTIVE' ? 'success' : 'secondary'}>
        {status === 'ACTIVE' ? t('table.active') : t('table.closed')}
      </Text>
    ),
  },
  {
    title: t('table.tradeCount'),
    key: 'tradeCount',
    render: (_: unknown, record: Position) => record.trades.length,
  },
  {
    title: t('table.avgBuyPrice'),
    dataIndex: 'avgBuyPrice',
    key: 'avgBuyPrice',
    render: (price: Decimal) => `$${price.toFixed(2)}`,
  },
  {
    title: t('table.realizedPnl'),
    dataIndex: 'realizedPnl',
    key: 'realizedPnl',
    render: (pnl: Decimal) => (
      <Text type={pnl.greaterThan(0) ? 'success' : pnl.lessThan(0) ? 'danger' : undefined}>
        ${pnl.toFixed(2)}
      </Text>
    ),
  },
];