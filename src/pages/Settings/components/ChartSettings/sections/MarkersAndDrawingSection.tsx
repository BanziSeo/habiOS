import React from 'react';
import { Card, Switch, Select, InputNumber, ColorPicker, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatColor } from '../../../../../utils/colorUtils';
import { 
  getMARKER_SHAPE_OPTIONS,
  getMARKER_POSITION_OPTIONS,
  FONT_FAMILY_OPTIONS,
  DEFAULT_VALUES
} from '../constants';
import type { ChartSettings } from '../../../../../stores/settings/types';

interface MarkersAndDrawingSectionProps {
  chartSettings: ChartSettings;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

export const MarkersAndDrawingSection: React.FC<MarkersAndDrawingSectionProps> = ({
  chartSettings,
  updateChartSettings,
}) => {
  const { t } = useTranslation('settings');
  
  // Get dynamic options that depend on i18n
  const markerShapeOptions = getMARKER_SHAPE_OPTIONS();
  const markerPositionOptions = getMARKER_POSITION_OPTIONS();
  return (
    <div className="settings-group">
      <div className="group-header">
        <EnvironmentOutlined className="group-icon" />
        <h2 className="group-title">{t('chart.markersAndDrawing.title')}</h2>
      </div>
      
      <Card className="settings-card">
        {/* 거래 마커 설정 */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>{t('chart.markersAndDrawing.tradeMarkers')}</h4>
          
          {/* 매수 마커 */}
          <Card size="small" title={t('chart.markersAndDrawing.buyMarkers')} style={{ marginBottom: 8 }}>
            <div className="form-row">
              <label className="form-label">{t('chart.markersAndDrawing.enabled')}</label>
              <Switch
                checked={chartSettings.tradeMarkers?.buy?.enabled ?? true}
                onChange={(checked) => updateChartSettings({
                  tradeMarkers: { 
                    ...chartSettings.tradeMarkers,
                    buy: { ...chartSettings.tradeMarkers?.buy, enabled: checked }
                  }
                })}
              />
            </div>
            
            {chartSettings.tradeMarkers?.buy?.enabled && (
              <>
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.color')}</label>
                  <div className="form-control">
                    <ColorPicker
                      value={chartSettings.tradeMarkers?.buy?.color || DEFAULT_VALUES.buyMarkerColor}
                      onChange={(color) => updateChartSettings({
                        tradeMarkers: { 
                          ...chartSettings.tradeMarkers,
                          buy: { ...chartSettings.tradeMarkers?.buy, color: formatColor(color) }
                        }
                      })}
                    />
                    <span className="color-code">{chartSettings.tradeMarkers?.buy?.color || DEFAULT_VALUES.buyMarkerColor}</span>
                  </div>
                </div>
                
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.shape')}</label>
                  <Select
                    value={chartSettings.tradeMarkers?.buy?.shape || 'arrowUp'}
                    onChange={(value) => updateChartSettings({
                      tradeMarkers: { 
                        ...chartSettings.tradeMarkers,
                        buy: { ...chartSettings.tradeMarkers?.buy, shape: value }
                      }
                    })}
                    className="form-select"
                    options={markerShapeOptions}
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.size')}</label>
                  <InputNumber
                    defaultValue={chartSettings.tradeMarkers?.buy?.size || DEFAULT_VALUES.markerSize}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || DEFAULT_VALUES.markerSize;
                      updateChartSettings({
                        tradeMarkers: { 
                          ...chartSettings.tradeMarkers,
                          buy: { ...chartSettings.tradeMarkers?.buy, size: value }
                        }
                      });
                    }}
                    min={6}
                    max={30}
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.position')}</label>
                  <Select
                    value={chartSettings.tradeMarkers?.buy?.position || 'belowBar'}
                    onChange={(value) => updateChartSettings({
                      tradeMarkers: { 
                        ...chartSettings.tradeMarkers,
                        buy: { ...chartSettings.tradeMarkers?.buy, position: value }
                      }
                    })}
                    className="form-select"
                    options={markerPositionOptions}
                  />
                </div>
              </>
            )}
          </Card>
          
          {/* 매도 마커 */}
          <Card size="small" title={t('chart.markersAndDrawing.sellMarkers')} style={{ marginBottom: 8 }}>
            <div className="form-row">
              <label className="form-label">{t('chart.markersAndDrawing.enabled')}</label>
              <Switch
                checked={chartSettings.tradeMarkers?.sell?.enabled ?? true}
                onChange={(checked) => updateChartSettings({
                  tradeMarkers: { 
                    ...chartSettings.tradeMarkers,
                    sell: { ...chartSettings.tradeMarkers?.sell, enabled: checked }
                  }
                })}
              />
            </div>
            
            {chartSettings.tradeMarkers?.sell?.enabled && (
              <>
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.color')}</label>
                  <div className="form-control">
                    <ColorPicker
                      value={chartSettings.tradeMarkers?.sell?.color || DEFAULT_VALUES.sellMarkerColor}
                      onChange={(color) => updateChartSettings({
                        tradeMarkers: { 
                          ...chartSettings.tradeMarkers,
                          sell: { ...chartSettings.tradeMarkers?.sell, color: formatColor(color) }
                        }
                      })}
                    />
                    <span className="color-code">{chartSettings.tradeMarkers?.sell?.color || DEFAULT_VALUES.sellMarkerColor}</span>
                  </div>
                </div>
                
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.shape')}</label>
                  <Select
                    value={chartSettings.tradeMarkers?.sell?.shape || 'arrowDown'}
                    onChange={(value) => updateChartSettings({
                      tradeMarkers: { 
                        ...chartSettings.tradeMarkers,
                        sell: { ...chartSettings.tradeMarkers?.sell, shape: value }
                      }
                    })}
                    className="form-select"
                    options={markerShapeOptions}
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.size')}</label>
                  <InputNumber
                    defaultValue={chartSettings.tradeMarkers?.sell?.size || DEFAULT_VALUES.markerSize}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || DEFAULT_VALUES.markerSize;
                      updateChartSettings({
                        tradeMarkers: { 
                          ...chartSettings.tradeMarkers,
                          sell: { ...chartSettings.tradeMarkers?.sell, size: value }
                        }
                      });
                    }}
                    min={6}
                    max={30}
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <label className="form-label">{t('chart.markersAndDrawing.position')}</label>
                  <Select
                    value={chartSettings.tradeMarkers?.sell?.position || 'aboveBar'}
                    onChange={(value) => updateChartSettings({
                      tradeMarkers: { 
                        ...chartSettings.tradeMarkers,
                        sell: { ...chartSettings.tradeMarkers?.sell, position: value }
                      }
                    })}
                    className="form-select"
                    options={markerPositionOptions}
                  />
                </div>
              </>
            )}
          </Card>
          
          {/* 텍스트 표시 */}
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.showText')}</label>
            <Switch
              checked={chartSettings.tradeMarkers?.showText ?? true}
              onChange={(checked) => updateChartSettings({
                tradeMarkers: { 
                  ...chartSettings.tradeMarkers,
                  showText: checked
                }
              })}
            />
          </div>
          
          {chartSettings.tradeMarkers?.showText && (
            <div className="form-row">
              <label className="form-label">{t('chart.markersAndDrawing.textSize')}</label>
              <InputNumber
                defaultValue={chartSettings.tradeMarkers?.textSize || DEFAULT_VALUES.markerTextSize}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || DEFAULT_VALUES.markerTextSize;
                  updateChartSettings({
                    tradeMarkers: { 
                      ...chartSettings.tradeMarkers,
                      textSize: value
                    }
                  });
                }}
                min={8}
                max={20}
                className="form-input"
              />
            </div>
          )}
        </div>
        
        {/* 수동 마커 설정 */}
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>{t('chart.markersAndDrawing.manualMarker')}</h4>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.color')}</label>
            <Space>
              <ColorPicker
                value={chartSettings.manualMarker?.color || '#FF6B6B'}
                onChange={(color) => updateChartSettings({
                  manualMarker: { 
                    color: formatColor(color),
                    shape: chartSettings.manualMarker?.shape || 'circle',
                    size: chartSettings.manualMarker?.size || 10
                  }
                })}
              />
              <span>{chartSettings.manualMarker?.color || '#FF6B6B'}</span>
            </Space>
          </div>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.shape')}</label>
            <Select
              value={chartSettings.manualMarker?.shape || 'circle'}
              onChange={(shape) => updateChartSettings({
                manualMarker: { 
                  color: chartSettings.manualMarker?.color || '#FF6B6B',
                  shape,
                  size: chartSettings.manualMarker?.size || 10
                }
              })}
              className="form-select"
              options={markerShapeOptions}
            />
          </div>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.size')}</label>
            <InputNumber
              defaultValue={chartSettings.manualMarker?.size || 10}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || 10;
                updateChartSettings({
                  manualMarker: { 
                    color: chartSettings.manualMarker?.color || '#FF6B6B',
                    shape: chartSettings.manualMarker?.shape || 'circle',
                    size: value
                  }
                });
              }}
              min={5}
              max={30}
              className="form-input"
            />
          </div>
        </div>
        
        {/* 그리기 도구 설정 */}
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>{t('chart.markersAndDrawing.drawingTools')}</h4>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.defaultColor')}</label>
            <div className="form-control">
              <ColorPicker
                value={chartSettings.drawingDefaults?.color || DEFAULT_VALUES.drawingDefaultColor}
                onChange={(color) => updateChartSettings({ 
                  drawingDefaults: { ...chartSettings.drawingDefaults, color: formatColor(color) }
                })}
              />
              <span className="color-code">{chartSettings.drawingDefaults?.color || DEFAULT_VALUES.drawingDefaultColor}</span>
            </div>
          </div>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.defaultLineWidth')}</label>
            <InputNumber
              defaultValue={chartSettings.drawingDefaults?.lineWidth || DEFAULT_VALUES.drawingDefaultLineWidth}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || DEFAULT_VALUES.drawingDefaultLineWidth;
                updateChartSettings({ 
                  drawingDefaults: { ...chartSettings.drawingDefaults, lineWidth: value }
                });
              }}
              min={1}
              max={10}
              className="form-input"
            />
          </div>
          
        </div>
        
        {/* 텍스트 도구 설정 */}
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>{t('chart.markersAndDrawing.textTool')}</h4>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.defaultFontSize')}</label>
            <InputNumber
              defaultValue={chartSettings.textDefaults?.fontSize || DEFAULT_VALUES.textDefaultFontSize}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || DEFAULT_VALUES.textDefaultFontSize;
                updateChartSettings({
                  textDefaults: { 
                    ...chartSettings.textDefaults,
                    fontSize: value
                  }
                });
              }}
              min={8}
              max={72}
              className="form-input"
            />
          </div>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.defaultFont')}</label>
            <Select
              value={chartSettings.textDefaults?.fontFamily || DEFAULT_VALUES.textDefaultFontFamily}
              onChange={(value) => updateChartSettings({
                textDefaults: { 
                  ...chartSettings.textDefaults,
                  fontFamily: value
                }
              })}
              className="form-select"
              options={FONT_FAMILY_OPTIONS}
            />
          </div>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.defaultTextColor')}</label>
            <div className="form-control">
              <ColorPicker
                value={chartSettings.textDefaults?.color || DEFAULT_VALUES.textDefaultColor}
                onChange={(color) => updateChartSettings({
                  textDefaults: { 
                    ...chartSettings.textDefaults,
                    color: formatColor(color)
                  }
                })}
              />
              <span className="color-code">{chartSettings.textDefaults?.color || DEFAULT_VALUES.textDefaultColor}</span>
            </div>
          </div>
          
          <div className="form-row">
            <label className="form-label">{t('chart.markersAndDrawing.textStyle')}</label>
            <Space>
              <Switch
                checked={chartSettings.textDefaults?.bold || false}
                onChange={(checked) => updateChartSettings({
                  textDefaults: { 
                    ...chartSettings.textDefaults,
                    bold: checked
                  }
                })}
              />
              <span>{t('chart.markersAndDrawing.bold')}</span>
              <Switch
                checked={chartSettings.textDefaults?.italic || false}
                onChange={(checked) => updateChartSettings({
                  textDefaults: { 
                    ...chartSettings.textDefaults,
                    italic: checked
                  }
                })}
              />
              <span>{t('chart.markersAndDrawing.italic')}</span>
              <Switch
                checked={chartSettings.textDefaults?.underline || false}
                onChange={(checked) => updateChartSettings({
                  textDefaults: { 
                    ...chartSettings.textDefaults,
                    underline: checked
                  }
                })}
              />
              <span>{t('chart.markersAndDrawing.underline')}</span>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};