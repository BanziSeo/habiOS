import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  InputNumber, 
  Select, 
  DatePicker, 
  Rate, 
  Alert, 
  Statistic, 
  Space,
  Typography,
  Radio,
  Tooltip,
  theme 
} from 'antd';
import { ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useMonteCarlo } from '../hooks/useMonteCarlo';
import { useTradingStore } from '../../../stores/tradingStore';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export const MonteCarloWidget: React.FC = () => {
  const { t } = useTranslation('analysis');
  const { token } = theme.useToken();
  const { positions } = useTradingStore();
  const {
    filters,
    setFilters,
    settings,
    setSettings,
    validTradesCount,
    runSimulation,
    summary,
    isRunning,
    canRun
  } = useMonteCarlo();

  const setupTypes = React.useMemo(() => {
    const types = new Set<string>();
    positions.forEach(p => {
      if (p.setupType) types.add(p.setupType);
    });
    return Array.from(types);
  }, [positions]);

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          start: dates[0]!.toDate(),
          end: dates[1]!.toDate()
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        dateRange: undefined
      }));
    }
  };

  const handleRunSimulation = async () => {
    try {
      await runSimulation();
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  return (
    <div className="monte-carlo-widget">
      <Card title={t('monteCarlo.filters')} className="filter-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
              placeholder={[
                t('monteCarlo.startDate'),
                t('monteCarlo.endDate')
              ]}
            />
          </Col>
          
          <Col xs={24} md={8}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder={t('monteCarlo.selectSetup')}
              onChange={(values: string[]) => {
                setFilters(prev => ({
                  ...prev,
                  setupTypes: values
                }));
              }}
              value={filters.setupTypes}
            >
              {setupTypes.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} md={8}>
            <div>
              <Text>{t('monteCarlo.minRating')}</Text>
              <Rate
                value={filters.minRating}
                onChange={(value) => {
                  setFilters(prev => ({
                    ...prev,
                    minRating: value
                  }));
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>
      
      <Alert
        message={t('monteCarlo.dataStatus')}
        description={
          canRun
            ? t('monteCarlo.ready', { count: validTradesCount })
            : t('monteCarlo.needMoreTrades', { 
                current: validTradesCount, 
                required: filters.minTrades || 30 
              })
        }
        type={canRun ? 'success' : 'warning'}
        showIcon
        style={{ marginTop: 16, marginBottom: 16 }}
      />
      
      <Card title={t('monteCarlo.settings')} className="settings-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>{t('monteCarlo.positionSizingMode')}</Text>
            <Tooltip title={t('monteCarlo.positionSizingModeTooltip')}>
              <InfoCircleOutlined style={{ marginLeft: 8, color: token.colorTextSecondary }} />
            </Tooltip>
            <Radio.Group
              value={settings.positionSizingMode}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  positionSizingMode: e.target.value
                }));
              }}
              style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <Radio value="historical">
                <Space>
                  <span>{t('monteCarlo.historicalMode')}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('monteCarlo.historicalModeDesc')}
                  </Text>
                </Space>
              </Radio>
              <Radio value="fixed">
                <Space>
                  <span>{t('monteCarlo.fixedMode')}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('monteCarlo.fixedModeDesc')}
                  </Text>
                </Space>
              </Radio>
            </Radio.Group>
          </div>
          
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Text>{t('monteCarlo.simulations')}</Text>
              <InputNumber
                min={1000}
                max={100000}
                value={settings.simulations}
                onChange={(value) => {
                  if (value) {
                    setSettings(prev => ({
                      ...prev,
                      simulations: value
                    }));
                  }
                }}
                step={1000}
                style={{ 
                  width: '100%', 
                  marginTop: 8,
                  backgroundColor: token.colorFillTertiary,
                  borderColor: token.colorBorder
                }}
              />
            </Col>
            
            <Col span={12}>
              <Text>
                {settings.positionSizingMode === 'fixed' 
                  ? t('monteCarlo.riskPerTrade')
                  : t('monteCarlo.initialCapital')
                }
              </Text>
              {settings.positionSizingMode === 'fixed' ? (
                <InputNumber
                  min={0.1}
                  max={10}
                  value={settings.riskPerTrade}
                  onChange={(value) => {
                    if (value) {
                      setSettings(prev => ({
                        ...prev,
                        riskPerTrade: value
                      }));
                    }
                  }}
                  step={0.1}
                  formatter={value => `${value}%`}
                  parser={value => Number(value?.replace('%', ''))}
                  style={{ 
                    width: '100%', 
                    marginTop: 8,
                    backgroundColor: token.colorFillTertiary,
                    borderColor: token.colorBorder
                  }}
                />
              ) : (
                <InputNumber
                  min={100}
                  max={1000000000}
                  value={settings.initialCapital}
                  onChange={(value) => {
                    if (value) {
                      setSettings(prev => ({
                        ...prev,
                        initialCapital: value
                      }));
                    }
                  }}
                  step={100}
                  style={{ 
                    width: '100%', 
                    marginTop: 8,
                    backgroundColor: token.colorFillTertiary,
                    borderColor: token.colorBorder
                  }}
                />
              )}
            </Col>
          </Row>
          
          <Button
            type="primary"
            size="large"
            onClick={handleRunSimulation}
            loading={isRunning}
            disabled={!canRun}
            icon={<ThunderboltOutlined />}
            style={{ marginTop: 16 }}
          >
            {t('monteCarlo.runSimulation')}
          </Button>
        </Space>
      </Card>
      
      {summary && (
        <Card title={t('monteCarlo.results')} className="results-card" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Statistic
                title={t('monteCarlo.bankruptcyRisk')}
                value={summary.bankruptcyProbability}
                suffix="%"
                precision={2}
                valueStyle={{
                  color: summary.bankruptcyProbability > 5 ? token.colorError : token.colorSuccess
                }}
              />
            </Col>
            
            <Col xs={24} md={6}>
              <Statistic
                title={t('monteCarlo.medianReturn')}
                value={summary.medianReturn}
                suffix="%"
                precision={2}
                valueStyle={{
                  color: summary.medianReturn > 0 ? token.colorSuccess : token.colorError
                }}
              />
            </Col>
            
            <Col xs={24} md={6}>
              <Statistic
                title={t('monteCarlo.maxDrawdown95')}
                value={summary.maxDrawdown.percentile95}
                suffix="%"
                precision={2}
                valueStyle={{ color: token.colorWarning }}
              />
            </Col>
            
            <Col xs={24} md={6}>
              <Statistic
                title={t('monteCarlo.worstDrawdown')}
                value={summary.maxDrawdown.worst}
                suffix="%"
                precision={2}
                valueStyle={{ color: token.colorError }}
              />
            </Col>
          </Row>
          
          <div className="confidence-interval" style={{ marginTop: 24, padding: 16, background: token.colorFillQuaternary, borderRadius: 8 }}>
            <Text strong>{t('monteCarlo.confidence95')}: </Text>
            <Text>
              {t('monteCarlo.returnRange', {
                min: summary.percentile5.toFixed(2),
                max: summary.percentile95.toFixed(2)
              })}
            </Text>
          </div>
          
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Card size="small" title={t('monteCarlo.consecutiveLosses')}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title={t('monteCarlo.median')}
                    value={summary.consecutiveLosses.median}
                    valueStyle={{ fontSize: 16 }}
                  />
                  <Statistic
                    title={t('monteCarlo.worst')}
                    value={summary.consecutiveLosses.worst}
                    valueStyle={{ fontSize: 16, color: token.colorError }}
                  />
                </Space>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title={t('monteCarlo.consecutiveWins')}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title={t('monteCarlo.median')}
                    value={summary.consecutiveWins.median}
                    valueStyle={{ fontSize: 16 }}
                  />
                  <Statistic
                    title={t('monteCarlo.best')}
                    value={summary.consecutiveWins.best}
                    valueStyle={{ fontSize: 16, color: token.colorSuccess }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};