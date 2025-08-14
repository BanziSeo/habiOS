import React from 'react';
import { theme } from 'antd';
import { useSettingsStore } from '../../../../stores/settingsStore';
import './ChartSettings.css';
import { ChartTypeSection } from './sections/ChartTypeSection';
import { AxisAndGridSection } from './sections/AxisAndGridSection';
import { ViewAndMarginSection } from './sections/ViewAndMarginSection';
import { MovingAverageSection } from './sections/MovingAverageSection';
import { PriceAndStopLossSection } from './sections/PriceAndStopLossSection';
import { MarkersAndDrawingSection } from './sections/MarkersAndDrawingSection';

export const ChartSettings: React.FC = React.memo(() => {
  const { token } = theme.useToken();
  const { 
    chartSettings, 
    updateChartSettings,
    addPriceMA,
    updatePriceMA,
    removePriceMA,
    addVolumeMA,
    updateVolumeMA,
    removeVolumeMA,
    addTimeframePriceMA,
    updateTimeframePriceMA,
    removeTimeframePriceMA,
    addTimeframeVolumeMA,
    updateTimeframeVolumeMA,
    removeTimeframeVolumeMA,
  } = useSettingsStore();
  
  // selectedTimeframe 상태는 MovingAverageSection으로 이동됨
  

  return (
    <div 
      className="chart-settings-container"
      style={{
        background: token.colorBgLayout,
      }}
    >
      {/* 차트 타입 & 색상 */}
      <ChartTypeSection 
        chartSettings={chartSettings}
        updateChartSettings={updateChartSettings}
      />

      {/* 축 & 그리드 */}
      <AxisAndGridSection
        chartSettings={chartSettings}
        updateChartSettings={updateChartSettings}
      />

      {/* 보기 & 여백 */}
      <ViewAndMarginSection
        chartSettings={chartSettings}
        updateChartSettings={updateChartSettings}
      />

      {/* 이동평균선 */}
      <MovingAverageSection
        chartSettings={chartSettings}
        addPriceMA={addPriceMA}
        updatePriceMA={updatePriceMA}
        removePriceMA={removePriceMA}
        addVolumeMA={addVolumeMA}
        updateVolumeMA={updateVolumeMA}
        removeVolumeMA={removeVolumeMA}
        addTimeframePriceMA={addTimeframePriceMA}
        updateTimeframePriceMA={updateTimeframePriceMA}
        removeTimeframePriceMA={removeTimeframePriceMA}
        addTimeframeVolumeMA={addTimeframeVolumeMA}
        updateTimeframeVolumeMA={updateTimeframeVolumeMA}
        removeTimeframeVolumeMA={removeTimeframeVolumeMA}
      />

      {/* 가격 & 손절선 */}
      <PriceAndStopLossSection
        chartSettings={chartSettings}
        updateChartSettings={updateChartSettings}
      />

      {/* 마커 & 그리기 */}
      <MarkersAndDrawingSection
        chartSettings={chartSettings}
        updateChartSettings={updateChartSettings}
      />


    </div>
  );
});