export interface MovingAverage {
  id: string;
  period: number;
  type: 'SMA' | 'EMA';
  color: string;
  width: number;
  enabled: boolean;
  volumeMA?: boolean;
}

// 타임프레임별 이동평균선 설정
export interface TimeframeMASettings {
  priceMovingAverages: MovingAverage[];
  volumeMovingAverages: MovingAverage[];
}

// 타임프레임 단축키 설정
export interface TimeframeShortcut {
  timeframe: string;
  key: string; // 'q', 'w', 'e', 'r' 등
}

// 메뉴 단축키 설정
export interface MenuShortcut {
  menu: string; // '/journal', '/equity-curve' 등
  key: string; // '1', '2', '3' 등
  label: string; // '매매일지', 'Equity Curve' 등
}

export interface ChartSettings {
  // 캨들 타입
  chartType: 'candle' | 'hollow' | 'bar';
  
  // 가격 캨들 색상 설정
  upColor: string;
  downColor: string;
  
  // 볼륨 바 색상 설정
  volumeUpColor: string;
  volumeDownColor: string;
  
  // 볼륨 투명도 설정 (0.1 ~ 1.0)
  volumeOpacity: number;
  
  // 차트 배경색 설정
  chartBackgroundColor: string;
  
  // 차트 테마
  chartTheme: 'light' | 'dark' | 'auto';
  
  // 차트 스케일 설정
  autoScale: boolean;
  logScale: boolean;
  
  // 차트 그리드 설정
  showGrid: boolean;
  
  // 차트 여백 설정 (0-0.5 범위)
  chartMargins: {
    top: number;
    right: number;
    bottom: number;
  };
  
  // 차트 축 색상 설정
  axisDividerColor?: string;  // 구분선 색상
  axisTextColor?: string;     // 텍스트 색상
  
  // 가격 이동평균선 (기본/전역 설정)
  priceMovingAverages: MovingAverage[];
  
  // 볼륨 이동평균선 (기본/전역 설정)
  volumeMovingAverages: MovingAverage[];
  
  // 타임프레임별 이동평균선 설정
  timeframeMA?: {
    [timeframe: string]: TimeframeMASettings;
  };
  
  // 타임프레임 단축키 설정
  timeframeShortcuts?: TimeframeShortcut[];
  
  // 차트 단축키 매핑 (action -> key)
  chartShortcuts?: {
    [action: string]: string;
  };
  
  // 캡쳐 단축키
  captureShortcut?: string;
  
  // 마우스 커서 타입
  cursorType?: 'default' | 'crosshair' | 'dot';
  
  // 평균가 라인 설정
  averagePriceLine: {
    enabled: boolean;
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed';
  };
  
  // 스탑로스 라인 설정 (최대 5개)
  stopLossLines: Array<{
    color: string;
    lineWidth: number;
    lineStyle: 'solid' | 'dashed';
  }>;
  
  // 스탑로스 라인 on/off
  stopLossLinesEnabled?: boolean;
  
  // 패널 구분선 설정
  panelDivider: {
    color: string;
    thickness: number;
    hoverColor: string;
    draggable: boolean;
  };
  
  // 드로잉 도구 기본 설정
  drawingDefaults: {
    color: string;
    lineWidth: number;
    opacity: number;
  };
  
  // 텍스트 도구 기본 설정
  textDefaults: {
    fontSize: number;
    fontFamily: string;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
  };
  
  // 거래 마커 설정
  tradeMarkers: {
    // 매수 마커
    buy: {
      enabled: boolean;
      color: string;
      shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
      size: number;
      position: 'aboveBar' | 'belowBar' | 'inBar';
    };
    // 매도 마커
    sell: {
      enabled: boolean;
      color: string;
      shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
      size: number;
      position: 'aboveBar' | 'belowBar' | 'inBar';
    };
    // 텍스트 표시
    showText: boolean;
    textSize: number;
  };
  
