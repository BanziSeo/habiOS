import React from 'react';
import { Card, Switch, Select, InputNumber, ColorPicker } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatColor } from '../../../../../utils/colorUtils';
import { getLINE_STYLE_OPTIONS, DEFAULT_VALUES } from '../constants';
import type { ChartSettings } from '../../../../../stores/settings/types';

interface PriceAndStopLossSectionProps {
  chartSettings: ChartSettings;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

export const PriceAndStopLossSection: React.FC<PriceAndStopLossSectionProps> = ({
  chartSettings,
  updateChartSettings,
}) => {
  const { t } = useTranslation('settings');
  
  // Get dynamic options that depend on i18n
  const lineStyleOptions = getLINE_STYLE_OPTIONS();
  return (
    <div className="settings-group">
      <div className="group-header">
        <DollarOutlined className="group-icon" />
        <h2 className="group-title">{t('chart.priceAndStopLoss.title')}</h2>
      </div>
      
      <Card className="settings-card">
        <div className="form-row">
          <label className="form-label">{t('chart.priceAndStopLoss.avgPriceLine')}</label>
          <Switch
            checked={chartSettings.averagePriceLine?.enabled}
            onChange={(checked) => updateChartSettings({ 
              averagePriceLine: { ...chartSettings.averagePriceLine, enabled: checked }
            })}
          />
        </div>
        
        {chartSettings.averagePriceLine?.enabled && (
          <>
            <div className="form-row">
              <label className="form-label">{t('chart.priceAndStopLoss.lineStyle')}</label>
              <Select
                value={chartSettings.averagePriceLine?.lineStyle || 'solid'}
                onChange={(value) => updateChartSettings({ 
                  averagePriceLine: { ...chartSettings.averagePriceLine, lineStyle: value }
                })}
                className="form-select"
                options={lineStyleOptions}
              />
            </div>
            
            <div className="form-row">
              <label className="form-label">{t('chart.priceAndStopLoss.avgPriceLineColor')}</label>
              <div className="form-control">
                <ColorPicker
                  value={chartSettings.averagePriceLine?.color || DEFAULT_VALUES.averagePriceLineColor}
                  onChange={(color) => updateChartSettings({ 
                    averagePriceLine: { ...chartSettings.averagePriceLine, color: formatColor(color) }
                  })}
                />
                <span className="color-code">{chartSettings.averagePriceLine?.color || DEFAULT_VALUES.averagePriceLineColor}</span>
              </div>
            </div>
            
            <div className="form-row">
              <label className="form-label">{t('chart.priceAndStopLoss.avgPriceLineWidth')}</label>
              <InputNumber
                defaultValue={chartSettings.averagePriceLine?.lineWidth || DEFAULT_VALUES.averagePriceLineWidth}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || DEFAULT_VALUES.averagePriceLineWidth;
                  updateChartSettings({ 
                    averagePriceLine: { ...chartSettings.averagePriceLine, lineWidth: value }
                  });
                }}
                min={1}
                max={5}
                className="form-input"
              />
            </div>
          </>
        )}
        
        {/* 스탑로스 라인 설정 */}
        <div style={{ marginTop: 16 }}>
          <div className="form-row">
            <label className="form-label">{t('chart.priceAndStopLoss.stopLossLine')}</label>
            <Switch
              checked={chartSettings.stopLossLinesEnabled !== false}
              onChange={(checked) => updateChartSettings({ 
                stopLossLinesEnabled: checked
              })}
            />
          </div>
          
          {chartSettings.stopLossLinesEnabled !== false && (
            <>
              <h4 style={{ margin: '12px 0' }}>{t('chart.priceAndStopLoss.stopLossLinesMax')}</h4>
              {(chartSettings.stopLossLines || []).slice(0, 4).map((line, index) => (
                <Card
                  key={index}
                  size="small"
                  title={`${t('chart.priceAndStopLoss.stopLoss')} ${index + 1}`}
                  style={{ marginBottom: 8 }}
                >
                  <div className="form-row">
                    <label className="form-label">{t('chart.priceAndStopLoss.color')}</label>
                    <div className="form-control">
                      <ColorPicker
                        value={line.color}
                        onChange={(color) => {
                          const newLines = [...(chartSettings.stopLossLines || [])];
                          newLines[index] = { ...line, color: formatColor(color) };
                          updateChartSettings({ stopLossLines: newLines });
                        }}
                      />
                      <span className="color-code">{line.color}</span>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <label className="form-label">{t('chart.priceAndStopLoss.lineStyle')}</label>
                    <Select
                      value={line.lineStyle}
                      onChange={(value) => {
                        const newLines = [...(chartSettings.stopLossLines || [])];
                        newLines[index] = { ...line, lineStyle: value };
                        updateChartSettings({ stopLossLines: newLines });
                      }}
                      className="form-select"
                      options={lineStyleOptions}
                    />
                  </div>
                  
                  <div className="form-row">
                    <label className="form-label">{t('chart.priceAndStopLoss.lineWidth')}</label>
                    <InputNumber
                      defaultValue={line.lineWidth}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const newLines = [...(chartSettings.stopLossLines || [])];
                        newLines[index] = { ...line, lineWidth: value };
                        updateChartSettings({ stopLossLines: newLines });
                      }}
                      min={1}
                      max={5}
                      className="form-input"
                    />
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};