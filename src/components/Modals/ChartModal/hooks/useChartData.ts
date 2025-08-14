import { useState, useEffect } from 'react';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import type { Candle } from 'chart-0714';
import { priceService } from '../../../../services/priceService';
import { TIMEFRAME_OPTIONS } from '../constants';
import { resampleCandles } from '../utils';

// 임시 더미 데이터 생성 함수
const generateDummyData = (): Candle[] => {
  const data: Candle[] = [];
  let basePrice = 100;
  const now = Date.now();
  const days = 100;
  
  for (let i = 0; i < days; i++) {
    const time = Math.floor((now - (days - i) * 24 * 60 * 60 * 1000) / 1000); // 초 단위 Unix timestamp
    const change = (Math.random() - 0.5) * 4;
    basePrice = Math.max(50, basePrice + change);
    
    const open = basePrice + (Math.random() - 0.5) * 2;
    const close = open + (Math.random() - 0.5) * 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.random() * 1000000 + 500000;
    
    data.push({ time, open, high, low, close, volume });
  }
  
  return data;
};

export const useChartData = (ticker: string, selectedTimeframe: string) => {
  const { t } = useTranslation('messages');
  const { message } = App.useApp();
  const [chartData, setChartData] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const timeframeConfig = TIMEFRAME_OPTIONS.find(tf => tf.value === selectedTimeframe);
        if (!timeframeConfig) throw new Error('Invalid timeframe');

        let formattedData: Candle[];

        if (timeframeConfig.needsResample) {
          // 리샘플링이 필요한 경우 (3분, 10분, 65분)
          const sourceData = await priceService.fetchPriceData(
            ticker, 
            timeframeConfig.days,
            timeframeConfig.sourceInterval
          );
          
          // chart-0714 형식으로 변환
          const sourceCandles = sourceData
            .filter(candle => {
              return candle.timestamp && 
                     !isNaN(candle.timestamp) && 
                     !isNaN(candle.open) && 
                     !isNaN(candle.high) && 
                     !isNaN(candle.low) && 
                     !isNaN(candle.close);
            })
            .map(candle => ({
              time: Math.floor(candle.timestamp / 1000),
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume || 0,
            }))
            .sort((a, b) => a.time - b.time);

          // 리샘플링 적용 (수동으로 처리)
          formattedData = resampleCandles(sourceCandles, timeframeConfig.groupSize!);
        } else {
          // 직접 가져오는 경우
          const priceData = await priceService.fetchPriceData(
            ticker, 
            timeframeConfig.days,
            timeframeConfig.value
          );
          
          // chart-0714 형식으로 변환
          formattedData = priceData
            .filter(candle => {
              return candle.timestamp && 
                     !isNaN(candle.timestamp) && 
                     !isNaN(candle.open) && 
                     !isNaN(candle.high) && 
                     !isNaN(candle.low) && 
                     !isNaN(candle.close);
            })
            .map(candle => ({
              time: Math.floor(candle.timestamp / 1000),
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume || 0,
            }))
            .sort((a, b) => a.time - b.time);
        }
        
        if (formattedData.length === 0) {
          throw new Error('No valid price data received');
        }
        
        setChartData(formattedData);
      } catch (error) {
        message.error(t('chart.loadPriceFailed'));
        setError(error as Error);
        
        // 실패 시 더미 데이터 사용
        const dummyData = generateDummyData();
        setChartData(dummyData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, selectedTimeframe, message, t]);

  return { chartData, loading, error };
};