import React from 'react';
import { Button, Typography, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { ShortcutInput } from './ShortcutInput';

const { Text, Title } = Typography;

// 차트 단축키 설정을 반환하는 함수
const getChartShortcuts = (t: (key: string) => string) => ({
  drawing: [
    { key: 'trendLine', label: t('shortcuts.chart.trendLine'), defaultValue: 'Alt+T' },
    { key: 'horizontalLine', label: t('shortcuts.chart.horizontalLine'), defaultValue: 'Alt+H' },
    { key: 'marker', label: t('shortcuts.chart.marker'), defaultValue: 'Alt+M' },
    { key: 'circle', label: t('shortcuts.chart.circle'), defaultValue: 'Alt+C' },
    { key: 'rectangle', label: t('shortcuts.chart.rectangle'), defaultValue: 'Alt+R' },
    { key: 'text', label: t('shortcuts.chart.text'), defaultValue: 'Alt+X' },
  ],
  view: [
    { key: 'viewReset', label: t('shortcuts.chart.viewReset'), defaultValue: 'Alt+V' },
    { key: 'viewLock', label: t('shortcuts.chart.viewLock'), defaultValue: 'Ctrl+Shift+C' },
  ],
  general: [
    { key: 'undo', label: t('shortcuts.chart.undo'), defaultValue: 'Ctrl+Z' },
    { key: 'redo', label: t('shortcuts.chart.redo'), defaultValue: 'Ctrl+Y' },
    { key: 'delete', label: t('shortcuts.chart.delete'), defaultValue: 'Delete' },
    { key: 'capture', label: t('shortcuts.chart.capture'), defaultValue: '`' },
  ],
});

export const ChartShortcuts: React.FC = () => {
  const { t } = useTranslation('settings');
  const { 
    chartSettings, 
    updateChartSettings,
    setChartShortcut,
    resetAllChartShortcuts
  } = useSettingsStore();
  
  const CHART_SHORTCUTS = getChartShortcuts(t);

  const handleShortcutChange = (key: string, value: string) => {
    // 중복 체크
    if (value) {
      // 모든 단축키 수집
      const allShortcuts: { [k: string]: string } = {};
      
      // 차트 단축키
      Object.entries(chartSettings.chartShortcuts || {}).forEach(([k, v]) => {
        if (k !== key && v) {
          allShortcuts[k] = v;
        }
      });
      
      // 캡처 단축키
      if (key !== 'capture' && chartSettings.captureShortcut) {
        allShortcuts['capture'] = chartSettings.captureShortcut;
      }
      
      // 중복 확인
      const duplicateKey = Object.entries(allShortcuts).find(([, v]) => v === value);
      if (duplicateKey) {
        const duplicateLabel = CHART_SHORTCUTS.drawing.find(s => s.key === duplicateKey[0])?.label ||
                              CHART_SHORTCUTS.view.find(s => s.key === duplicateKey[0])?.label ||
                              CHART_SHORTCUTS.general.find(s => s.key === duplicateKey[0])?.label ||
                              duplicateKey[0];
        message.warning(t('shortcuts.chart.duplicateWarning', { key: value, action: duplicateLabel }));
        return;
      }
    }
    
    setChartShortcut(key, value);
  };

  const getShortcutValue = (key: string, defaultValue: string) => {
    if (key === 'capture') {
      return chartSettings.captureShortcut || defaultValue;
    }
    return chartSettings.chartShortcuts?.[key] || defaultValue;
  };

  const handleCaptureChange = (value: string) => {
    // 중복 체크
    if (value) {
      // 모든 차트 단축키 확인
      const duplicateKey = Object.entries(chartSettings.chartShortcuts || {}).find(([, v]) => v === value);
      if (duplicateKey) {
        const duplicateLabel = CHART_SHORTCUTS.drawing.find(s => s.key === duplicateKey[0])?.label ||
                              CHART_SHORTCUTS.view.find(s => s.key === duplicateKey[0])?.label ||
                              CHART_SHORTCUTS.general.find(s => s.key === duplicateKey[0])?.label ||
                              duplicateKey[0];
        message.warning(t('shortcuts.chart.duplicateWarning', { key: value, action: duplicateLabel }));
        return;
      }
    }
    
    updateChartSettings({ captureShortcut: value });
  };

  return (
    <div className="shortcut-section">
      <div className="shortcut-header">
        <Text type="secondary">
          {t('shortcuts.chart.description')}
        </Text>
        <Button 
          type="text"
          size="small" 
          icon={<ReloadOutlined />}
          onClick={resetAllChartShortcuts}
        />
      </div>

      <div className="shortcut-groups">
        <div className="shortcut-group">
          <Title level={5}>{t('chart.markersAndDrawing.drawingTools')}</Title>
          <div className="shortcut-list">
            {CHART_SHORTCUTS.drawing.map(({ key, label, defaultValue }) => (
              <ShortcutInput
                key={key}
                label={label}
                type="input"
                value={getShortcutValue(key, defaultValue)}
                onChange={(value) => handleShortcutChange(key, value)}
                placeholder={defaultValue}
              />
            ))}
          </div>
        </div>

        <div className="shortcut-group">
          <Title level={5}>{t('chart.viewAndMargin.title')}</Title>
          <div className="shortcut-list">
            {CHART_SHORTCUTS.view.map(({ key, label, defaultValue }) => (
              <ShortcutInput
                key={key}
                label={label}
                type="input"
                value={getShortcutValue(key, defaultValue)}
                onChange={(value) => handleShortcutChange(key, value)}
                placeholder={defaultValue}
              />
            ))}
          </div>
        </div>

        <div className="shortcut-group">
          <Title level={5}>{t('general.title')}</Title>
          <div className="shortcut-list">
            {CHART_SHORTCUTS.general.map(({ key, label, defaultValue }) => (
              <ShortcutInput
                key={key}
                label={label}
                type="input"
                value={getShortcutValue(key, defaultValue)}
                onChange={(value) => 
                  key === 'capture' 
                    ? handleCaptureChange(value)
                    : handleShortcutChange(key, value)
                }
                placeholder={defaultValue}
                singleKey={key === 'capture'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};