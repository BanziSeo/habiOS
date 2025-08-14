import React from 'react';
import { Row, theme } from 'antd';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { 
  SettingSection, 
  CardSection,
  ColorField, 
  NumberField, 
  SelectField,
  SwitchField,
  SliderField,
  MARKER_SHAPE_OPTIONS,
  MARKER_POSITION_OPTIONS
} from '../Common';

export const MarkersAndDrawing: React.FC = () => {
  const { chartSettings, updateChartSettings } = useSettingsStore();
  const { token } = theme.useToken();


  return (
    <>
      {/* Trade Markers */}
      <SettingSection title="Trade Markers">
        {/* Buy Markers */}
        <CardSection title="Buy Markers">
          <SwitchField
            label="Enabled"
            checked={chartSettings.tradeMarkers?.buy?.enabled ?? true}
            onChange={(enabled) => updateChartSettings({
              tradeMarkers: { 
                ...chartSettings.tradeMarkers,
                buy: { ...chartSettings.tradeMarkers?.buy, enabled }
              }
            })}
          />
          
          <Row gutter={16}>
            <ColorField
              label="Color"
              value={chartSettings.tradeMarkers?.buy?.color || token.colorSuccess}
              onChange={(color) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  buy: { ...chartSettings.tradeMarkers?.buy, color }
                }
              })}
              span={6}
            />
            
            <SelectField
              label="Shape"
              value={chartSettings.tradeMarkers?.buy?.shape || 'arrowUp'}
              options={MARKER_SHAPE_OPTIONS}
              onChange={(shape) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  buy: { ...chartSettings.tradeMarkers?.buy, shape: shape as 'arrowUp' | 'arrowDown' | 'circle' | 'square' }
                }
              })}
              span={6}
            />
            
            <NumberField
              label="Size"
              value={chartSettings.tradeMarkers?.buy?.size || 12}
              min={6}
              max={30}
              onChange={(size) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  buy: { ...chartSettings.tradeMarkers?.buy, size }
                }
              })}
              span={6}
            />
            
            <SelectField
              label="Position"
              value={chartSettings.tradeMarkers?.buy?.position || 'belowBar'}
              options={MARKER_POSITION_OPTIONS}
              onChange={(position) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  buy: { ...chartSettings.tradeMarkers?.buy, position: position as 'aboveBar' | 'belowBar' | 'inBar' }
                }
              })}
              span={6}
            />
          </Row>
        </CardSection>

        {/* Sell Markers */}
        <CardSection title="Sell Markers">
          <SwitchField
            label="Enabled"
            checked={chartSettings.tradeMarkers?.sell?.enabled ?? true}
            onChange={(enabled) => updateChartSettings({
              tradeMarkers: { 
                ...chartSettings.tradeMarkers,
                sell: { ...chartSettings.tradeMarkers?.sell, enabled }
              }
            })}
          />
          
          <Row gutter={16}>
            <ColorField
              label="Color"
              value={chartSettings.tradeMarkers?.sell?.color || token.colorError}
              onChange={(color) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  sell: { ...chartSettings.tradeMarkers?.sell, color }
                }
              })}
              span={6}
            />
            
            <SelectField
              label="Shape"
              value={chartSettings.tradeMarkers?.sell?.shape || 'arrowDown'}
              options={MARKER_SHAPE_OPTIONS}
              onChange={(shape) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  sell: { ...chartSettings.tradeMarkers?.sell, shape: shape as 'arrowUp' | 'arrowDown' | 'circle' | 'square' }
                }
              })}
              span={6}
            />
            
            <NumberField
              label="Size"
              value={chartSettings.tradeMarkers?.sell?.size || 12}
              min={6}
              max={30}
              onChange={(size) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  sell: { ...chartSettings.tradeMarkers?.sell, size }
                }
              })}
              span={6}
            />
            
            <SelectField
              label="Position"
              value={chartSettings.tradeMarkers?.sell?.position || 'aboveBar'}
              options={MARKER_POSITION_OPTIONS}
              onChange={(position) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  sell: { ...chartSettings.tradeMarkers?.sell, position: position as 'aboveBar' | 'belowBar' | 'inBar' }
                }
              })}
              span={6}
            />
          </Row>
        </CardSection>

        {/* Text Settings */}
        <Row gutter={16}>
          <SwitchField
            label="Show Text"
            checked={chartSettings.tradeMarkers?.showText ?? true}
            onChange={(showText) => updateChartSettings({
              tradeMarkers: { 
                ...chartSettings.tradeMarkers,
                showText
              }
            })}
            span={12}
          />
          
          <NumberField
            label="Text Size"
            value={chartSettings.tradeMarkers?.textSize || 12}
            min={8}
            max={20}
            disabled={!chartSettings.tradeMarkers?.showText}
            onChange={(textSize) => updateChartSettings({
              tradeMarkers: { 
                ...chartSettings.tradeMarkers,
                textSize
              }
            })}
            span={12}
          />
        </Row>
      </SettingSection>

      {/* Drawing Tool Defaults */}
      <SettingSection title="Drawing Tool Defaults">
        <Row gutter={16}>
          <ColorField
            label="Default Color"
            value={chartSettings.drawingDefaults?.color || token.colorInfo}
            onChange={(color) => updateChartSettings({
              drawingDefaults: { 
                ...chartSettings.drawingDefaults,
                color
              }
            })}
          />
          
          <NumberField
            label="Default Line Width"
            value={chartSettings.drawingDefaults?.lineWidth || 2}
            min={1}
            max={10}
            onChange={(lineWidth) => updateChartSettings({
              drawingDefaults: { 
                ...chartSettings.drawingDefaults,
                lineWidth
              }
            })}
          />
          
          <SliderField
            label="Default Opacity"
            value={chartSettings.drawingDefaults?.opacity || 1}
            min={0.1}
            max={1}
            step={0.1}
            marks={{
              0.1: '10%',
              0.5: '50%',
              1: '100%',
            }}
            onChange={(opacity) => updateChartSettings({
              drawingDefaults: { 
                ...chartSettings.drawingDefaults,
                opacity
              }
            })}
          />
        </Row>
      </SettingSection>
    </>
  );
};