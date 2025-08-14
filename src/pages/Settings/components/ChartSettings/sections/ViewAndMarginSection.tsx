import React from 'react';
import { Card, Switch, InputNumber } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DEFAULT_VALUES } from '../constants';
import type { ChartSettings } from '../../../../../stores/settings/types';

interface ViewAndMarginSectionProps {
  chartSettings: ChartSettings;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

export const ViewAndMarginSection: React.FC<ViewAndMarginSectionProps> = ({
  chartSettings,
  updateChartSettings,
}) => {
  const { t } = useTranslation('settings');
  return (
    <div className="settings-group">
      <div className="group-header">
        <ExpandOutlined className="group-icon" />
        <h2 className="group-title">{t('chart.viewAndMargin.title')}</h2>
      </div>
      
      <Card className="settings-card">
        <div className="form-row">
          <label className="form-label">{t('chart.viewAndMargin.rightMargin')}</label>
          <InputNumber
            defaultValue={chartSettings.chartMargins?.right || DEFAULT_VALUES.chartMarginsRight}
            onBlur={(e) => {
              const value = Number(e.target.value);
              updateChartSettings({ 
                chartMargins: { ...chartSettings.chartMargins, right: value || DEFAULT_VALUES.chartMarginsRight }
              });
            }}
            min={0}
            max={50}
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.viewAndMargin.topMargin')}</label>
          <InputNumber
            defaultValue={(chartSettings.chartMargins?.top ?? DEFAULT_VALUES.chartMarginsTop) * 100}
            onBlur={(e) => {
              const value = Number(e.target.value);
              updateChartSettings({
                chartMargins: { 
                  ...(chartSettings.chartMargins || { top: DEFAULT_VALUES.chartMarginsTop, right: DEFAULT_VALUES.chartMarginsRight, bottom: DEFAULT_VALUES.chartMarginsBottom }), 
                  top: (value || 0) / 100 
                }
              });
            }}
            min={0}
            max={50}
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.viewAndMargin.bottomMargin')}</label>
          <InputNumber
            defaultValue={(chartSettings.chartMargins?.bottom ?? DEFAULT_VALUES.chartMarginsBottom) * 100}
            onBlur={(e) => {
              const value = Number(e.target.value);
              updateChartSettings({
                chartMargins: { 
                  ...(chartSettings.chartMargins || { top: DEFAULT_VALUES.chartMarginsTop, right: DEFAULT_VALUES.chartMarginsRight, bottom: DEFAULT_VALUES.chartMarginsBottom }), 
                  bottom: (value || 0) / 100 
                }
              });
            }}
            min={0}
            max={50}
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.viewAndMargin.autoScale')}</label>
          <Switch
            checked={chartSettings.autoScale}
            onChange={(checked) => updateChartSettings({ autoScale: checked })}
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.viewAndMargin.logScale')}</label>
          <Switch
            checked={chartSettings.logScale}
            onChange={(checked) => updateChartSettings({ logScale: checked })}
          />
        </div>
        
      </Card>
    </div>
  );
};