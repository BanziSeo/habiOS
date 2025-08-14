import type { ChartSettings, GeneralSettings } from './types';

// 테마별 차트 색상 기본값
export const chartColorsByTheme = {
  light: {
    upColor: '#26a69a', // 짙은 녹색
    downColor: '#ef5350', // 빨간색
    volumeUpColor: '#26a69a', // 불투명 녹색
    volumeDownColor: '#ef5350', // 불투명 빨간색
    chartBackgroundColor: '#ffffff', // 흰색 배경
    axisTextColor: '#758696', // 축 텍스트 색상
    axisDividerColor: '#e0e0e0', // 축 구분선 색상 (밝은 회색)
    priceMovingAverages: [
      { id: '1', period: 10, type: 'EMA', color: '#ff0000', width: 1, enabled: true }, // 빨강
      { id: '2', period: 21, type: 'EMA', color: '#0000ff', width: 1, enabled: true }, // 파랑
      { id: '3', period: 50, type: 'SMA', color: '#ff8c00', width: 1, enabled: true }, // 오렌지
      { id: '4', period: 100, type: 'SMA', color: '#808080', width: 1, enabled: true }, // 회색
      { id: '5', period: 200, type: 'SMA', color: '#000000', width: 1, enabled: true }, // 검정
    ],
  },
  dark: {
    upColor: '#00D982', // 민트그린 (프로젝트 테마색)
    downColor: '#EF4444', // 밝은 빨간색
    volumeUpColor: '#00D982', // 민트그린
    volumeDownColor: '#EF4444', // 밝은 빨간색
    chartBackgroundColor: '#131722', // TradingView 다크 배경
    axisTextColor: '#9598a1', // 밝은 회색 텍스트
    axisDividerColor: '#2a2e39', // 어두운 구분선
    priceMovingAverages: [
      { id: '1', period: 10, type: 'EMA', color: '#f23645', width: 1, enabled: true }, // 밝은 빨강
      { id: '2', period: 21, type: 'EMA', color: '#2962ff', width: 1, enabled: true }, // 밝은 파랑
      { id: '3', period: 50, type: 'SMA', color: '#ff9800', width: 1, enabled: true }, // 밝은 오렌지
      { id: '4', period: 100, type: 'SMA', color: '#9c27b0', width: 1, enabled: true }, // 보라색
      { id: '5', period: 200, type: 'SMA', color: '#4caf50', width: 1, enabled: true }, // 초록색
    ],
  }
};

