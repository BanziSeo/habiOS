import { useEffect } from 'react';
// @ts-ignore
import type { Chart } from 'chart-0714';
import type { ChartSettings } from '../../../../stores/settings/types';

interface UseChartSettingsProps {
  chartRef: React.MutableRefObject<Chart | null>;
  chartSettings: ChartSettings;
  chartTheme: string;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const useChartSettings = ({
  chartRef,
  chartSettings,
  chartTheme,
  containerRef
}: UseChartSettingsProps) => {
  // 차트 단축키 변경
  useEffect(() => {
    if (!chartRef.current) return;
    
    // chart-0714에 단축키 업데이트
    if (chartRef.current.updateSettings) {
      chartRef.current.updateSettings({
        shortcuts: chartSettings.chartShortcuts
      });
    }
  }, [chartSettings.chartShortcuts]);
  
  // 캔들 색상 변경
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.updateCandleColors({
      upColor: chartSettings.upColor,
      downColor: chartSettings.downColor,
      borderUpColor: chartSettings.upColor,
      borderDownColor: chartSettings.downColor,
      wickColor: chartSettings.upColor
    });
  }, [chartSettings.upColor, chartSettings.downColor]);

  // 볼륨 색상 변경
  useEffect(() => {
    if (!chartRef.current) return;
    
    // 색상만 업데이트 (투명도 없이)
    chartRef.current.updateVolumeColors({
      up: chartSettings.volumeUpColor,
      down: chartSettings.volumeDownColor
    });
  }, [chartSettings.volumeUpColor, chartSettings.volumeDownColor]);

  // 볼륨 투명도 변경
  useEffect(() => {
    if (!chartRef.current) return;
    
    // 볼륨 패널 설정 업데이트
    chartRef.current.updateSettings({
      panels: {
        volume: {
          opacity: chartSettings.volumeOpacity
        }
      }
    });
  }, [chartSettings.volumeOpacity]);

  // 차트 타입 변경
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.setChartType(chartSettings.chartType);
  }, [chartSettings.chartType]);
  
  // 마우스 커서 타입 변경
  useEffect(() => {
    if (!chartRef.current || !chartRef.current.setCursorType) return;
    
    chartRef.current.setCursorType(chartSettings.cursorType || 'crosshair');
  }, [chartSettings.cursorType]);

  // 차트 배경색 변경
  useEffect(() => {
    if (!chartRef.current) return;
    
    // 테마 객체 직접 수정
    if (chartRef.current['theme']) {
      chartRef.current['theme'].backgroundColor = chartSettings.chartBackgroundColor || (chartTheme === 'dark' ? '#131722' : '#ffffff');
    }
    
    // updateSettings도 시도
    chartRef.current.updateSettings({
      background: chartSettings.chartBackgroundColor || (chartTheme === 'dark' ? '#131722' : '#ffffff')
    });
    
    // 차트 강제 업데이트 (resize를 호출하면 다시 그려짐)
    chartRef.current.resize();
    
    // 컨테이너 스타일도 업데이트
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = chartSettings.chartBackgroundColor || (chartTheme === 'dark' ? '#131722' : '#ffffff');
    }
  }, [chartSettings.chartBackgroundColor, chartTheme]);

  // 축 색상 업데이트 - 타입 정의는 없지만 실제로는 지원됨
  useEffect(() => {
    if (!chartRef.current) return;
    
    const textColor = chartSettings.axisTextColor || '#758696';
    const dividerColor = chartSettings.axisDividerColor || '#363a45';
    
    // test-realtime-settings.html과 동일한 형식으로 전달
    chartRef.current.updateSettings({
      axis: {
        textColor: textColor,
        dividerColor: dividerColor
      } as any
    });
  }, [chartSettings.axisTextColor, chartSettings.axisDividerColor]);

  // 드로잉 기본 설정 업데이트
  useEffect(() => {
    if (!chartRef.current || !chartSettings.drawingDefaults) return;
    
    chartRef.current.setDefaultDrawingStyle({
      color: chartSettings.drawingDefaults.color,
      lineWidth: chartSettings.drawingDefaults.lineWidth,
      opacity: chartSettings.drawingDefaults.opacity
    });
    
  }, [chartSettings.drawingDefaults]);
  
  // 수동 마커 기본 설정 업데이트
  useEffect(() => {
    if (!chartRef.current || !chartSettings.manualMarker) return;
    
    chartRef.current.setDefaultDrawingStyle({
      color: chartSettings.manualMarker.color,  // markerColor 대신 color 사용
      markerType: chartSettings.manualMarker.shape,
      markerSize: chartSettings.manualMarker.size
    });
  }, [chartSettings.manualMarker]);
  
  // 그리드 색상 업데이트
  useEffect(() => {
    if (!chartRef.current) return;
    
    const gridColor = chartTheme === 'dark' ? '#252525' : '#e0e0e0';
    
    chartRef.current.updateSettings({
      grid: {
        show: true,
        horizontal: {
          show: true,
          color: gridColor,
          style: 'solid'
        },
        vertical: {
          show: true,
          color: gridColor,
          style: 'solid'
        }
      }
    });
  }, [chartTheme]);

  // 스케일 설정 변경 시 업데이트
  useEffect(() => {
    if (!chartRef.current) return;
    
    // 가격 스케일 여백 업데이트
    chartRef.current.updateSettings({
      priceScaleMargin: {
        top: chartSettings.chartMargins?.top || 0.1,
        bottom: chartSettings.chartMargins?.bottom || 0.1
      },
      rightMargin: chartSettings.chartMargins?.right || 5,
      logScale: chartSettings.logScale
    });
    
    // 강제로 다시 렌더링 트리거
    if (chartRef.current['render']) {
      chartRef.current['render']();
    }
    
    // 오토스케일이 켜져있을 때 뷰포트 기반 오토스케일 적용
    if (chartSettings.autoScale) {
      chartRef.current.updatePriceRangeForVisibleData();
    }
  }, [chartSettings.autoScale, chartSettings.chartMargins, chartSettings.logScale]);

  // 볼륨 MA 설정 변경 시 업데이트
  useEffect(() => {
    if (!chartRef.current) return;
    
    const enabledVolumeMA = chartSettings.volumeMovingAverages.find((ma) => ma.enabled);
    if (enabledVolumeMA) {
      chartRef.current.updateSettings({
        panels: {
          volume: {
            showMA: true,
            maLength: enabledVolumeMA.period,
            maColor: enabledVolumeMA.color
          }
        }
      });
    } else {
      chartRef.current.updateSettings({
        panels: {
          volume: {
            showMA: false
          }
        }
      });
    }
  }, [chartSettings.volumeMovingAverages]);

  // 패널 구분선 설정 변경 시 업데이트
  // 참고: chart-0714에서 패널 구분선은 새로고침이 필요함 (실시간 반영 제한)
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.updateSettings({
      panels: {
        divider: {
          color: chartSettings.panelDivider?.color || '#363a45',
          thickness: chartSettings.panelDivider?.thickness || 4,
          hoverColor: chartSettings.panelDivider?.hoverColor || '#666666',
          draggable: chartSettings.panelDivider?.draggable !== false
        }
      }
    });
  }, [chartSettings.panelDivider]);
};