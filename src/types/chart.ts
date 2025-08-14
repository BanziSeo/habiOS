// Chart-0714 library types
// Since the library doesn't provide types, we define our own interface

// Candle data structure (from chart-0714)
export interface ChartCandle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Chart {
  // Core methods
  waitUntilReady(): Promise<void>;
  dispose(): void;
  resize(): void;
  render(): void;
  setDirty(dirty: boolean): void;
  
  // Chart type and settings
  setChartType(type: 'candle' | 'hollow' | 'bar'): void;
  setCursorType(type: 'default' | 'crosshair' | 'dot'): void;
  updateSettings(settings: Partial<ChartOptions>): void;
  
  // Data methods
  setData(data: ChartCandle[]): void;
  updateData(data: ChartCandle[]): void;
  
  // Color methods
  updateCandleColors(colors: {
    upColor: string;
    downColor: string;
    borderUpColor: string;
    borderDownColor: string;
    wickColor: string;
  }): void;
  updateVolumeColors(colors: {
    up: string;
    down: string;
  }): void;
  
  // Indicator methods
  addIndicator(config: IndicatorConfig): string;
  removeIndicator(id: string): void;
  updateIndicator(id: string, config: Partial<IndicatorConfig>): void;
  
  // Marker methods
  addMarker(config: MarkerConfig): void;
  clearMarkers(): void;
  
  // Line methods
  updateAveragePriceLine(id: string, config: { price: number }): void;
  clearStopLossLines(): void;
  
  // Drawing methods
  setDefaultDrawingStyle(style: {
    color: string;
    lineWidth: number;
    opacity: number;
  }): void;
  setTextDefaults(defaults: TextDefaults): void;
  
  // Viewport methods
  updatePriceRangeForVisibleData(): void;
  
  // Properties (may be internal - 의도적 any: 내부 구현)
  theme?: unknown;
  options?: ChartOptions;
  isDirty?: boolean;
  renderingManager?: unknown; // 내부 구현 객체
  interactionManager?: unknown; // 내부 구현 객체
}

// Type definitions for chart configurations
export interface IndicatorConfig {
  type: 'MA' | 'EMA' | 'RSI' | 'MACD' | 'BB' | string;
  period?: number;
  color?: string;
  lineWidth?: number;
  visible?: boolean;
  panel?: 'main' | 'bottom';
  [key: string]: unknown; // 추가 설정을 위한 유연성
}

export interface MarkerConfig {
  time: number;
  position: 'aboveBar' | 'belowBar';
  color: string;
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  text?: string;
  size?: number;
}

export interface TextDefaults {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export interface ChartOptions {
  container?: HTMLElement;
  theme?: 'dark' | 'light';
  chartType?: 'candle' | 'hollow' | 'bar';
  cursorType?: 'default' | 'crosshair' | 'dot';
  debug?: boolean;
  
  candle?: {
    upColor: string;
    downColor: string;
    borderUpColor: string;
    borderDownColor: string;
    wickUpColor: string;
    wickDownColor: string;
  };
  
  volume?: {
    enabled: boolean;
    height: number;
    upColor: string;
    downColor: string;
  };
  
  panels?: {
    volume?: {
      showMA: boolean;
      maLength: number;
      maColor: string;
      opacity: number;
    };
    divider?: {
      color: string;
      thickness: number;
      hoverColor: string;
      draggable: boolean;
    };
  };
  
  grid?: {
    show: boolean;
    horizontal: {
      show: boolean;
      color: string;
      style: string;
    };
    vertical: {
      show: boolean;
      color: string;
      style: string;
    };
  };
  
  axis?: {
    textColor: string;
    dividerColor: string;
  };
  
  crosshair?: {
    show: boolean;
    mode: string;
    line: {
      color: string;
      style: string;
      width: number;
    };
    label: {
      show: boolean;
      backgroundColor: string;
      textColor: string;
    };
  };
  
  priceScaleMargin?: {
    top: number;
    bottom: number;
  };
  
  rightMargin?: number;
  autoScale?: boolean;
  logScale?: boolean;
  shortcuts?: { [key: string]: string };
  
  maxCandles?: number;
  immediateRender?: boolean;
  localStorage?: boolean;
  background?: string;
}