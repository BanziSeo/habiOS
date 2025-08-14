import React from 'react';
import { Row, theme } from 'antd';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { 
  SettingSection, 
  ColorField, 
  NumberField, 
  SwitchField 
} from '../Common';

export const ChartAxisAndDivider: React.FC = () => {
  const { chartSettings, updateChartSettings } = useSettingsStore();
  const { token } = theme.useToken();

  return (
    <>
      {/* Chart Axis Colors */}
      <SettingSection title="Chart Axis Colors">
        <Row gutter={16}>
          <ColorField
            label="Axis Text Color"
            value={chartSettings.axisTextColor || token.colorTextSecondary}
            onChange={(axisTextColor) => updateChartSettings({ axisTextColor })}
            span={12}
          />
          <ColorField
            label="Axis Divider Color"
            value={chartSettings.axisDividerColor || token.colorBorder}
            onChange={(axisDividerColor) => updateChartSettings({ axisDividerColor })}
            span={12}
          />
        </Row>
      </SettingSection>

      {/* Panel Divider Settings */}
      <SettingSection title="Panel Divider Settings">
        <Row gutter={16}>
          <ColorField
            label="Divider Color"
            value={chartSettings.panelDivider?.color || token.colorBorder}
            onChange={(color) => updateChartSettings({ 
              panelDivider: { ...chartSettings.panelDivider, color }
            })}
            span={12}
          />
          <ColorField
            label="Hover Color"
            value={chartSettings.panelDivider?.hoverColor || token.colorBorderSecondary}
            onChange={(hoverColor) => updateChartSettings({ 
              panelDivider: { ...chartSettings.panelDivider, hoverColor }
            })}
            span={12}
          />
        </Row>
        
        <Row gutter={16}>
          <NumberField
            label="Thickness (px)"
            value={chartSettings.panelDivider?.thickness || 4}
            min={1}
            max={20}
            onChange={(thickness) => updateChartSettings({ 
              panelDivider: { ...chartSettings.panelDivider, thickness }
            })}
            span={12}
          />
          <SwitchField
            label="Draggable"
            checked={chartSettings.panelDivider?.draggable !== false}
            onChange={(draggable) => updateChartSettings({ 
              panelDivider: { ...chartSettings.panelDivider, draggable }
            })}
            span={12}
          />
        </Row>
      </SettingSection>
    </>
  );
};