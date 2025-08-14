import React from 'react';
import { Card, Select, ColorPicker, Button, Space, message, theme } from 'antd';
import { BgColorsOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatColor } from '../../../../../utils/colorUtils';
import { 
  getCHART_TYPE_OPTIONS, 
  getCURSOR_TYPE_OPTIONS
} from '../constants';
import { chartColorsByTheme } from '../../../../../stores/settings/defaults';
import type { ChartSettings } from '../../../../../stores/settings/types';

interface ChartTypeSectionProps {
  chartSettings: ChartSettings;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}

export const ChartTypeSection: React.FC<ChartTypeSectionProps> = ({
  chartSettings,
  updateChartSettings,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation('settings');
  
  // Get dynamic options that depend on i18n
  const chartTypeOptions = getCHART_TYPE_OPTIONS();
  const cursorTypeOptions = getCURSOR_TYPE_OPTIONS();
  
  // 현재 차트 테마 결정 (auto면 실제 테마를 가져와야 함)
  const handleResetToThemeDefaults = () => {
    const currentTheme = chartSettings.chartTheme === 'auto' 
      ? 'dark' // 여기서는 임시로 dark 사용, 실제로는 generalSettings.theme 참조 필요
      : chartSettings.chartTheme;
    
    const themeDefaults = currentTheme === 'dark' 
      ? chartColorsByTheme.dark 
      : chartColorsByTheme.light;
    
    // 테마별 기본값으로 업데이트
    updateChartSettings({
      upColor: themeDefaults.upColor,
      downColor: themeDefaults.downColor,
      volumeUpColor: themeDefaults.volumeUpColor,
      volumeDownColor: themeDefaults.volumeDownColor,
      chartBackgroundColor: themeDefaults.chartBackgroundColor,
      axisTextColor: themeDefaults.axisTextColor,
      axisDividerColor: themeDefaults.axisDividerColor,
    });
    
    message.success(t('chart.typeAndColors.resetSuccess'));
  };

  return (
    <div className="settings-group">
      <div className="group-header">
        <BgColorsOutlined 
          className="group-icon"
          style={{ color: token.colorPrimary }}
        />
        <h2 
          className="group-title"
          style={{ color: token.colorText }}
        >
          {t('chart.typeAndColors.title')}
        </h2>
      </div>
      
      <Card 
        className="settings-card"
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <div className="form-row">
          <label 
            className="form-label"
            style={{ color: token.colorTextSecondary }}
          >
            {t('chart.typeAndColors.chartTheme')}
          </label>
          <Space>
            <Select
              value={chartSettings.chartTheme || 'auto'}
              onChange={(value) => updateChartSettings({ chartTheme: value })}
              className="form-select"
              options={[
                { value: 'auto', label: t('chart.typeAndColors.themeAuto') },
                { value: 'light', label: t('chart.typeAndColors.themeLight') },
                { value: 'dark', label: t('chart.typeAndColors.themeDark') }
              ]}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetToThemeDefaults}
              size="small"
              type="text"
              title={t('chart.typeAndColors.resetToThemeDefault')}
            />
          </Space>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.chartType')}</label>
          <Select
            value={chartSettings.chartType}
            onChange={(value) => updateChartSettings({ chartType: value })}
            className="form-select"
            options={chartTypeOptions}
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.crosshair')}</label>
          <Select
            value={chartSettings.cursorType || 'crosshair'}
            onChange={(value) => updateChartSettings({ cursorType: value })}
            className="form-select"
            options={cursorTypeOptions}
          />
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.upCandleColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.upColor}
              onChange={(color) => updateChartSettings({ upColor: formatColor(color) })}
            />
            <span 
              className="color-code"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {chartSettings.upColor}
            </span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.downCandleColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.downColor}
              onChange={(color) => updateChartSettings({ downColor: formatColor(color) })}
            />
            <span className="color-code">{chartSettings.downColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.backgroundColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.chartBackgroundColor}
              onChange={(color) => updateChartSettings({ chartBackgroundColor: formatColor(color) })}
            />
            <span className="color-code">{chartSettings.chartBackgroundColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.volumeUpColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.volumeUpColor}
              onChange={(color) => updateChartSettings({ volumeUpColor: formatColor(color) })}
            />
            <span className="color-code">{chartSettings.volumeUpColor}</span>
          </div>
        </div>
        
        <div className="form-row">
          <label className="form-label">{t('chart.typeAndColors.volumeDownColor')}</label>
          <div className="form-control">
            <ColorPicker
              value={chartSettings.volumeDownColor}
              onChange={(color) => updateChartSettings({ volumeDownColor: formatColor(color) })}
            />
            <span className="color-code">{chartSettings.volumeDownColor}</span>
          </div>
        </div>
        
      </Card>
    </div>
  );
};