import { useMemo } from 'react';
import type { EquityCurve } from '../../../../types';
import type { MovingAverage, BenchmarkType } from '../types';
import { 
  transformToChartData, 
  addMovingAveragesToChartData,
  mergeBenchmarkData 
} from '../utils';

interface UseChartDataProps {
  equityCurveData: EquityCurve[];
  showPercentage: boolean;
  movingAverages: MovingAverage[];
  benchmarkData: Record<string, Array<{ date: string; value: number }>>;
  selectedBenchmarks: BenchmarkType[];
}

/**
 * 차트 데이터 변환 및 관리 훅
 */
export function useChartData({
  equityCurveData,
  showPercentage,
  movingAverages,
  benchmarkData,
  selectedBenchmarks
}: UseChartDataProps) {
  
  const chartData = useMemo(() => {
    // 1. 기본 차트 데이터 변환
    const basicData = transformToChartData(equityCurveData, showPercentage);
    
    // 2. 이동평균선 추가
    const dataWithMA = addMovingAveragesToChartData(basicData, movingAverages);
    
    // 3. 벤치마크 데이터 병합
    const finalData = mergeBenchmarkData(dataWithMA, benchmarkData, selectedBenchmarks);
    
    return finalData;
  }, [
    equityCurveData, 
    showPercentage, 
    movingAverages, 
    benchmarkData, 
    selectedBenchmarks
  ]);

  return chartData;
}