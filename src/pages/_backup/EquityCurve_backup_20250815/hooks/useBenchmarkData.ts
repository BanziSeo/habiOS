import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { BenchmarkType } from '../types';
import { getBenchmarkDateRange } from '../utils';

/**
 * 벤치마크 데이터 로딩 훅
 */
export function useBenchmarkData(
  equityCurveData: Array<{ date: string }>,
  selectedBenchmarks: BenchmarkType[]
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, Array<{ date: string; value: number }>>>({});

  const loadBenchmarkData = async () => {
    if (selectedBenchmarks.length === 0 || equityCurveData.length === 0) {
      setData({});
      return;
    }

    const dateRange = getBenchmarkDateRange(equityCurveData);
    if (!dateRange) return;

    setLoading(true);
    try {
      const benchmarkData = await window.electronAPI.benchmark.fetch(
        selectedBenchmarks,
        dateRange.startDate,
        dateRange.endDate
      );
      
      setData(benchmarkData);
      message.success('벤치마크 데이터를 불러왔습니다.');
    } catch (error) {
      console.error('Failed to load benchmark data:', error);
      message.error('벤치마크 데이터를 불러오는데 실패했습니다.');
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenchmarkData();
  }, [selectedBenchmarks.join(','), equityCurveData.length]);

  return {
    benchmarkData: data,
    benchmarkLoading: loading,
    reloadBenchmarks: loadBenchmarkData
  };
}