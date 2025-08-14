import React, { useState } from 'react';
import { Card, Select, Button, Switch, InputNumber, ColorPicker, Popconfirm } from 'antd';
import { LineChartOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatColor } from '../../../../../utils/colorUtils';
import { getTIMEFRAME_OPTIONS, DEFAULT_MA_CONFIG } from '../constants';
import type { ChartSettings, MovingAverage } from '../../../../../stores/settings/types';

interface MovingAverageSectionProps {
  chartSettings: ChartSettings;
  addPriceMA: (ma: Partial<MovingAverage>) => void;
  updatePriceMA: (id: string, ma: Partial<MovingAverage>) => void;
  removePriceMA: (id: string) => void;
  addVolumeMA: (ma: Partial<MovingAverage>) => void;
  updateVolumeMA: (id: string, ma: Partial<MovingAverage>) => void;
  removeVolumeMA: (id: string) => void;
  addTimeframePriceMA: (timeframe: string, ma: Partial<MovingAverage>) => void;
  updateTimeframePriceMA: (timeframe: string, id: string, ma: Partial<MovingAverage>) => void;
  removeTimeframePriceMA: (timeframe: string, id: string) => void;
  addTimeframeVolumeMA: (timeframe: string, ma: Partial<MovingAverage>) => void;
  updateTimeframeVolumeMA: (timeframe: string, id: string, ma: Partial<MovingAverage>) => void;
  removeTimeframeVolumeMA: (timeframe: string, id: string) => void;
}

