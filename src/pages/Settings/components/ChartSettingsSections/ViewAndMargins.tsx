import React from 'react';
import { Form, InputNumber, Typography } from 'antd';
import { useSettingsStore } from '../../../../stores/settingsStore';

const { Text } = Typography;

export const ViewAndMargins: React.FC = () => {
  const { chartSettings, updateChartSettings } = useSettingsStore();

  return (
    <>

      {/* Chart Margins */}
      <div>
        <h4 style={{ marginBottom: 16 }}>Chart Margins</h4>
        <Form layout="vertical">
          <Form.Item label="Top Margin (%)">
            <InputNumber
              value={(chartSettings.chartMargins?.top ?? 0.1) * 100}
              min={0}
              max={50}
              onChange={(value) => updateChartSettings({
                chartMargins: { 
                  ...(chartSettings.chartMargins || { top: 0.1, right: 0.05, bottom: 0.2 }), 
                  top: (value || 0) / 100 
                }
              })}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Space above the highest price
            </Text>
          </Form.Item>

          <Form.Item label="Right Margin (Candles)">
            <InputNumber
              value={chartSettings.chartMargins?.right ?? 5}
              min={0}
              max={50}
              onChange={(value) => updateChartSettings({
                chartMargins: { 
                  ...(chartSettings.chartMargins || { top: 0.1, right: 5, bottom: 0.1 }), 
                  right: value || 0
                }
              })}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Empty space after the latest candle
            </Text>
          </Form.Item>

          <Form.Item label="Bottom Margin (%)">
            <InputNumber
              value={(chartSettings.chartMargins?.bottom ?? 0.2) * 100}
              min={0}
              max={50}
              onChange={(value) => updateChartSettings({
                chartMargins: { 
                  ...(chartSettings.chartMargins || { top: 0.1, right: 0.05, bottom: 0.2 }), 
                  bottom: (value || 0) / 100 
                }
              })}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Space below the lowest price
            </Text>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};