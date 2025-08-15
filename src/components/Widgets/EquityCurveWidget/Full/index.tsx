import React, { useState } from 'react';
import { Card, Typography, Empty, Spin, Button, Modal } from 'antd';
import { FullscreenOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useTradingStore } from '../../../../stores/tradingStore';
import { 
  useEquityCurveData,
  useBenchmarkData,
  useChartData,
  useChartSettings
} from '../hooks';
import {
  ChartControls,
  EquityChart,
  ChartSettingsModal
} from '../components';
import { filterChartDataByDateRange } from '../utils';
import type { BenchmarkType } from '../types';

interface FullEquityCurveWidgetProps {
  onExpand?: () => void;
}

const FullEquityCurveWidget: React.FC<FullEquityCurveWidgetProps> = ({ onExpand }) => {
  const { t } = useTranslation('equityCurve');
  const { activeAccount } = useTradingStore();
  
  // States
  const [showPercentage, setShowPercentage] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<BenchmarkType[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);

  // Custom hooks
  const { data: equityCurveData, loading } = useEquityCurveData();
  const { benchmarkData, benchmarkLoading } = useBenchmarkData(equityCurveData, selectedBenchmarks);
  const { settings, updateSettings } = useChartSettings();
  
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

  const handleFullscreen = () => {
    if (onExpand) {
      onExpand();
    } else {
      setFullscreenModal(true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </Card>
    );
  }

  // No account selected
  if (!activeAccount) {
    return (
      <Card style={{ height: '100%' }}>
        <Empty description={t('selectAccount')} />
      </Card>
    );
  }

  const chartContent = (
    <>
      {/* Chart Controls */}
      <div style={{ marginBottom: 16 }}>
        <ChartControls
          showPercentage={showPercentage}
          onShowPercentageChange={setShowPercentage}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedBenchmarks={selectedBenchmarks}
          onBenchmarksChange={setSelectedBenchmarks}
          benchmarkLoading={benchmarkLoading}
        />
      </div>

      {/* Main Chart */}
      <EquityChart
        data={filteredChartData}
        settings={settings}
        showPercentage={showPercentage}
        selectedBenchmarks={selectedBenchmarks}
        activeAccount={activeAccount}
      />
    </>
  );

  return (
    <>
      <Card 
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text strong>{t('title')}</Typography.Text>
            <div>
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
                size="small"
              />
              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={handleFullscreen}
                size="small"
              />
            </div>
          </div>
        }
        styles={{ body: { flex: 1, overflow: 'auto' } }}
      >
        {chartContent}
      </Card>

      {/* Settings Modal */}
      <ChartSettingsModal
        visible={settingsVisible}
        settings={settings}
        onOk={handleSettingsOk}
        onCancel={() => setSettingsVisible(false)}
      />

      {/* Fullscreen Modal */}
      <Modal
        title={t('title')}
        open={fullscreenModal}
        onCancel={() => setFullscreenModal(false)}
        width="90%"
        style={{ top: 20 }}
        footer={null}
        styles={{ body: { height: 'calc(90vh - 100px)', padding: 24 } }}
      >
        {chartContent}
      </Modal>
    </>
  );
};

export default FullEquityCurveWidget;