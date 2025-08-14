import i18n from '../../../../i18n';

// 차트 타입 옵션
export const getCHART_TYPE_OPTIONS = () => [
  { label: i18n.t('settings:chart.typeAndColors.candlestick'), value: 'candle' },
  { label: i18n.t('settings:chart.typeAndColors.hollow'), value: 'hollow' },
  { label: i18n.t('settings:chart.typeAndColors.bar'), value: 'bar' },
];

// 커서 타입 옵션
export const getCURSOR_TYPE_OPTIONS = () => [
  { label: i18n.t('settings:chart.typeAndColors.defaultArrow'), value: 'default' },
  { label: i18n.t('settings:chart.typeAndColors.crosshairType'), value: 'crosshair' },
  { label: i18n.t('settings:chart.typeAndColors.dot'), value: 'dot' },
];

// 라인 스타일 옵션
export const getLINE_STYLE_OPTIONS = () => [
  { label: i18n.t('settings:chart.priceAndStopLoss.solid'), value: 'solid' },
  { label: i18n.t('settings:chart.priceAndStopLoss.dashed'), value: 'dashed' },
];

// 마커 모양 옵션
export const getMARKER_SHAPE_OPTIONS = () => [
  { label: i18n.t('settings:chart.markersAndDrawing.arrowUp'), value: 'arrowUp' },
  { label: i18n.t('settings:chart.markersAndDrawing.arrowDown'), value: 'arrowDown' },
  { label: i18n.t('settings:chart.markersAndDrawing.circle'), value: 'circle' },
  { label: i18n.t('settings:chart.markersAndDrawing.square'), value: 'square' },
];

// 마커 위치 옵션
export const getMARKER_POSITION_OPTIONS = () => [
  { label: i18n.t('settings:chart.markersAndDrawing.aboveBar'), value: 'aboveBar' },
  { label: i18n.t('settings:chart.markersAndDrawing.belowBar'), value: 'belowBar' },
  { label: i18n.t('settings:chart.markersAndDrawing.inBar'), value: 'inBar' },
];

// 폰트 옵션
export const FONT_FAMILY_OPTIONS = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Courier New', value: "'Courier New', monospace" },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

// 타임프레임 옵션
export const getTIMEFRAME_OPTIONS = () => [
  { label: i18n.t('settings:chart.movingAverage.globalSettings'), value: 'global' },
  { label: i18n.t('settings:shortcuts.timeframe.1m'), value: '1m' },
  { label: i18n.t('settings:shortcuts.timeframe.2m'), value: '2m' },
  { label: i18n.t('settings:shortcuts.timeframe.3m'), value: '3m' },
  { label: i18n.t('settings:shortcuts.timeframe.5m'), value: '5m' },
  { label: i18n.t('settings:shortcuts.timeframe.10m'), value: '10m' },
  { label: i18n.t('settings:shortcuts.timeframe.15m'), value: '15m' },
  { label: i18n.t('settings:shortcuts.timeframe.30m'), value: '30m' },
  { label: i18n.t('settings:shortcuts.timeframe.60m'), value: '60m' },
  { label: i18n.t('settings:shortcuts.timeframe.65m'), value: '65m' },
  { label: i18n.t('settings:shortcuts.timeframe.1d'), value: '1d' },
  { label: i18n.t('settings:shortcuts.timeframe.1wk'), value: '1w' },
];

// 하위 호환성을 위한 deprecated exports
export const CHART_TYPE_OPTIONS = getCHART_TYPE_OPTIONS();
export const CURSOR_TYPE_OPTIONS = getCURSOR_TYPE_OPTIONS();
export const LINE_STYLE_OPTIONS = getLINE_STYLE_OPTIONS();
export const MARKER_SHAPE_OPTIONS = getMARKER_SHAPE_OPTIONS();
export const MARKER_POSITION_OPTIONS = getMARKER_POSITION_OPTIONS();
export const TIMEFRAME_OPTIONS = getTIMEFRAME_OPTIONS();

// 기본값들
export const DEFAULT_VALUES = {
  // 색상 기본값
  axisTextColor: '#758696',
  axisDividerColor: '#363a45',
  panelDividerColor: '#363a45',
  panelDividerHoverColor: '#666666',
  averagePriceLineColor: '#2196F3',
  drawingDefaultColor: '#2196F3',
  textDefaultColor: '#FFFFFF',
  buyMarkerColor: '#26a69a',
  sellMarkerColor: '#ef5350',
  
  // 숫자 기본값
  panelDividerThickness: 4,
  chartMarginsRight: 5,
  chartMarginsTop: 0.1,
  chartMarginsBottom: 0.1,
  averagePriceLineWidth: 2,
  drawingDefaultLineWidth: 2,
  textDefaultFontSize: 14,
  markerSize: 12,
  markerTextSize: 12,
  
  // 기타 기본값
  averagePriceLineStyle: 'solid',
  textDefaultFontFamily: 'Arial, sans-serif',
};

// MA 기본 설정
export const DEFAULT_MA_CONFIG = {
  period: 20,
  type: 'SMA' as const,
  color: '#ffeb3b',
  width: 1,
  enabled: true,
};