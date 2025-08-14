import React, { useEffect, useState, useRef } from 'react';
import { Spin, Select, Button, Alert, theme } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Position } from '../../../types';
import type { Chart } from 'chart-0714';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTradingStore } from '../../../stores/tradingStore';
import { getTimeframeOptions } from './constants';
import { useChartData } from './hooks/useChartData';
import { useChartCapture } from './hooks/useChartCapture';
import { useChartShortcuts } from './hooks/useChartShortcuts';
import { usePositionLines } from './hooks/usePositionLines';
import { useChartSettings } from './hooks/useChartSettings';
import { useChartInitialization } from './hooks/useChartInitialization';

interface ChartModalProps {
  position: Position;
  ticker?: string;
  isPreview?: boolean;
}


const ChartModal: React.FC<ChartModalProps> = React.memo(({ position, ticker, isPreview }) => {
  const { t, i18n } = useTranslation('widgets');
  const { token } = theme.useToken();
  const [localPosition, setLocalPosition] = useState<Position>(position);
  const { chartSettings, generalSettings, getTimeframeByShortcut } = useSettingsStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d'); // 기본값 일봉
  
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const maIdsRef = useRef<{ id: string; maId: string; type: string; period: number }[]>([]);
  const avgPriceLineIdRef = useRef<string | null>(null);
  const stopLossLineIdsRef = useRef<string[]>([]);
  const [chartReady, setChartReady] = useState(false);
  
  const displayTicker = ticker || position.ticker;
  const { chartData, loading, error } = useChartData(displayTicker, selectedTimeframe);

  // 차트 테마 독립 설정: 'auto'면 UI 테마 따라감, 아니면 고정값 사용
  const chartTheme = chartSettings.chartTheme === 'auto' 
    ? generalSettings.theme 
    : chartSettings.chartTheme;

  // 차트 캡쳐 훅 사용
  const { handleCapture, isCapturing, showSuccessAlert, setShowSuccessAlert } = useChartCapture({
    chartRef,
    displayTicker,
    position,
    selectedTimeframe,
    localPosition,
    maIdsRef
  });

  // Zustand store 구독으로 포지션 변경 감지
  useEffect(() => {
    
    // Zustand v4 subscribe 패턴 - 전체 state를 받음
    const unsubscribe = useTradingStore.subscribe((state) => {
      const updatedPosition = state.positions.find(p => p.id === position.id);
      if (updatedPosition) {
        setLocalPosition(updatedPosition);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [position.id]);

  // 차트 초기화 훅 사용
  useChartInitialization({
    containerRef,
    chartRef,
    setChartReady,
    chartSettings,
    chartTheme,
    maIdsRef,
    avgPriceLineIdRef,
    stopLossLineIdsRef
  });

  // 키보드 단축키 훅 사용
  useChartShortcuts({
    selectedTimeframe,
    setSelectedTimeframe,
    handleCapture,
    chartSettings,
    getTimeframeByShortcut,
    containerRef
  });

  // props의 position이 변경되면 localPosition도 업데이트
  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  // 데이터 업데이트 및 마커 추가
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    try {
      // 디버깅: 차트 데이터 시간 확인
      if (selectedTimeframe === '1d' && chartData.length > 0) {
        console.log('Chart data time range:', {
          first: new Date(chartData[0].time * 1000).toISOString(),
          last: new Date(chartData[chartData.length - 1].time * 1000).toISOString(),
          count: chartData.length,
          samples: chartData.slice(-5).map(d => ({
            time: new Date(d.time * 1000).toISOString().split('T')[0],
            timestamp: d.time
          }))
        });
      }
      
      // 데이터 설정
      chartRef.current.setData(chartData);
      
      // 기존 마커 모두 제거
      chartRef.current.clearMarkers();
      
      // 거래 마커 추가 (미리보기가 아닐 때만)
      if (!isPreview && localPosition.trades) {
        localPosition.trades.forEach(trade => {
          
          // brokerDate와 brokerTime을 사용하여 영웅문 시간 그대로 timestamp 생성
          let tradeTimestamp: number;
          if (trade.brokerDate && trade.brokerTime) {
            // brokerDate: '2025/08/08' 또는 '2025-08-08' 형식
            const dateParts = trade.brokerDate.includes('/') 
              ? trade.brokerDate.split('/')
              : trade.brokerDate.split('-');
              
            if (dateParts.length !== 3) {
              console.warn('Invalid brokerDate format:', trade.brokerDate);
              return;
            }
            
            const [year, month, day] = dateParts.map(Number);
            
            // 유효한 날짜인지 확인
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
              console.warn('Invalid date values:', { year, month, day, brokerDate: trade.brokerDate });
              return;
            }
            
            // 일봉(1d)인 경우 시간 설정
            if (selectedTimeframe === '1d') {
              // 야후 파이낸스는 UTC 기준으로 일봉 데이터를 제공
              // 한국 주식: UTC 00:00 (전날 15:00 장마감 = UTC 06:00 이므로 당일 00:00으로 저장됨)
              // 미국 주식: UTC 00:00 (정확함)
              const brokerDateTime = new Date(year, month - 1, day, 0, 0, 0);
              
              // 유효한 날짜인지 확인
              if (isNaN(brokerDateTime.getTime())) {
                console.warn('Invalid date created:', { year, month, day });
                return;
              }
              
              tradeTimestamp = brokerDateTime.getTime() / 1000;
              
              // 디버깅: 마커 시간 확인
              console.log('Trade marker:', {
                brokerDate: trade.brokerDate,
                brokerDateTime: brokerDateTime.toISOString(),
                timestamp: tradeTimestamp,
                ticker: trade.ticker,
                type: trade.tradeType
              });
              
            } else {
              // 다른 타임프레임은 정확한 시간 사용
              const [hour, minute, second] = trade.brokerTime.split(':').map(Number);
              const brokerDateTime = new Date(year, month - 1, day, hour, minute, second);
              tradeTimestamp = brokerDateTime.getTime() / 1000;
              
            }
          } else {
            // fallback to tradeDate if broker time not available
            tradeTimestamp = new Date(trade.tradeDate).getTime() / 1000;
          }
          
          const isBuy = trade.tradeType === 'BUY';
          const markerSettings = isBuy ? chartSettings.tradeMarkers?.buy : chartSettings.tradeMarkers?.sell;
          
          // 마커가 비활성화되어 있으면 건너뛰기
          if (!markerSettings?.enabled) {
            return;
          }
          
          interface MarkerConfig {
            time: number;
            color: string;
            shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
            position: 'aboveBar' | 'belowBar' | 'inBar';
            size: number;
            text?: string;
            textSize?: number;
          }
          
          const markerConfig: MarkerConfig = {
            time: tradeTimestamp,
            // price를 설정하면 position이 무시되므로 제거
            // price: trade.price.toNumber(),
            color: markerSettings?.color || (isBuy ? token.colorSuccess : token.colorError),
            shape: markerSettings?.shape || (isBuy ? 'arrowUp' : 'arrowDown'),
            position: markerSettings?.position || (isBuy ? 'belowBar' : 'aboveBar'),
            size: markerSettings?.size || 12
          };
          
          
          // 텍스트 표시 설정
          if (chartSettings.tradeMarkers?.showText) {
            markerConfig.text = `${isBuy ? t('chart.tradeMarkers.buy') : t('chart.tradeMarkers.sell')}: ${trade.quantity}${i18n.language === 'ko' ? '주' : ''}`;
            markerConfig.textSize = chartSettings.tradeMarkers?.textSize || 12;
          }
          
          chartRef.current?.addMarker(markerConfig);
          
        });
      }
      
      // 기존 이동평균선 제거
      maIdsRef.current.forEach(({ maId }) => {
        chartRef.current?.removeIndicator(maId);
      });
      maIdsRef.current = [];
      
      // 타임프레임별 이동평균선 설정 가져오기
      let maSettings = chartSettings.priceMovingAverages; // 기본값: 전역 설정
      
      // 타임프레임별 설정이 있는지 확인
      if (chartSettings.timeframeMA && chartSettings.timeframeMA[selectedTimeframe]) {
        maSettings = chartSettings.timeframeMA[selectedTimeframe].priceMovingAverages;
      }
      
      // 이동평균선 적용
      maSettings
        .filter(ma => ma.enabled)
        .forEach(ma => {
          if (ma.type === 'SMA') {
            const maId = chartRef.current?.addSMA(ma.period, {
              color: ma.color,
              lineWidth: ma.width || 2,
              source: 'close'
            });
            if (maId) {
              maIdsRef.current.push({ id: ma.id, maId, type: 'SMA', period: ma.period });
            }
          } else if (ma.type === 'EMA') {
            const maId = chartRef.current?.addEMA(ma.period, {
              color: ma.color,
              lineWidth: ma.width || 2,
              source: 'close'
            });
            if (maId) {
              maIdsRef.current.push({ id: ma.id, maId, type: 'EMA', period: ma.period });
            }
          }
        });
    } catch (err) {
      console.error('Failed to update chart data:', err);
    }
  }, [chartData, isPreview, localPosition.trades, chartSettings.priceMovingAverages, chartSettings.tradeMarkers, chartSettings.timeframeMA, selectedTimeframe]);

  // 차트 설정 훅 사용
  useChartSettings({
    chartRef,
    chartSettings,
    chartTheme,
    containerRef
  });

  // 평균가와 스탑로스 라인 훅 사용
  usePositionLines({
    chartRef,
    chartReady,
    isPreview,
    chartData,
    localPosition,
    chartSettings,
    avgPriceLineIdRef,
    stopLossLineIdsRef
  });





  return (
    <div 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      onContextMenu={(e) => {
        // 차트모달 내부에서 우클릭 이벤트 전파 차단
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* 커스텀 성공 알림 */}
      {showSuccessAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10003,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <Alert
            message={t('chart.successAlert.title')}
            description={t('chart.successAlert.description')}
            type="success"
            showIcon
            closable
            onClose={() => setShowSuccessAlert(false)}
            style={{
              boxShadow: `0 4px 12px ${token.colorBgMask}`
            }}
          />
        </div>
      )}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        minHeight: '48px'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: token.colorText,
          letterSpacing: '0.5px'
        }}>
          {position.tickerName || displayTicker} {isPreview && <span style={{ fontSize: '12px', color: token.colorTextTertiary }}>{t('chart.preview')}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Select
            value={selectedTimeframe}
            onChange={setSelectedTimeframe}
            options={getTimeframeOptions().map(tf => {
              // 해당 타임프레임의 단축키 찾기
              const shortcut = chartSettings.timeframeShortcuts?.find(s => s.timeframe === tf.value);
              return {
                ...tf,
                label: shortcut ? `${tf.label} (${shortcut.key.toUpperCase()})` : tf.label,
              };
            })}
            style={{ width: 120 }}
            size="small"
          />
          {!isPreview && (
            <Button
              icon={<CameraOutlined />}
              onClick={handleCapture}
              loading={isCapturing}
              size="small"
              type="text"
              style={{ color: token.colorTextSecondary }}
            >
              {t('chart.capture')}
            </Button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        {error && <div style={{ color: 'red', padding: 16 }}>{t('chart.error')}: {error.message}</div>}
        {loading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10 
          }}>
            <Spin size="large" />
          </div>
        )}
        <div 
          ref={containerRef}
          onClick={() => containerRef.current?.focus()}
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',  // 항상 표시
            backgroundColor: chartSettings.chartBackgroundColor || token.colorBgContainer,
            borderRadius: '4px',
            outline: 'none'
          }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

export default ChartModal;
export { ChartModal };