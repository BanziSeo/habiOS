import React from 'react';
import { Form, Select, DatePicker, Rate, Radio, Space, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { Position } from '../../../types';

const { RangePicker } = DatePicker;

interface AnalysisFilters {
  dateRange: [Date, Date] | null;
  setupTypes: string[];
  rating: number | null;
  status: 'all' | 'active' | 'closed';
}

interface FilterWidgetProps {
  filters: AnalysisFilters;
  onFiltersChange: (filters: AnalysisFilters) => void;
  positions: Position[];
}

export const FilterWidget: React.FC<FilterWidgetProps> = ({
  filters,
  onFiltersChange,
  positions,
}) => {
  const { t } = useTranslation('analysis');

  // 사용된 셋업 타입들 추출
  const usedSetupTypes = Array.from(
    new Set(positions.map(p => p.setupType).filter(Boolean))
  ) as string[];

  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: null,
      setupTypes: [],
      rating: null,
      status: 'all',
    });
  };

  return (
    <div className="filter-widget">
      <Form layout="inline" style={{ width: '100%' }}>
        <Space wrap style={{ width: '100%' }}>
          <Form.Item label={t('filter.period')}>
            <RangePicker
              value={
                filters.dateRange
                  ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
                  : null
              }
              onChange={(dates) => {
                onFiltersChange({
                  ...filters,
                  dateRange: dates ? [dates[0]!.toDate(), dates[1]!.toDate()] : null,
                });
              }}
              style={{ width: 240 }}
            />
          </Form.Item>

          <Form.Item label={t('filter.status')}>
            <Radio.Group
              value={filters.status}
              onChange={(e) => {
                onFiltersChange({
                  ...filters,
                  status: e.target.value,
                });
              }}
            >
              <Radio.Button value="all">{t('filter.all')}</Radio.Button>
              <Radio.Button value="active">{t('filter.active')}</Radio.Button>
              <Radio.Button value="closed">{t('filter.closed')}</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label={t('filter.setupType')}>
            <Select
              mode="multiple"
              placeholder={t('filter.setupPlaceholder')}
              value={filters.setupTypes}
              onChange={(value) => {
                onFiltersChange({
                  ...filters,
                  setupTypes: value,
                });
              }}
              style={{ minWidth: 200 }}
              allowClear
            >
              {usedSetupTypes.map(setup => (
                <Select.Option key={setup} value={setup}>
                  {setup}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t('filter.rating')}>
            <Select
              placeholder={t('filter.ratingPlaceholder')}
              value={filters.rating}
              onChange={(value) => {
                onFiltersChange({
                  ...filters,
                  rating: value,
                });
              }}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value={1}>
                <Rate disabled defaultValue={1} count={5} style={{ fontSize: 14 }} />
              </Select.Option>
              <Select.Option value={2}>
                <Rate disabled defaultValue={2} count={5} style={{ fontSize: 14 }} />
              </Select.Option>
              <Select.Option value={3}>
                <Rate disabled defaultValue={3} count={5} style={{ fontSize: 14 }} />
              </Select.Option>
              <Select.Option value={4}>
                <Rate disabled defaultValue={4} count={5} style={{ fontSize: 14 }} />
              </Select.Option>
              <Select.Option value={5}>
                <Rate disabled defaultValue={5} count={5} style={{ fontSize: 14 }} />
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
            >
              {t('filter.clearFilters')}
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </div>
  );
};