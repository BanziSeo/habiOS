import React, { useMemo, useState, useEffect } from 'react';
import { Table, Typography, Button, Popover, theme } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs, { type Dayjs } from 'dayjs';
import { useTableCategories } from './hooks/useTableCategories';
import { getAvailableMetrics } from './constants';
import { MetricSelectModal } from './components/MetricSelectModal';
import { PeriodFilter } from './components/PeriodFilter';
import { SettingsPopover } from './components/SettingsPopover';
import { getTableColumns } from './utils/getTableColumns';
import type { MetricsTableWidgetProps, TableRow } from './types';
import './styles.css';

const { Text } = Typography;

export const MetricsTableWidget: React.FC<MetricsTableWidgetProps> = ({
  activeAccount,
  equityStats,
  portfolioMetrics,
  widgetId = 'metrics-table-1',
  onPeriodChange,
  currentPeriodFilter = 'all',
  currentDateRange = [null, null],
}) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [periodFilter, setPeriodFilter] = useState<'all' | '2weeks' | '1month' | 'custom'>(currentPeriodFilter);
  const [customDateRange, setCustomDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    currentDateRange[0] ? dayjs(currentDateRange[0]) : null,
    currentDateRange[1] ? dayjs(currentDateRange[1]) : null,
  ]);
  const [metricSelectModalVisible, setMetricSelectModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // 외부에서 전달받은 기간 필터가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setPeriodFilter(currentPeriodFilter);
  }, [currentPeriodFilter]);
  
  useEffect(() => {
    setCustomDateRange([
      currentDateRange[0] ? dayjs(currentDateRange[0]) : null,
      currentDateRange[1] ? dayjs(currentDateRange[1]) : null,
    ]);
  }, [currentDateRange]);
  
  // 카테고리 관리 hook
  const { 
    categories, 
    addCategory, 
    updateCategoryName, 
    deleteCategory,
    setCategoryMetrics,
    resetToDefault 
  } = useTableCategories(widgetId);

  // 사용 가능한 메트릭 가져오기
  const availableMetrics = useMemo(() => 
    getAvailableMetrics(portfolioMetrics, equityStats, activeAccount, token),
    [portfolioMetrics, equityStats, activeAccount, token]
  );

  // 카테고리별로 테이블 데이터 구성
  const tableData = useMemo(() => {
    const data: TableRow[] = [];
    
    categories.forEach((category) => {
      const categoryMetrics = category.metricIds
        .map(id => availableMetrics.find(m => m.id === id))
        .filter(Boolean);
      
      if (categoryMetrics.length > 0) {
        data.push({
          key: category.id,
          name: category.name,
          isCategory: true,
          children: categoryMetrics.map(metric => ({
            key: metric!.id,
            name: metric!.name,
            value: metric!.value.toString(),
            description: metric!.description,
            color: metric!.color,
          }))
        });
      }
    });

    // 모든 카테고리를 기본적으로 펼침
    setExpandedRowKeys(categories.map(c => c.id));
    
    return data;
  }, [categories, availableMetrics]);

  // 테이블 컬럼 정의
  const columns = useMemo(() => 
    getTableColumns({
      token,
      t,
    }),
    [token, t]
  );

  const handlePeriodChange = (filter: 'all' | '2weeks' | '1month' | 'custom', dateRange?: [Date | null, Date | null]) => {
    onPeriodChange?.(filter, dateRange);
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="metrics-table-widget-v2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {/* 기간 필터 */}
        <PeriodFilter
          periodFilter={periodFilter}
          customDateRange={customDateRange}
          onPeriodChange={handlePeriodChange}
          setPeriodFilter={setPeriodFilter}
          setCustomDateRange={setCustomDateRange}
        />

        {/* 설정 버튼 */}
        <Popover
          content={
            <SettingsPopover
              categories={categories}
              onAddCategory={addCategory}
              onUpdateCategoryName={updateCategoryName}
              onDeleteCategory={deleteCategory}
              onResetToDefault={resetToDefault}
              onSelectMetrics={(categoryId) => {
                setSelectedCategoryId(categoryId);
                setMetricSelectModalVisible(true);
                setSettingsOpen(false);
              }}
            />
          }
          trigger="click"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          placement="bottomLeft"
        >
          <Button 
            icon={<SettingOutlined />} 
            size="small"
            type="text"
          />
        </Popover>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        tableLayout="fixed"
        showHeader={true}
        scroll={{ 
          y: 400,  // 최대 높이 400px, 넘으면 스크롤
        }}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
          defaultExpandAllRows: true,
          expandRowByClick: true,
          showExpandColumn: false,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Text type="secondary">{t('metricsTable.emptyState.noMetrics')}</Text>
              <br />
              <Button 
                type="link" 
                size="small"
                onClick={() => setSettingsOpen(true)}
              >
                {t('metricsTable.emptyState.addCategoryPrompt')}
              </Button>
            </div>
          )
        }}
      />
      
      <MetricSelectModal
        visible={metricSelectModalVisible}
        category={selectedCategory}
        availableMetrics={availableMetrics}
        onOk={(categoryId, metricIds) => {
          setCategoryMetrics(categoryId, metricIds);
          setMetricSelectModalVisible(false);
        }}
        onCancel={() => setMetricSelectModalVisible(false)}
      />
    </div>
  );
};