  // 수동 마커 설정 (Alt+M으로 추가되는 마커)
  manualMarker?: {
    color: string;
    shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
    size: number;
  };
}

export interface GeneralSettings {
  // 테마
  theme: 'light' | 'dark'; // 구버전 호환성
  
  // 새로운 테마 시스템
  colorTheme?: 'masterpiece-dark' | 'moonlight-mist' | 'arctic-twilight' | 
    'deep-forest' | 'cosmic-dust' | 'aurora' | 'pearl' | 'sage' | 
    'arctic' | 'lavender' | 'coral' | 'slate';
  
  // 기본 통화
  defaultCurrency: 'USD' | 'KRW';
  
  // 수수료율
  buyCommissionRate: number;
  sellCommissionRate: number;
  
  // 커스텀 폰트
  customFont?: string;
  
  // 시간 표기 방식
  timeDisplay: 'broker' | 'actual'; // broker: 영웅문 시간, actual: 실제 시간
  
  // 거래 통계 설정
  winRateThreshold?: number; // 승률 계산 임계값 (기본값: 0.05)
  
  // 셋업 카테고리
  setupCategories?: string[];
  
  // 글로벌 편집 모드
  isEditMode?: boolean;
  
  // 메뉴 단축키 설정
  menuShortcuts?: MenuShortcut[];
  
  // 리스크 계산 모드
  riskCalculationMode?: 'downsideOnly' | 'withUpside';
}

export interface SettingsStore {
  chartSettings: ChartSettings;
  generalSettings: GeneralSettings;
  hasUnsavedChanges: boolean;
  
  // Actions
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  
  // 이동평균선 관리
  addPriceMA: (ma: Partial<MovingAverage>) => void;
  updatePriceMA: (id: string, ma: Partial<MovingAverage>) => void;
  removePriceMA: (id: string) => void;
  addVolumeMA: (ma: Partial<MovingAverage>) => void;
  updateVolumeMA: (id: string, ma: Partial<MovingAverage>) => void;
  removeVolumeMA: (id: string) => void;
  
  // 타임프레임별 MA 설정
  setTimeframeMA: (timeframe: string, settings: TimeframeMASettings) => void;
  addTimeframePriceMA: (timeframe: string, ma: Partial<MovingAverage>) => void;
  updateTimeframePriceMA: (timeframe: string, id: string, ma: Partial<MovingAverage>) => void;
  removeTimeframePriceMA: (timeframe: string, id: string) => void;
  addTimeframeVolumeMA: (timeframe: string, ma: Partial<MovingAverage>) => void;
  updateTimeframeVolumeMA: (timeframe: string, id: string, ma: Partial<MovingAverage>) => void;
  removeTimeframeVolumeMA: (timeframe: string, id: string) => void;
  copyTimeframeSettings: (fromTimeframe: string, toTimeframe: string) => void;
  
  // 타임프레임 단축키 관리
  setTimeframeShortcut: (key: string, timeframe: string | null) => void;
  removeTimeframeShortcut: (key: string) => void;
  getTimeframeByShortcut: (key: string) => string | undefined;
  
  // 차트 단축키 관리
  setChartShortcut: (action: string, key: string) => void;
  resetChartShortcut: (action: string) => void;
  resetAllChartShortcuts: () => void;
  
  // 메뉴 단축키 관리
  setMenuShortcut: (menu: string, key: string) => void;
  removeMenuShortcut: (menu: string) => void;
  getMenuByShortcut: (key: string) => MenuShortcut | undefined;
  resetMenuShortcuts: () => void;
  
  // 셋업 카테고리 관리
  addSetupCategory: (category: string) => void;
  removeSetupCategory: (category: string) => void;
  updateSetupCategories: (categories: string[]) => void;
  
  // 편집 모드
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
  
  // 변경사항 저장/취소
  saveChanges: () => void;
  cancelChanges: () => void;
  
  // 기본값으로 초기화
  resetToDefaults: () => void;
}