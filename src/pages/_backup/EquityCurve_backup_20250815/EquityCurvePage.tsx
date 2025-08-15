import React, { useState } from 'react';
import { Card, Typography, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useTradingStore } from '../../stores/tradingStore';
import type { BenchmarkType } from './types';
import { filterChartDataByDateRange } from './utils';
import {
  useEquityCurveData,
  useBenchmarkData,
  useChartData,
  useChartSettings
} from './hooks';
import {
  ChartControls,
  EquityChart,
  ChartSettingsModal
} from './components';

const { Title } = Typography;

const EquityCurvePage: React.FC = () => {
  const { t } = useTranslation('equityCurve');
  const { activeAccount } = useTradingStore();
  
  // States
  const [showPercentage, setShowPercentage] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<BenchmarkType[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Custom hooks
  const { data: equityCurveData, loading } = useEquityCurveData();
  const { benchmarkData, benchmarkLoading } = useBenchmarkData(equityCurveData, selectedBenchmarks);
  const { settings, updateSettings } = useChartSettings();
  // const statistics = useEquityStatistics(equityCurveData); // TODO: 통계 표시 UI 추가 시 사용
  
  // Chart data transformation
  const chartData = useChartData({
    equityCurveData,
    showPercentage,
    movingAverages: settings.movingAverages,
    benchmarkData,
    selectedBenchmarks
  });

  // Filter chart data by date range
  const filteredChartData = filterChartDataByDateRange(chartData, dateRange);

  // Handlers
  const handleSettingsOk = (newSettings: typeof settings) => {
    updateSettings(newSettings);
    setSettingsVisible(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // No account selected
  if (!activeAccount) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description={t('selectAccount')} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>{t('title')}</Title>
        <Typography.Text type="secondary">
          {equityCurveData.length > 0 && t('tradingDays', { count: equityCurveData.length })}
        </Typography.Text>
      </div>

      {/* Chart Controls */}
      <Card style={{ marginBottom: 24 }}>
        <ChartControls
          showPercentage={showPercentage}
          onShowPercentageChange={setShowPercentage}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedBenchmarks={selectedBenchmarks}
          onBenchmarksChange={setSelectedBenchmarks}
          benchmarkLoading={benchmarkLoading}
          onSettingsClick={() => setSettingsVisible(true)}
        />
      </Card>

      {/* Main Chart */}
      <Card>
        <EquityChart
          data={filteredChartData}
          settings={settings}
          showPercentage={showPercentage}
          selectedBenchmarks={selectedBenchmarks}
          activeAccount={activeAccount}
        />
      </Card>

      {/* Settings Modal */}
      <ChartSettingsModal
        visible={settingsVisible}
        settings={settings}
        onOk={handleSettingsOk}
        onCancel={() => setSettingsVisible(false)}
      />
    </div>
  );
};

export default EquityCurvePage;