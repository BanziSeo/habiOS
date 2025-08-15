import type { ChartData, BenchmarkType } from '../types';

/**
 * 차트 데이터에 벤치마크 데이터 병합
 */
export function mergeBenchmarkData(
  chartData: ChartData[],
  benchmarkData: Record<string, Array<{ date: string; value: number }>>,
  selectedBenchmarks: BenchmarkType[]
): ChartData[] {
  return chartData.map(item => {
    const newItem: ChartData = { ...item };
    
    selectedBenchmarks.forEach(benchmark => {
      const benchmarkItem = benchmarkData[benchmark]?.find(b => b.date === item.date);
      if (benchmarkItem) {
        newItem[benchmark] = benchmarkItem.value;
      }
    });
    
    return newItem;
  });
}

/**
 * 벤치마크 데이터를 퍼센트로 정규화
 */
export function normalizeBenchmarkData(
  benchmarkData: Array<{ date: string; value: number }>,
  showPercentage: boolean
): Array<{ date: string; value: number }> {
  if (!showPercentage || benchmarkData.length === 0) {
    return benchmarkData;
  }

  const initialValue = benchmarkData[0].value;
  
  return benchmarkData.map(item => ({
    date: item.date,
    value: initialValue === 0 ? 100 : (item.value / initialValue) * 100
  }));
}

/**
 * 벤치마크 날짜 범위 가져오기
 */
export function getBenchmarkDateRange(equityCurveData: Array<{ date: string }>): {
  startDate: string;
  endDate: string;
} | null {
  if (equityCurveData.length === 0) {
    return null;
  }

  return {
    startDate: equityCurveData[0].date,
    endDate: equityCurveData[equityCurveData.length - 1].date
  };
}