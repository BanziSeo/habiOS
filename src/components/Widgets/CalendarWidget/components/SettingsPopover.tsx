import React from 'react';
import { Select, Switch, Space, Typography, theme, ColorPicker, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import type { CalendarSettings, CalendarViewMode, CalendarPeriod } from '../types';

const { Text } = Typography;

interface SettingsPopoverProps {
  settings: CalendarSettings;
  onSettingsChange: (settings: CalendarSettings) => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  settings,
  onSettingsChange,
}) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" size="middle" style={{ width: 250 }}>
      <div>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {t('calendar.viewMode')}
        </Text>
        <Select
          value={settings.viewMode}
          onChange={(value: CalendarViewMode) => 
            onSettingsChange({ ...settings, viewMode: value })
          }
          style={{ width: '100%', marginTop: 4 }}
          options={[
            { label: t('calendar.week'), value: 'week' },
            { label: t('calendar.month'), value: 'month' },
            { label: t('calendar.heatmap'), value: 'heatmap' },
          ]}
        />
      </div>

      <div>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {t('calendar.period')}
        </Text>
        <Select
          value={settings.period}
          onChange={(value: CalendarPeriod) => 
            onSettingsChange({ ...settings, period: value })
          }
          style={{ width: '100%', marginTop: 4 }}
          options={[
            { label: t('calendar.1week'), value: '1week' },
            { label: t('calendar.2weeks'), value: '2weeks' },
            { label: t('calendar.4weeks'), value: '4weeks' },
            { label: t('calendar.monthPeriod'), value: 'month' },
          ]}
        />
      </div>

      <div>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {t('calendar.displayOptions')}
        </Text>
        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{t('calendar.showPnL')}</Text>
            <Switch
              size="small"
              checked={settings.showPnL}
              onChange={(checked) => 
                onSettingsChange({ ...settings, showPnL: checked })
              }
            />
          </div>
          {settings.showPnL && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16 }}>
              <Text style={{ fontSize: token.fontSizeSM }}>{t('calendar.pnlDisplay')}</Text>
              <Select
                size="small"
                value={settings.pnlDisplayMode || 'currency'}
                onChange={(value) => 
                  onSettingsChange({ ...settings, pnlDisplayMode: value })
                }
                style={{ width: 100 }}
                options={[
                  { label: t('calendar.currency'), value: 'currency' },
                  { label: t('calendar.percentage'), value: 'percentage' },
                ]}
              />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{t('calendar.showPositionStats')}</Text>
            <Switch
              size="small"
              checked={settings.showPositionStats ?? settings.showTradeCount}
              onChange={(checked) => 
                onSettingsChange({ ...settings, showPositionStats: checked, showTradeCount: checked })
              }
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{t('calendar.showWinRate')}</Text>
            <Switch
              size="small"
              checked={settings.showWinRate}
              onChange={(checked) => 
                onSettingsChange({ ...settings, showWinRate: checked })
              }
            />
          </div>
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {settings.viewMode === 'heatmap' && (
        <div>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            {t('calendar.heatmapDirection')}
          </Text>
          <Select
            value={settings.heatmapDirection || 'vertical'}
            onChange={(value: 'horizontal' | 'vertical') => 
              onSettingsChange({ ...settings, heatmapDirection: value })
            }
            style={{ width: '100%', marginTop: 4 }}
            options={[
              { label: t('calendar.horizontal'), value: 'horizontal' },
              { label: t('calendar.vertical'), value: 'vertical' },
            ]}
          />
        </div>
      )}

      <Divider style={{ margin: '12px 0' }} />

      <div>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {t('calendar.colorSettings')}
        </Text>
        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('calendar.profitColor')}</Text>
            <ColorPicker
              value={settings.profitColor || token.colorSuccess}
              onChange={(_, hex) => 
                onSettingsChange({ ...settings, profitColor: hex })
              }
              size="small"
              showText
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('calendar.lossColor')}</Text>
            <ColorPicker
              value={settings.lossColor || token.colorError}
              onChange={(_, hex) => 
                onSettingsChange({ ...settings, lossColor: hex })
              }
              size="small"
              showText
            />
          </div>
        </Space>
      </div>
    </Space>
  );
};