// 기본 차트 설정 (라이트 테마 기준)
export const defaultChartSettings: ChartSettings = {
  chartType: 'candle',
  cursorType: 'crosshair', // 기본 십자선 커서
  ...chartColorsByTheme.light, // 라이트 테마 색상을 기본값으로
  volumeOpacity: 1, // 투명도 고정값 (1 = 완전 불투명)
  chartTheme: 'auto', // 앱 테마를 따라감
  autoScale: true, // 오토스케일 기본 활성화
  logScale: true, // 로그스케일 기본 활성화
  showGrid: true, // 그리드 기본 표시
  axisTextColor: '#758696', // 축 텍스트 색상
  axisDividerColor: '#363a45', // 축 구분선 색상
  chartMargins: {
    top: 0.1,    // 상단 여백 10%
    right: 5,    // 우측 여백 (캔들 개수)
    bottom: 0.1  // 하단 여백 10%
  },
  priceMovingAverages: [
    { id: '1', period: 10, type: 'EMA', color: '#ff0000', width: 1, enabled: true }, // 빨강
    { id: '2', period: 21, type: 'EMA', color: '#0000ff', width: 1, enabled: true }, // 파랑
    { id: '3', period: 50, type: 'SMA', color: '#ff8c00', width: 1, enabled: true }, // 오렌지
    { id: '4', period: 100, type: 'SMA', color: '#808080', width: 1, enabled: true }, // 회색
    { id: '5', period: 200, type: 'SMA', color: '#000000', width: 1, enabled: true }, // 검정
  ],
  volumeMovingAverages: [
    { id: '1', period: 50, type: 'SMA', color: '#0000ff', width: 1, enabled: true }, // 파란색
  ],
  timeframeShortcuts: [
    { key: 'q', timeframe: '5m' },
    { key: 'w', timeframe: '15m' },
    { key: 'e', timeframe: '60m' },
    { key: 'r', timeframe: '1d' },
  ],
  averagePriceLine: {
    enabled: true,
    color: '#2196F3',
    lineWidth: 2,
    lineStyle: 'solid',
  },
  stopLossLines: [
    { color: '#F44336', lineWidth: 1, lineStyle: 'dashed' }, // 빨간색 점선
    { color: '#FF9800', lineWidth: 1, lineStyle: 'dashed' }, // 오렌지색 점선
    { color: '#9C27B0', lineWidth: 1, lineStyle: 'dashed' }, // 보라색 점선
    { color: '#3F51B5', lineWidth: 1, lineStyle: 'dashed' }, // 인디고색 점선
    { color: '#009688', lineWidth: 1, lineStyle: 'dashed' }, // 청록색 점선
  ],
  panelDivider: {
    color: '#363a45',
    thickness: 4,
    hoverColor: '#666666',
    draggable: true,
  },
  drawingDefaults: {
    color: '#2196F3',  // 파란색
    lineWidth: 2,
    opacity: 1,
  },
  textDefaults: {
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    color: '#FFFFFF',  // 다크 모드에서는 흰색
    bold: false,
    italic: false,
    underline: false,
    backgroundColor: undefined,
    borderColor: undefined,
    borderWidth: undefined,
    padding: 4,
  },
  tradeMarkers: {
    buy: {
      enabled: true,
      color: '#26a69a',
      shape: 'arrowUp',
      size: 12,
      position: 'belowBar'
    },
    sell: {
      enabled: true,
      color: '#ef5350',
      shape: 'arrowDown',
      size: 12,
      position: 'aboveBar'
    },
    showText: true,
    textSize: 12
  },
  // 차트 단축키 기본값
  chartShortcuts: {
    'trendLine': 'Alt+T',
    'horizontalLine': 'Alt+H',
    'marker': 'Alt+M',
    'circle': 'Alt+C',
    'rectangle': 'Alt+R',
    'text': 'Alt+X',
    'viewReset': 'Alt+V',
    'viewLock': 'Ctrl+Shift+C',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Y',
    'delete': 'Delete',
    'priceCompare': 'Shift+Click',
  },
  // 캡쳐 단축키 기본값
  captureShortcut: '`',
  // 수동 마커 기본값 (Alt+M으로 추가)
  manualMarker: {
    color: '#FF6B6B',  // 기본 빨간색
    shape: 'circle' as const,
    size: 10
  }
};

export const defaultGeneralSettings: GeneralSettings = {
  theme: 'dark',  // 다크 모드를 기본값으로
  colorTheme: 'moonlight-mist', // 기본 컬러 테마
  defaultCurrency: 'USD',
  buyCommissionRate: 0.0007, // 0.07%
  sellCommissionRate: 0.0007, // 0.07%
  timeDisplay: 'broker', // 기본값: 영웅문 시간 표기
  setupCategories: [], // 셋업 카테고리 초기값
  isEditMode: false, // 편집 모드 기본값
  riskCalculationMode: 'downsideOnly', // 기본값: 보수적 리스크 계산
  menuShortcuts: [
    { menu: '/journal', key: '1', label: 'Journal' },
    { menu: '/equity-curve', key: '2', label: 'Equity Curve' },
    { menu: '/analysis', key: '3', label: 'Analysis' },
    { menu: '/chartbook', key: '4', label: 'Chart Book' },
    { menu: '/import', key: '5', label: 'Import' },
    { menu: '/settings', key: '6', label: 'Settings' },
  ],
};