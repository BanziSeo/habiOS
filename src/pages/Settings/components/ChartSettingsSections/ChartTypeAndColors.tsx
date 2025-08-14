import React from 'react';
import { Form, Select, Row, Slider } from 'antd';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { SettingsFormItem } from '../../../../components/Settings/SettingsFormItem';
import { ColorPickerField } from '../../../../components/Settings/ColorPickerField';

export const ChartTypeAndColors: React.FC = () => {
  const { chartSettings, updateChartSettings } = useSettingsStore();

  return (
    <Form layout="vertical">
      <SettingsFormItem label="차트 타입">
        <Select
          value={chartSettings.chartType}
          onChange={(value) => updateChartSettings({ chartType: value })}
        >
          <Select.Option value="candle">캔들스틱</Select.Option>
          <Select.Option value="hollow">속빈 캔들</Select.Option>
          <Select.Option value="bar">바 차트</Select.Option>
        </Select>
      </SettingsFormItem>

      <Row gutter={16}>
        <ColorPickerField
          label="상승 색상"
          value={chartSettings.upColor}
          onChange={(value) => updateChartSettings({ upColor: value })}
          colSpan={12}
        />
        <ColorPickerField
          label="하락 색상"
          value={chartSettings.downColor}
          onChange={(value) => updateChartSettings({ downColor: value })}
          colSpan={12}
        />
      </Row>

      <Row gutter={16}>
        <ColorPickerField
          label="볼륨 상승 색상"
          value={chartSettings.volumeUpColor}
          onChange={(value) => updateChartSettings({ volumeUpColor: value })}
          colSpan={12}
        />
        <ColorPickerField
          label="볼륨 하락 색상"
          value={chartSettings.volumeDownColor}
          onChange={(value) => updateChartSettings({ volumeDownColor: value })}
          colSpan={12}
        />
      </Row>

      <SettingsFormItem label="볼륨 투명도">
        <Slider
          min={0.1}
          max={1}
          step={0.1}
          value={chartSettings.volumeOpacity}
          onChange={(value) => updateChartSettings({ volumeOpacity: value })}
          marks={{
            0.1: '10%',
            0.5: '50%',
            1: '100%'
          }}
        />
      </SettingsFormItem>
    </Form>
  );
};