import { useEffect } from 'react';
// @ts-ignore
import { Chart } from 'chart-0714';
import type { ChartSettings } from '../../../../stores/settings/types';

interface UseChartInitializationProps {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  chartRef: React.MutableRefObject<Chart | null>;
  setChartReady: (ready: boolean) => void;
  chartSettings: ChartSettings;
  chartTheme: string;
  maIdsRef: React.MutableRefObject<{ id: string; maId: string; type: string; period: number }[]>;
  avgPriceLineIdRef: React.MutableRefObject<string | null>;
  stopLossLineIdsRef: React.MutableRefObject<string[]>;
}

export const useChartInitialization = ({
  containerRef,
  chartRef,
  setChartReady,
  chartSettings,
  chartTheme,
  maIdsRef,
  avgPriceLineIdRef,
  stopLossLineIdsRef
}: UseChartInitializationProps) => {
  // ResizeObserver로 컨테이너 크기 변경 감지
  useEffect(() => {
    if (!containerRef.current || !chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [chartRef.current]); // chartReady 대신 chartRef.current 사용

  // 차트 초기화
  useEffect(() => {
    if (!containerRef.current) return;

    let chart: Chart | null = null;

    const initializeChart = async () => {
      try {
        
        // 차트 생성
        chart = new Chart({
          container: containerRef.current!,
          theme: chartTheme as 'dark' | 'light', // 초기 테마를 실제 테마로 설정
          chartType: chartSettings.chartType, // 초기 차트 타입도 실제 설정으로
          cursorType: chartSettings.cursorType, // 마우스 커서 타입 설정
          debug: false, // 디버그 모드 비활성화
          
          // 캔들 색상 초기 설정
          candle: {
            upColor: chartSettings.upColor,
            downColor: chartSettings.downColor,
            borderUpColor: chartSettings.upColor,
            borderDownColor: chartSettings.downColor,
            wickUpColor: chartSettings.upColor,
            wickDownColor: chartSettings.downColor
          },
          
          // 볼륨 설정 - 투명도 없이 색상만
          volume: {
            enabled: true,
            height: 0.2,  // 전체 높이의 20%
            upColor: chartSettings.volumeUpColor,
            downColor: chartSettings.volumeDownColor
          },
          
          // 볼륨 패널 설정 (볼륨 MA 포함, opacity 추가)
          panels: {
            volume: {
              showMA: chartSettings.volumeMovingAverages.some((ma) => ma.enabled),
              maLength: chartSettings.volumeMovingAverages.find((ma) => ma.enabled)?.period || 20,
              maColor: chartSettings.volumeMovingAverages.find((ma) => ma.enabled)?.color || '#ffeb3b',
              opacity: chartSettings.volumeOpacity
            },
            divider: {
              color: chartSettings.panelDivider?.color || '#363a45',
              thickness: chartSettings.panelDivider?.thickness || 4,
              hoverColor: chartSettings.panelDivider?.hoverColor || '#666666',
              draggable: chartSettings.panelDivider?.draggable !== false
            }
          },
        
        // 그리드 설정 (항상 표시)
        grid: {
          show: true,
          horizontal: {
            show: true,
            color: chartTheme === 'dark' ? '#252525' : '#e0e0e0',
            style: 'solid'
          },
          vertical: {
            show: true,
            color: chartTheme === 'dark' ? '#252525' : '#e0e0e0',
            style: 'solid'
          }
        },
        
        // 축 색상 설정 - 타입 정의는 없지만 실제로는 지원됨
        axis: {
          textColor: chartSettings.axisTextColor || '#758696',
          dividerColor: chartSettings.axisDividerColor || '#363a45'
        } as any,
        
        // 크로스헤어
        crosshair: {
          show: true,
          mode: 'magnet',
          line: {
            color: '#758696',
            style: 'dashed',
            width: 1
          },
          label: {
            show: true,
            backgroundColor: chartTheme === 'dark' ? '#2a2e39' : '#f0f3fa',
            textColor: chartTheme === 'dark' ? '#d1d4dc' : '#131722'
          }
        },
        
        // 가격 스케일 여백 초기 설정
        priceScaleMargin: {
          top: chartSettings.chartMargins?.top || 0.1,
          bottom: chartSettings.chartMargins?.bottom || 0.1
        },
        
        // 오른쪽 여백 설정
        rightMargin: chartSettings.chartMargins?.right || 5,
        
        // 오토스케일 설정
        autoScale: chartSettings.autoScale,
        
        // 로그 스케일 설정
        logScale: chartSettings.logScale !== undefined ? chartSettings.logScale : true,
        
        // 커스텀 단축키 설정
        shortcuts: chartSettings.chartShortcuts,
        
        // 성능 설정
        maxCandles: 5000,
        immediateRender: true,
        
        // 로컬 스토리지 설정 저장
        localStorage: false  // 설정은 zustand로 관리
        });

        // 차트가 준비될 때까지 대기
        await chart.waitUntilReady();

        chartRef.current = chart;
        setChartReady(true);
        

        // 초기 설정 적용
        // 차트 타입 설정
        chart.setChartType(chartSettings.chartType);
        
        // 캔들 색상 설정
        chart.updateCandleColors({
          upColor: chartSettings.upColor,
          downColor: chartSettings.downColor,
          borderUpColor: chartSettings.upColor,
          borderDownColor: chartSettings.downColor,
          wickColor: chartSettings.upColor
        });
        
        // 볼륨 색상 설정 (투명도 없이)
        
        chart.updateVolumeColors({
          up: chartSettings.volumeUpColor,
          down: chartSettings.volumeDownColor
        });
        
        // 볼륨 투명도 설정
        chart.updateSettings({
          panels: {
            volume: {
              opacity: chartSettings.volumeOpacity
            }
          }
        });

        // 배경색 설정
        if (chartSettings.chartBackgroundColor) {
          // 차트 배경색 설정 시도
          chart.updateSettings({
            background: chartSettings.chartBackgroundColor
          });
          
          // theme 객체에 직접 설정 시도
          if (chart['theme']) {
            chart['theme'].backgroundColor = chartSettings.chartBackgroundColor;
          }
        }
        
        // 드로잉 기본 설정 적용
        if (chartSettings.drawingDefaults) {
          chart.setDefaultDrawingStyle({
            color: chartSettings.drawingDefaults.color,
            lineWidth: chartSettings.drawingDefaults.lineWidth,
            opacity: chartSettings.drawingDefaults.opacity
          });
        }
        
        // 수동 마커 기본 설정 적용
        if (chartSettings.manualMarker) {
          chart.setDefaultDrawingStyle({
            color: chartSettings.manualMarker.color,  // markerColor 대신 color 사용
            markerType: chartSettings.manualMarker.shape,
            markerSize: chartSettings.manualMarker.size
          });
        }
        
        // 텍스트 기본 설정 적용
        if (chartSettings.textDefaults && chart.setTextDefaults) {
          chart.setTextDefaults(chartSettings.textDefaults);
        }
        
        // 축 색상 설정 - 타입 정의는 없지만 실제로는 지원됨
        chart.updateSettings({
          axis: {
            textColor: chartSettings.axisTextColor || '#758696',
            dividerColor: chartSettings.axisDividerColor || '#363a45'
          } as any
        });
        
        // 볼륨 패널 설정 업데이트
        if (chartSettings.volumeMovingAverages && chartSettings.volumeMovingAverages.length > 0) {
          const enabledVolumeMA = chartSettings.volumeMovingAverages.find((ma) => ma.enabled);
          if (enabledVolumeMA) {
            chart.updateSettings({
              panels: {
                volume: {
                  showMA: true,
                  maLength: enabledVolumeMA.period,
                  maColor: enabledVolumeMA.color,
                  opacity: chartSettings.volumeOpacity
                }
              }
            });
          }
        }
        
      } catch (err) {
      }
    };

    initializeChart();

    return () => {
      if (chartRef.current) {
        try {
          maIdsRef.current.forEach(({ maId }) => {
            try {
              chartRef.current?.removeIndicator(maId);
            } catch (e) {
            }
          });
          maIdsRef.current = [];
          
          try {
            if (avgPriceLineIdRef.current) {
              chartRef.current.updateAveragePriceLine(avgPriceLineIdRef.current, { price: -1 });
            }
            chartRef.current.clearStopLossLines();
          } catch (e) {
          }
          avgPriceLineIdRef.current = null;
          stopLossLineIdsRef.current = [];
          
          chartRef.current.dispose();
          chartRef.current = null;
        } catch (err) {
        }
      }
      
      setChartReady(false);
    };
  }, []); // 컴포넌트 마운트 시에만 차트 생성
};