export const MovingAverageSection: React.FC<MovingAverageSectionProps> = ({
  chartSettings,
  addPriceMA,
  updatePriceMA,
  removePriceMA,
  addVolumeMA,
  updateVolumeMA,
  removeVolumeMA,
  addTimeframePriceMA,
  updateTimeframePriceMA,
  removeTimeframePriceMA,
  addTimeframeVolumeMA,
  updateTimeframeVolumeMA,
  removeTimeframeVolumeMA,
}) => {
  const { t } = useTranslation('settings');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('global');
  
  // Get dynamic options that depend on i18n
  const timeframeOptions = getTIMEFRAME_OPTIONS();

  return (
    <div className="settings-group">
      <div className="group-header">
        <LineChartOutlined className="group-icon" />
        <h2 className="group-title">{t('chart.movingAverage.title')}</h2>
      </div>
      
      <Card className="settings-card">
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>{t('chart.movingAverage.selectTimeframe')}</label>
          <Select
            value={selectedTimeframe}
            onChange={setSelectedTimeframe}
            style={{ flex: 1, maxWidth: 300 }}
            options={timeframeOptions}
          />
        </div>
        
        {/* 가격 이동평균선 */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0 }}>{t('chart.movingAverage.priceMA')}</h4>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                if (selectedTimeframe === 'global') {
                  addPriceMA({
                    ...DEFAULT_MA_CONFIG,
                    id: Date.now().toString(),
                  });
                } else {
                  addTimeframePriceMA(selectedTimeframe, {
                    ...DEFAULT_MA_CONFIG,
                    id: Date.now().toString(),
                  });
                }
              }}
              title={t('actions.add')}
            />
          </div>
          
          {(() => {
            const maList = selectedTimeframe === 'global' 
              ? chartSettings.priceMovingAverages
              : chartSettings.timeframeMA?.[selectedTimeframe]?.priceMovingAverages || [];
              
            return maList.map((ma) => (
              <div key={ma.id} className="form-row" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <Switch
                    checked={ma.enabled}
                    onChange={(checked) => {
                      if (selectedTimeframe === 'global') {
                        updatePriceMA(ma.id, { enabled: checked });
                      } else {
                        updateTimeframePriceMA(selectedTimeframe, ma.id, { enabled: checked });
                      }
                    }}
                  />
                  <Select
                    value={ma.type}
                    onChange={(value) => {
                      if (selectedTimeframe === 'global') {
                        updatePriceMA(ma.id, { type: value });
                      } else {
                        updateTimeframePriceMA(selectedTimeframe, ma.id, { type: value });
                      }
                    }}
                    size="small"
                    style={{ width: 70 }}
                  >
                    <Select.Option value="SMA">SMA</Select.Option>
                    <Select.Option value="EMA">EMA</Select.Option>
                  </Select>
                  <InputNumber
                    defaultValue={ma.period}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (selectedTimeframe === 'global') {
                        updatePriceMA(ma.id, { period: value });
                      } else {
                        updateTimeframePriceMA(selectedTimeframe, ma.id, { period: value });
                      }
                    }}
                    min={1}
                    max={500}
                    size="small"
                    style={{ width: 60 }}
                  />
                  <ColorPicker
                    value={ma.color}
                    onChange={(color) => {
                      const hex = formatColor(color);
                      if (selectedTimeframe === 'global') {
                        updatePriceMA(ma.id, { color: hex });
                      } else {
                        updateTimeframePriceMA(selectedTimeframe, ma.id, { color: hex });
                      }
                    }}
                    size="small"
                  />
                  <InputNumber
                    defaultValue={ma.width || 1}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (selectedTimeframe === 'global') {
                        updatePriceMA(ma.id, { width: value });
                      } else {
                        updateTimeframePriceMA(selectedTimeframe, ma.id, { width: value });
                      }
                    }}
                    min={1}
                    max={5}
                    size="small"
                    style={{ width: 50 }}
                    placeholder={t('chart.movingAverage.thickness')}
                  />
                  <Popconfirm
                    title={t('messages.deleteConfirm')}
                    onConfirm={() => {
                      if (selectedTimeframe === 'global') {
                        removePriceMA(ma.id);
                      } else {
                        removeTimeframePriceMA(selectedTimeframe, ma.id);
                      }
                    }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </div>
              </div>
            ));
          })()}
        </div>
        
        {/* 볼륨 이동평균선 */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ margin: 0 }}>{t('chart.movingAverage.volumeMA')}</h4>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                if (selectedTimeframe === 'global') {
                  addVolumeMA({
                    ...DEFAULT_MA_CONFIG,
                    id: Date.now().toString(),
                    volumeMA: true,
                  });
                } else {
                  addTimeframeVolumeMA(selectedTimeframe, {
                    ...DEFAULT_MA_CONFIG,
                    id: Date.now().toString(),
                    volumeMA: true,
                  });
                }
              }}
              title={t('actions.add')}
            />
          </div>
          
          {(() => {
            const volumeMAList = selectedTimeframe === 'global' 
              ? chartSettings.volumeMovingAverages
              : chartSettings.timeframeMA?.[selectedTimeframe]?.volumeMovingAverages || [];
              
            return volumeMAList.map((ma) => (
              <div key={ma.id} className="form-row" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                  <Switch
                    checked={ma.enabled}
                    onChange={(checked) => {
                      if (selectedTimeframe === 'global') {
                        updateVolumeMA(ma.id, { enabled: checked });
                      } else {
                        updateTimeframeVolumeMA(selectedTimeframe, ma.id, { enabled: checked });
                      }
                    }}
                  />
                  <Select
                    value={ma.type}
                    onChange={(value) => {
                      if (selectedTimeframe === 'global') {
                        updateVolumeMA(ma.id, { type: value });
                      } else {
                        updateTimeframeVolumeMA(selectedTimeframe, ma.id, { type: value });
                      }
                    }}
                    size="small"
                    style={{ width: 70 }}
                  >
                    <Select.Option value="SMA">SMA</Select.Option>
                    <Select.Option value="EMA">EMA</Select.Option>
                  </Select>
                  <InputNumber
                    defaultValue={ma.period}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (selectedTimeframe === 'global') {
                        updateVolumeMA(ma.id, { period: value });
                      } else {
                        updateTimeframeVolumeMA(selectedTimeframe, ma.id, { period: value });
                      }
                    }}
                    min={1}
                    max={500}
                    size="small"
                    style={{ width: 60 }}
                  />
                  <ColorPicker
                    value={ma.color}
                    onChange={(color) => {
                      const hex = formatColor(color);
                      if (selectedTimeframe === 'global') {
                        updateVolumeMA(ma.id, { color: hex });
                      } else {
                        updateTimeframeVolumeMA(selectedTimeframe, ma.id, { color: hex });
                      }
                    }}
                    size="small"
                  />
                  <InputNumber
                    defaultValue={ma.width || 1}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (selectedTimeframe === 'global') {
                        updateVolumeMA(ma.id, { width: value });
                      } else {
                        updateTimeframeVolumeMA(selectedTimeframe, ma.id, { width: value });
                      }
                    }}
                    min={1}
                    max={5}
                    size="small"
                    style={{ width: 50 }}
                    placeholder={t('chart.movingAverage.thickness')}
                  />
                  <Popconfirm
                    title={t('messages.deleteConfirm')}
                    onConfirm={() => {
                      if (selectedTimeframe === 'global') {
                        removeVolumeMA(ma.id);
                      } else {
                        removeTimeframeVolumeMA(selectedTimeframe, ma.id);
                      }
                    }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </div>
              </div>
            ));
          })()}
        </div>
      </Card>
    </div>
  );
};