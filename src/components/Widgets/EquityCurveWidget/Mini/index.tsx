import React, { useState, useMemo } from 'react';
import { Card, Select, Empty, Spin, Button, Modal, Popover, Switch, ColorPicker, theme, Space, Checkbox } from 'antd';
import { FullscreenOutlined, PercentageOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { useTradingStore } from '../../../../stores/tradingStore';
import { useEquityCurveData, useChartSettings } from '../hooks';
import { addMovingAveragesToChartData } from '../utils/chartDataTransform';
import type { EquityCurve } from '../../../../types';
import type { MovingAverage } from '../types';

const { Option } = Select;

interface MiniEquityCurveWidgetProps {
  onExpand?: () => void;
}

const MiniEquityCurveWidget: React.FC<MiniEquityCurveWidgetProps> = ({ onExpand }) => {
  const { t } = useTranslation('equityCurve');
  const { token } = theme.useToken();
  const { activeAccount } = useTradingStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showPercentage, setShowPercentage] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Mini 위젯 설정 상태
  const [settings, setSettings] = useState({
    showGrid: true,
    gridColor: token.colorBorder,
    backgroundColor: 'transparent',
    lineColor: '#1890ff',
    lineWidth: 2
  });
  
  // Get equity curve data and chart settings (for moving averages)
  const { data: equityCurveData, loading } = useEquityCurveData();
  const { settings: chartSettings } = useChartSettings();
  
  // Mini 위젯용 간단한 이동평균선 설정 (첫 3개만 사용)
  const [enabledMAs, setEnabledMAs] = useState<string[]>(['ma1', 'ma2']);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    if (!equityCurveData || equityCurveData.length === 0) return [];
    
    if (period === 'all') return equityCurveData;
    
    const now = dayjs();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = now.subtract(periodDays, 'day');
    
    return equityCurveData.filter((item: EquityCurve) => {
      const itemDate = dayjs(item.date);
      return itemDate.isAfter(startDate);
    });
  }, [equityCurveData, period]);

  // Transform data for chart with moving averages
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    const initialValue = parseFloat(filteredData[0].total_value);
    
    // Base chart data
    const baseData = filteredData.map((item: EquityCurve) => {
      const currentValue = parseFloat(item.total_value);
      const value = showPercentage 
        ? ((currentValue - initialValue) / initialValue) * 100
        : currentValue;
      
      return {
        date: item.date,
        displayDate: dayjs(item.date).format('MM/DD'),
        value,
        portfolio: value // alias for consistency with moving average calculation
      };
    });
    
    // Calculate moving averages for enabled MAs
    const activeMAs = chartSettings.movingAverages.filter(
      (ma: MovingAverage) => enabledMAs.includes(ma.id)
    );
    
    if (activeMAs.length > 0) {
      const dataWithMAs = addMovingAveragesToChartData(baseData, activeMAs);
      return dataWithMAs;
    }
    
    return baseData;
  }, [filteredData, showPercentage, chartSettings.movingAverages, enabledMAs]);

  // Calculate Y-axis domain with padding
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    
    const values = chartData.map(d => d.portfolio);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = (maxValue - minValue) * 0.1; // 10% padding
    
    return [
      Math.floor(minValue - padding),
      Math.ceil(maxValue + padding)
    ];
  }, [chartData]);

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
        <Spin />
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

  // No data
  if (chartData.length === 0) {
    return (
      <Card style={{ height: '100%' }}>
        <Empty description={t('noData')} />
      </Card>
    );
  }

  // Settings Popover content
  const settingsContent = (
    <Space direction="vertical" style={{ width: 250 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Show Grid</span>
        <Switch 
          checked={settings.showGrid}
          onChange={(checked) => setSettings(prev => ({ ...prev, showGrid: checked }))}
          size="small"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Grid Color</span>
        <ColorPicker 
          value={settings.gridColor}
          onChange={(_, hex) => setSettings(prev => ({ ...prev, gridColor: hex }))}
          size="small"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Background</span>
        <ColorPicker 
          value={settings.backgroundColor}
          onChange={(_, hex) => setSettings(prev => ({ ...prev, backgroundColor: hex }))}
          size="small"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Line Color</span>
        <ColorPicker 
          value={settings.lineColor}
          onChange={(_, hex) => setSettings(prev => ({ ...prev, lineColor: hex }))}
          size="small"
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Line Width</span>
        <Select 
          value={settings.lineWidth}
          onChange={(value) => setSettings(prev => ({ ...prev, lineWidth: value }))}
          size="small"
          style={{ width: 80 }}
        >
          <Option value={1}>1</Option>
          <Option value={2}>2</Option>
          <Option value={3}>3</Option>
        </Select>
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Moving Averages</div>
        {chartSettings.movingAverages.slice(0, 3).map((ma: MovingAverage) => (
          <div key={ma.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>
              {ma.type} {ma.period}
              <span style={{ 
                display: 'inline-block', 
                width: 12, 
                height: 2, 
                backgroundColor: ma.color, 
                marginLeft: 8,
                verticalAlign: 'middle'
              }} />
            </span>
            <Checkbox
              checked={enabledMAs.includes(ma.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setEnabledMAs([...enabledMAs, ma.id]);
                } else {
                  setEnabledMAs(enabledMAs.filter(id => id !== ma.id));
                }
              }}
            />
          </div>
        ))}
      </div>
    </Space>
  );

  const chartContent = (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: settings.backgroundColor,
      borderRadius: '8px',
      padding: '8px'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          {settings.showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={settings.gridColor} />
          )}
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={yDomain}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => showPercentage ? `${value.toFixed(2)}%` : `$${value.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              const formattedValue = showPercentage 
                ? `${value.toFixed(2)}%` 
                : `$${value.toLocaleString()}`;
              return [formattedValue, name];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="portfolio" 
            stroke={settings.lineColor} 
            strokeWidth={settings.lineWidth}
            dot={false}
            name="Portfolio"
          />
          {/* 이동평균선 렌더링 */}
          {chartSettings.movingAverages
            .filter((ma: MovingAverage) => enabledMAs.includes(ma.id))
            .map((ma: MovingAverage) => (
              <Line
                key={ma.id}
                type="monotone"
                dataKey={ma.id}
                stroke={ma.color}
                strokeWidth={ma.width}
                dot={false}
                name={`${ma.type} ${ma.period}`}
                strokeDasharray={ma.lineStyle === 'dashed' ? "5 3" : "0"}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <Card
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('title')}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Select
                value={period}
                onChange={setPeriod}
                size="small"
                style={{ width: 80 }}
              >
                <Option value="7d">7D</Option>
                <Option value="30d">30D</Option>
                <Option value="90d">90D</Option>
                <Option value="all">All</Option>
              </Select>
              <Button
                type={showPercentage ? 'primary' : 'text'}
                icon={<PercentageOutlined />}
                onClick={() => setShowPercentage(!showPercentage)}
                size="small"
                title={showPercentage ? 'Show Dollar Values' : 'Show Percentage'}
              />
              <Popover
                content={settingsContent}
                trigger="click"
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  size="small"
                />
              </Popover>
              <Button
                type="text"
                icon={<FullscreenOutlined />}
                onClick={handleFullscreen}
                size="small"
              />
            </div>
          </div>
        }
        styles={{ body: { flex: 1, padding: '12px' } }}
      >
        <div style={{ width: '100%', height: '100%', minHeight: 200 }}>
          {chartContent}
        </div>
      </Card>

      {/* Fullscreen Modal */}
      <Modal
        title={t('title')}
        open={fullscreenModal}
        onCancel={() => setFullscreenModal(false)}
        width="80%"
        style={{ top: 40 }}
        footer={null}
        styles={{ body: { height: '60vh', padding: 24 } }}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
          >
            <Option value="7d">7 Days</Option>
            <Option value="30d">30 Days</Option>
            <Option value="90d">90 Days</Option>
            <Option value="all">All Time</Option>
          </Select>
          <Button
            type={showPercentage ? 'primary' : 'default'}
            icon={<PercentageOutlined />}
            onClick={() => setShowPercentage(!showPercentage)}
          >
            {showPercentage ? 'Dollar View' : 'Percentage View'}
          </Button>
        </div>
        <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
          {chartContent}
        </div>
      </Modal>
    </>
  );
};

export default MiniEquityCurveWidget;