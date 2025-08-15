import React from 'react';
import { Space, Switch, DatePicker, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { BenchmarkType } from '../types';
import { BENCHMARK_OPTIONS } from '../constants';

const { RangePicker } = DatePicker;

interface ChartControlsProps {
  showPercentage: boolean;
  onShowPercentageChange: (value: boolean) => void;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  onDateRangeChange: (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
  selectedBenchmarks: BenchmarkType[];
  onBenchmarksChange: (benchmarks: BenchmarkType[]) => void;
  benchmarkLoading: boolean;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  showPercentage,
  onShowPercentageChange,
  dateRange,
  onDateRangeChange,
  selectedBenchmarks,
  onBenchmarksChange,
  benchmarkLoading
}) => {
  const { t } = useTranslation('equityCurve');
  
  return (
    <Space size="large" wrap>
      <Switch
        checked={showPercentage}
        onChange={onShowPercentageChange}
        checkedChildren="%"
        unCheckedChildren="$"
      />
      
      <RangePicker
        value={dateRange}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            onDateRangeChange([dates[0], dates[1]]);
          } else {
            onDateRangeChange(null);
          }
        }}
        format="YYYY-MM-DD"
      />
      
      <Select
        mode="multiple"
        placeholder={t('controls.benchmark')}
        style={{ width: 300 }}
        loading={benchmarkLoading}
        value={selectedBenchmarks}
        onChange={onBenchmarksChange}
        options={BENCHMARK_OPTIONS.map(option => ({
          ...option,
          label: t(`benchmark.${option.value.toLowerCase()}`)
        }))}
      />
    </Space>
  );
};