import type { MetricGroup, MetricCard } from './types';
import i18n from '../../../i18n';

// Helper function to get translated text
const t = (key: string) => i18n.t(key, { ns: 'widgets' });

// We need to use a function to get the groups with translations
export const getDefaultGroups = (): MetricGroup[] => [
  { id: 'portfolio', title: t('metricsWidget.groups.portfolioOverview'), order: 0 },
  { id: 'performance', title: t('metricsWidget.groups.performanceMetrics'), order: 1 },
  { id: 'risk', title: t('metricsWidget.groups.riskManagement'), order: 2 }
];

// We need to use a function to get the cards with translations
export const getDefaultCards = (): MetricCard[] => [
  // Portfolio Overview - 기본 표시 항목
  { id: 'current-value', title: t('metricsWidget.metrics.currentValue'), groupId: 'portfolio', visible: true },
  { id: 'total-return', title: t('metricsWidget.metrics.totalReturn'), groupId: 'portfolio', visible: true },
  { id: 'max-drawdown', title: t('metricsWidget.metrics.maxDrawdown'), groupId: 'portfolio', visible: true },
  { id: 'stock-cash', title: t('metricsWidget.metrics.stockCash'), groupId: 'portfolio', visible: true },
  
  // Hidden by default
  { id: 'trading-days', title: t('metricsWidget.metrics.tradingDays'), groupId: 'portfolio', visible: false },
  
  // Performance Metrics
  { id: 'win-rate', title: t('metricsWidget.metrics.winRate'), groupId: 'performance', visible: true },
  
  // Hidden by default
  { id: 'avg-win-r', title: t('metricsWidget.metrics.avgWinR'), groupId: 'performance', visible: false },
  { id: 'avg-loss-r', title: t('metricsWidget.metrics.avgLossR'), groupId: 'performance', visible: false },
  { id: 'avg-positions-day', title: t('metricsWidget.metrics.avgPositionsDay'), groupId: 'performance', visible: false },
  { id: 'avg-holding-time', title: t('metricsWidget.metrics.avgHolding'), groupId: 'performance', visible: false },
  { id: 'avg-winner-holding-time', title: t('metricsWidget.metrics.avgWinnerHolding'), groupId: 'performance', visible: false },
  { id: 'avg-loser-holding-time', title: t('metricsWidget.metrics.avgLoserHolding'), groupId: 'performance', visible: false },
  
  // Risk Management - All hidden by default
  { id: 'open-positions', title: t('metricsWidget.metrics.openPositions'), groupId: 'risk', visible: false },
  { id: 'portfolio-open-risk', title: t('metricsWidget.metrics.portfolioOpenRisk'), groupId: 'risk', visible: false },
  { id: 'portfolio-open-risk-dollar', title: t('metricsWidget.metrics.portfolioOpenRiskDollar'), groupId: 'risk', visible: false },
  { id: 'portfolio-net-risk', title: t('metricsWidget.metrics.portfolioNetRisk'), groupId: 'risk', visible: false },
  { id: 'portfolio-net-risk-dollar', title: t('metricsWidget.metrics.portfolioNetRiskDollar'), groupId: 'risk', visible: false },
  
  // Advanced Metrics (Phase 2) - All hidden by default
  { id: 'expectancy', title: t('metricsWidget.metrics.expectancy'), groupId: 'performance', visible: false },
  { id: 'expectancy-r', title: t('metricsWidget.metrics.expectancyR'), groupId: 'performance', visible: false },
  { id: 'payoff-ratio', title: t('metricsWidget.metrics.payoffRatio'), groupId: 'performance', visible: false },
  { id: 'avg-risk-per-trade', title: t('metricsWidget.metrics.avgRiskPerTrade'), groupId: 'risk', visible: false },
  { id: 'avg-size-per-trade', title: t('metricsWidget.metrics.avgSizePerTrade'), groupId: 'risk', visible: false },
  { id: 'std-dev-returns', title: t('metricsWidget.metrics.stdDevReturns'), groupId: 'performance', visible: false },
  { id: 'downside-deviation', title: t('metricsWidget.metrics.downsideDeviation'), groupId: 'risk', visible: false },
  { id: 'sharpe-ratio', title: t('metricsWidget.metrics.sharpeRatio'), groupId: 'performance', visible: false },
  { id: 'max-consecutive-wins', title: t('metricsWidget.metrics.maxConsecutiveWins'), groupId: 'performance', visible: false },
  { id: 'max-consecutive-losses', title: t('metricsWidget.metrics.maxConsecutiveLosses'), groupId: 'risk', visible: false },
  { id: 'raroc', title: t('metricsWidget.metrics.raroc'), groupId: 'performance', visible: false },
];

// For backward compatibility - these will now use the current language
export const DEFAULT_GROUPS = getDefaultGroups();
export const DEFAULT_CARDS = getDefaultCards();
export const ALL_METRIC_CARDS = DEFAULT_CARDS;

export const DEFAULT_SETTINGS = {
  categoryFontSize: 14,
  titleFontSize: 12,
  valueFontSize: 14,
  subValueFontSize: 11,
  categoryBold: false,
  titleBold: false,
  valueBold: false,
  subValueBold: false,
};

export const STORAGE_KEYS = {
  GROUPS: 'metricsGroups',
  CARDS: 'metricsCards',
  CATEGORY_FONT_SIZE: 'metricsWidget_categoryFontSize',
  TITLE_FONT_SIZE: 'metricsWidget_titleFontSize',
  VALUE_FONT_SIZE: 'metricsWidget_valueFontSize',
  SUB_VALUE_FONT_SIZE: 'metricsWidget_subValueFontSize',
  CATEGORY_BOLD: 'metricsWidget_categoryBold',
  TITLE_BOLD: 'metricsWidget_titleBold',
  VALUE_BOLD: 'metricsWidget_valueBold',
  SUB_VALUE_BOLD: 'metricsWidget_subValueBold',
};