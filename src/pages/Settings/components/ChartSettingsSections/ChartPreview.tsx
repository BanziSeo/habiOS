import React, { useState, useEffect } from 'react';
import { ChartModal } from '../../../../components/Modals/ChartModal';
import { createDummyPosition } from '../../../../utils/dummyData';
import { useChartData } from '../../../../components/Modals/ChartModal/hooks/useChartData';
import type { Position } from '../../../../types';

export const ChartPreview: React.FC = () => {
  const ticker = 'SPY';
  const timeframe = '1d';
  const { chartData } = useChartData(ticker, timeframe);
  const [dummyPosition, setDummyPosition] = useState<Position | null>(null);
  
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const currentPrice = chartData[chartData.length - 1].close;
      const position = createDummyPosition(ticker, currentPrice, chartData);
      setDummyPosition(position);
    }
  }, [chartData]);
  
  if (!dummyPosition) {
    // 데이터 로딩 중이거나 초기 상태
    return (
      <div style={{ height: '100%', position: 'relative', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>차트 로딩 중...</span>
      </div>
    );
  }
  
  return (
    <div style={{ height: '100%', position: 'relative', minHeight: '200px' }}>
      <ChartModal
        position={dummyPosition}
        isPreview={true}
      />
    </div>
  );
};