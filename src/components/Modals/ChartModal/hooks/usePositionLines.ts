import { useEffect } from 'react';
// @ts-ignore
import type { Chart } from 'chart-0714';
import type { Position } from '../../../../types';
import type { ChartSettings } from '../../../../stores/settings/types';
import type { ChartCandle } from '../../../../types/chart';

interface UsePositionLinesProps {
  chartRef: React.MutableRefObject<Chart | null>;
  chartReady: boolean;
  isPreview?: boolean;
  chartData: ChartCandle[];
  localPosition: Position;
  chartSettings: ChartSettings;
  avgPriceLineIdRef: React.MutableRefObject<string | null>;
  stopLossLineIdsRef: React.MutableRefObject<string[]>;
}

export const usePositionLines = ({
  chartRef,
  chartReady,
  isPreview,
  chartData,
  localPosition,
  chartSettings,
  avgPriceLineIdRef,
  stopLossLineIdsRef
}: UsePositionLinesProps) => {
  // 평균가와 스탑로스 라인 그리기
  useEffect(() => {
    if (!chartRef.current || !chartReady || isPreview || chartData.length === 0) return;

    // 기존 라인 제거
    try {
      // 평균가 라인 제거
      if (avgPriceLineIdRef.current) {
        chartRef.current.updateAveragePriceLine(avgPriceLineIdRef.current, { price: -1 });
        avgPriceLineIdRef.current = null;
      }
      
      // 스탑로스 라인 제거
      chartRef.current.clearStopLossLines();
      stopLossLineIdsRef.current = [];
    } catch (e) {
    }

    // 평균가 라인 추가
    if (localPosition.avgBuyPrice && localPosition.totalShares > 0 && chartSettings.averagePriceLine?.enabled) {
      const avgPrice = localPosition.avgBuyPrice.toNumber();
      
      try {
        const avgPriceId = chartRef.current.addAveragePriceLine(avgPrice, {
          label: `평균가: $${avgPrice.toFixed(2)}`,
          color: chartSettings.averagePriceLine.color || '#2196F3',
          lineWidth: chartSettings.averagePriceLine.lineWidth || 2,
          dashed: chartSettings.averagePriceLine.lineStyle === 'dashed'
        });
        if (avgPriceId) {
          avgPriceLineIdRef.current = avgPriceId;
        }
      } catch (e) {
      }
    }

    // 스탑로스 라인 추가
    if (localPosition.stopLosses && localPosition.stopLosses.length > 0) {
      localPosition.stopLosses.forEach((stopLoss, index) => {
        if (stopLoss.isActive !== false && chartSettings.stopLossLines && index < chartSettings.stopLossLines.length) { // 최대 5개
          const stopPrice = stopLoss.stopPrice.toNumber();
          const lineSettings = chartSettings.stopLossLines[index];
          
          try {
            const stopLossId = chartRef.current?.addStopLossLine(stopPrice, {
              label: `스탑 ${index + 1}: $${stopPrice.toFixed(2)} (${stopLoss.stopQuantity}주)`,
              color: lineSettings.color || '#F44336',
              lineWidth: lineSettings.lineWidth || 1,
              dashed: lineSettings.lineStyle === 'dashed'
            });
            if (stopLossId) {
              stopLossLineIdsRef.current.push(stopLossId);
            }
          } catch (e) {
          }
        }
      });
    }
  }, [localPosition, isPreview, chartData, chartReady, chartSettings, chartRef, avgPriceLineIdRef, stopLossLineIdsRef]);
};