import type { MetricItem, ModalLayout } from './types';

// localStorage 키
export const STORAGE_KEY = 'positionDetailLayout';

// 모든 사용 가능한 메트릭 정의 (labelKey는 번역 키)
export const AVAILABLE_METRICS: MetricItem[] = [
  { id: 'entry-time', key: 'entryTime', label: 'Entry', labelKey: 'widgets:positionDetail.metrics.entry' },
  { id: 'exit-time', key: 'exitTime', label: 'Exit', labelKey: 'widgets:positionDetail.metrics.exit' },
  { id: 'avg-price', key: 'avgPrice', label: 'Average Price', labelKey: 'widgets:positionDetail.metrics.avgPrice' },
  { id: 'current-shares', key: 'currentShares', label: 'Current Shares', labelKey: 'widgets:positionDetail.metrics.currentShares' },
  { id: 'max-shares', key: 'maxShares', label: 'Max Shares Held', labelKey: 'widgets:positionDetail.metrics.maxShares' },
  { id: 'initial-r', key: 'initialR', label: 'Initial R', labelKey: 'widgets:positionDetail.metrics.initialR', editable: true },
  { id: 'aum-initial-risk', key: 'aumInitialRisk', label: 'AUM Initial Risk %', labelKey: 'widgets:positionDetail.metrics.aumInitialRisk' },
  { id: 'open-risk', key: 'pureRisk', label: 'Open Risk %', labelKey: 'widgets:positionDetail.metrics.pureRisk' },
  { id: 'open-risk-dollar', key: 'pureRiskDollar', label: 'Open Risk $', labelKey: 'widgets:positionDetail.metrics.pureRiskDollar' },
  { id: 'net-risk', key: 'totalRisk', label: 'Net Risk %', labelKey: 'widgets:positionDetail.metrics.totalRisk' },
  { id: 'net-risk-dollar', key: 'totalRiskDollar', label: 'Net Risk $', labelKey: 'widgets:positionDetail.metrics.totalRiskDollar' },
  { id: 'r-multiple', key: 'rMultiple', label: 'R-Multiple', labelKey: 'widgets:positionDetail.metrics.rMultiple' },
  { id: 'realized-pnl', key: 'realizedPnl', label: 'Realized P&L', labelKey: 'widgets:positionDetail.metrics.realizedPnl' },
  { id: 'aum-pnl', key: 'aumPnl', label: 'AUM PnL %', labelKey: 'widgets:positionDetail.metrics.aumPnl' },
  { id: 'size', key: 'size', label: 'Size %', labelKey: 'widgets:positionDetail.metrics.size' },
  { id: 'max-size', key: 'maxSize', label: 'Max Size %', labelKey: 'widgets:positionDetail.metrics.maxSize' },
];

// 기본 레이아웃
export const DEFAULT_LAYOUT: ModalLayout = {
  quickStats: ['rMultiple', 'realizedPnl', 'totalRisk'],
  categories: [
    {
      id: 'trading-info',
      name: 'Trading Information',
      items: [
        { id: 'entry-time', key: 'entryTime', label: 'Entry', labelKey: 'widgets:positionDetail.metrics.entry' },
        { id: 'avg-price', key: 'avgPrice', label: 'Average Price', labelKey: 'widgets:positionDetail.metrics.avgPrice' },
        { id: 'current-shares', key: 'currentShares', label: 'Current Shares', labelKey: 'widgets:positionDetail.metrics.currentShares' },
        { id: 'max-shares', key: 'maxShares', label: 'Max Shares Held', labelKey: 'widgets:positionDetail.metrics.maxShares' },
      ]
    },
    {
      id: 'risk-mgmt',
      name: 'Risk Management',
      items: [
        { id: 'initial-r', key: 'initialR', label: 'Initial R', labelKey: 'widgets:positionDetail.metrics.initialR', editable: true },
        { id: 'aum-initial-risk', key: 'aumInitialRisk', label: 'AUM Initial Risk %', labelKey: 'widgets:positionDetail.metrics.aumInitialRisk' },
        { id: 'open-risk', key: 'pureRisk', label: 'Open Risk %', labelKey: 'widgets:positionDetail.metrics.pureRisk' },
        { id: 'open-risk-dollar', key: 'pureRiskDollar', label: 'Open Risk $', labelKey: 'widgets:positionDetail.metrics.pureRiskDollar' },
        { id: 'net-risk', key: 'totalRisk', label: 'Net Risk %', labelKey: 'widgets:positionDetail.metrics.totalRisk' },
        { id: 'net-risk-dollar', key: 'totalRiskDollar', label: 'Net Risk $', labelKey: 'widgets:positionDetail.metrics.totalRiskDollar' },
      ]
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      items: [
        { id: 'r-multiple', key: 'rMultiple', label: 'R-Multiple', labelKey: 'widgets:positionDetail.metrics.rMultiple' },
        { id: 'realized-pnl', key: 'realizedPnl', label: 'Realized P&L', labelKey: 'widgets:positionDetail.metrics.realizedPnl' },
        { id: 'aum-pnl', key: 'aumPnl', label: 'AUM PnL %', labelKey: 'widgets:positionDetail.metrics.aumPnl' },
      ]
    }
  ]
};

// Quick Stats 라벨 맵
export const QUICK_STAT_LABELS: Record<string, string> = {
  rMultiple: 'R-Multiple',
  realizedPnl: 'Realized P&L',
  totalRisk: 'Net Risk'
};