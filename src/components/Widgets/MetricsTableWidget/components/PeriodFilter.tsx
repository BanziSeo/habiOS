import React from 'react';
import { Space, Select, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';

interface PeriodFilterProps {
  periodFilter: 'all' | '2weeks' | '1month' | 'custom';
  customDateRange: [Dayjs | null, Dayjs | null];
  onPeriodChange: (filter: 'all' | '2weeks' | '1month' | 'custom', dateRange?: [Date | null, Date | null]) => void;
  setPeriodFilter: (filter: 'all' | '2weeks' | '1month' | 'custom') => void;
  setCustomDateRange: (range: [Dayjs | null, Dayjs | null]) => void;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  periodFilter,
  customDateRange,
  onPeriodChange,
  setPeriodFilter,
  setCustomDateRange,
}) => {
  const { t } = useTranslation('widgets');

  return (
    <Space size={8}>
      <Select
        value={periodFilter}
        onChange={(value) => {
          setPeriodFilter(value);
          if (value !== 'custom') {
            setCustomDateRange([null, null]);
            onPeriodChange(value);
          }
        }}
        size="small"
        style={{ width: 130 }}
        options={[
          { label: t('metricsTable.period.all', 'All Trades'), value: 'all' },
          { label: t('metricsTable.period.twoWeeks', 'Last 2 Weeks'), value: '2weeks' },
          { label: t('metricsTable.period.oneMonth', 'Last Month'), value: '1month' },
          { label: t('metricsTable.period.custom', 'Custom'), value: 'custom' },
        ]}
      />
      
      {periodFilter === 'custom' && (
        <DatePicker.RangePicker
          value={customDateRange}
          onChange={(dates) => {
            setCustomDateRange(dates as [Dayjs | null, Dayjs | null]);
            if (dates && dates[0] && dates[1]) {
              onPeriodChange('custom', [dates[0].toDate(), dates[1].toDate()]);
            }
          }}
          size="small"
          style={{ width: 240 }}
        />
      )}
    </Space>
  );
};