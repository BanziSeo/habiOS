import React from 'react';
import { Card, Switch, InputNumber, ColorPicker, Alert } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatColor } from '../../../../../utils/colorUtils';
import { DEFAULT_VALUES } from '../constants';
import type { ChartSettings } from '../../../../../stores/settings/types';

interface AxisAndGridSectionProps {
  chartSettings: ChartSettings;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

export const AxisAndGridSection: React.FC<AxisAndGridSectionProps> = ({
  chartSettings,
  updateChartSettings,
}) => {
  const { t } = useTranslation('settings');
  return (
    <div className="settings-group">
      <div className="group-header">
        <AppstoreOutlined className="group-icon" />
        <h2 className="group-title">{t('chart.axisAndGrid.title')}</h2>
      </div>
      
      <Card className="settings-card">
        
        <div className="form-row">
          <label className="form-label">{t('chart.axisAndGrid.axisTextColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.axisTextColor || DEFAULT_VALUES.axisTextColor}
              onChange={(color) => updateChartSettings({ axisTextColor: formatColor(color) })}
            />
            <span className="color-code">{chartSettings.axisTextColor || DEFAULT_VALUES.axisTextColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.axisAndGrid.axisLineColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.axisDividerColor || DEFAULT_VALUES.axisDividerColor}
              onChange={(color) => updateChartSettings({ axisDividerColor: formatColor(color) })}
            />
            <span className="color-code">{chartSettings.axisDividerColor || DEFAULT_VALUES.axisDividerColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.axisAndGrid.paneDividerColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.panelDivider?.color || DEFAULT_VALUES.panelDividerColor}
              onChange={(color) => updateChartSettings({ 
                panelDivider: { ...chartSettings.panelDivider, color: formatColor(color) }
              })}
            />
            <span className="color-code">{chartSettings.panelDivider?.color || DEFAULT_VALUES.panelDividerColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.axisAndGrid.paneDividerHoverColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.panelDivider?.hoverColor || DEFAULT_VALUES.panelDividerHoverColor}
              onChange={(color) => updateChartSettings({ 
                panelDivider: { ...chartSettings.panelDivider, hoverColor: formatColor(color) }
              })}
            />
            <span className="color-code">{chartSettings.panelDivider?.hoverColor || DEFAULT_VALUES.panelDividerHoverColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.axisAndGrid.paneDividerWidth')}</label>
          <InputNumber
            defaultValue={chartSettings.panelDivider?.thickness || DEFAULT_VALUES.panelDividerThickness}
            onBlur={(e) => {
              const value = Number(e.target.value);
              updateChartSettings({ 
                panelDivider: { ...chartSettings.panelDivider, thickness: value || DEFAULT_VALUES.panelDividerThickness }
              });
            }}
            min={1}
            max={20}
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.axisAndGrid.paneDividerDraggable')}</label>
          <Switch
            checked={chartSettings.panelDivider?.draggable !== false}
            onChange={(checked) => updateChartSettings({ 
              panelDivider: { ...chartSettings.panelDivider, draggable: checked }
            })}
          />
        </div>
        
        <Alert
          message={t('chart.axisAndGrid.refreshRequired')}
          type="warning"
          showIcon
          style={{ marginTop: '16px' }}
        />
      </Card>
    </div>
  );
};