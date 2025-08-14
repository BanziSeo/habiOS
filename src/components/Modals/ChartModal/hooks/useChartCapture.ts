import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import type { Chart } from 'chart-0714';
import type { Position } from '../../../../types';
import { useChartBookStore } from '../../../../stores/chartBookStore';

interface UseChartCaptureProps {
  chartRef: React.MutableRefObject<Chart | null>;
  displayTicker: string;
  position: Position;
  selectedTimeframe: string;
  localPosition: Position;
  maIdsRef: React.MutableRefObject<{ id: string; maId: string; type: string; period: number }[]>;
}

export const useChartCapture = ({
  chartRef,
  displayTicker,
  position,
  selectedTimeframe,
  localPosition,
  maIdsRef
}: UseChartCaptureProps) => {
  const { t } = useTranslation('messages');
  const { addChart } = useChartBookStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!chartRef.current) {
      return;
    }

    if (isCapturing) return; // 중복 실행 방지

    setIsCapturing(true);
    try {
      let imageDataUrl: string;
      
      // 고화질 캡쳐 사용 (QHD - 2560px)
      const blob = await chartRef.current.toHighResImage();
      
      // Blob을 DataURL로 변환
      imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert blob to data URL'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 차트북에 저장
      await addChart({
        ticker: displayTicker,
        positionId: position.id,
        imageDataUrl,
        timeframe: selectedTimeframe,
        memo: '', // 메모는 나중에 차트북에서 추가
        metadata: {
          avgPrice: localPosition.avgBuyPrice?.toNumber(),
          currentPrice: localPosition.currentPrice?.toNumber(),
          priceChange: localPosition.totalPnl?.toNumber() || localPosition.unrealizedPnl?.toNumber(),
          indicators: maIdsRef.current.map(ma => `${ma.type} ${ma.period}`)
        }
      });
      
      // 커스텀 성공 알림 표시
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      
      // 캡쳐 성공 시각적 피드백
    } catch (error) {
    } finally {
      setIsCapturing(false);
    }
  }, [
    isCapturing,
    displayTicker,
    position.id,
    selectedTimeframe,
    localPosition,
    addChart,
    chartRef,
    maIdsRef,
    t
  ]);

  return {
    handleCapture,
    isCapturing,
    showSuccessAlert,
    setShowSuccessAlert
  };
};