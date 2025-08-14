import React from 'react';
import { Row, Card } from 'antd';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { 
  SettingSection, 
  SwitchField, 
  ColorField, 
  NumberField, 
  SelectField,
  LINE_STYLE_OPTIONS 
} from '../Common';

export const PriceAndStopLossLines: React.FC = () => {
  const { chartSettings, updateChartSettings } = useSettingsStore();

  return (
    <>
      {/* Average Price Line */}
      <SettingSection title="Average Price Line">
        <SwitchField
          label="Enabled"
          checked={chartSettings.averagePriceLine.enabled}
          onChange={(checked) => updateChartSettings({
            averagePriceLine: { ...chartSettings.averagePriceLine, enabled: checked }
          })}
        />
        
        <Row gutter={16}>
          <ColorField
            label="Color"
            value={chartSettings.averagePriceLine.color}
            onChange={(color) => updateChartSettings({
              averagePriceLine: { ...chartSettings.averagePriceLine, color }
            })}
          />
          
          <NumberField
            label="Line Width"
            value={chartSettings.averagePriceLine.lineWidth}
            min={1}
            max={5}
            onChange={(lineWidth) => updateChartSettings({
              averagePriceLine: { ...chartSettings.averagePriceLine, lineWidth }
            })}
          />
          
          <SelectField
            label="Line Style"
            value={chartSettings.averagePriceLine.lineStyle}
            options={LINE_STYLE_OPTIONS}
            onChange={(lineStyle) => updateChartSettings({
              averagePriceLine: { ...chartSettings.averagePriceLine, lineStyle: lineStyle as 'solid' | 'dashed' }
            })}
          />
        </Row>
      </SettingSection>

      {/* Stop Loss Lines */}
      <div>
        <h4 style={{ marginBottom: 16 }}>Stop Loss Lines (Max 5)</h4>
        {chartSettings.stopLossLines.map((line, index) => (
          <Card
            key={index}
            size="small"
            title={`Stop Loss ${index + 1}`}
            style={{ marginBottom: 8 }}
          >
            <Row gutter={16}>
              <ColorField
                label="Color"
                value={line.color}
                onChange={(color) => {
                  const newLines = [...chartSettings.stopLossLines];
                  newLines[index] = { ...line, color };
                  updateChartSettings({ stopLossLines: newLines });
                }}
              />
              
              <NumberField
                label="Line Width"
                value={line.lineWidth}
                min={1}
                max={5}
                onChange={(lineWidth) => {
                  const newLines = [...chartSettings.stopLossLines];
                  newLines[index] = { ...line, lineWidth };
                  updateChartSettings({ stopLossLines: newLines });
                }}
              />
              
              <SelectField
                label="Line Style"
                value={line.lineStyle}
                options={LINE_STYLE_OPTIONS}
                onChange={(lineStyle) => {
                  const newLines = [...chartSettings.stopLossLines];
                  newLines[index] = { ...line, lineStyle: lineStyle as 'solid' | 'dashed' };
                  updateChartSettings({ stopLossLines: newLines });
                }}
              />
            </Row>
          </Card>
        ))}
      </div>
    </>
  );
};