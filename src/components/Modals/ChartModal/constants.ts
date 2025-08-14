import i18n from '../../../i18n';

// 시간프레임 옵션 정의
export const getTimeframeOptions = () => [
  { value: '1m', label: i18n.t('widgets:chart.timeframes.1m'), days: 7, needsResample: false },
  { value: '2m', label: i18n.t('widgets:chart.timeframes.2m'), days: 7, needsResample: false },
  { value: '3m', label: i18n.t('widgets:chart.timeframes.3m'), days: 7, needsResample: true, sourceInterval: '1m', groupSize: 3 },
  { value: '5m', label: i18n.t('widgets:chart.timeframes.5m'), days: 7, needsResample: false },
  { value: '10m', label: i18n.t('widgets:chart.timeframes.10m'), days: 7, needsResample: true, sourceInterval: '5m', groupSize: 2 },
  { value: '15m', label: i18n.t('widgets:chart.timeframes.15m'), days: 7, needsResample: false },
  { value: '30m', label: i18n.t('widgets:chart.timeframes.30m'), days: 7, needsResample: false },
  { value: '60m', label: i18n.t('widgets:chart.timeframes.60m'), days: 180, needsResample: false },
  { value: '65m', label: i18n.t('widgets:chart.timeframes.65m'), days: 7, needsResample: true, sourceInterval: '5m', groupSize: 13 },
  { value: '1d', label: i18n.t('widgets:chart.timeframes.1d'), days: 1825, needsResample: false },
  { value: '1wk', label: i18n.t('widgets:chart.timeframes.1wk'), days: 1825, needsResample: false },
];

// 하위 호환성을 위한 export (deprecated)
export const TIMEFRAME_OPTIONS = getTimeframeOptions();