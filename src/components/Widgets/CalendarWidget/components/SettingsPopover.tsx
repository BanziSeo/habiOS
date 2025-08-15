import React from 'react';
import { Select, Switch, Space, Typography, theme } from 'antd';
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>{t('calendar.showTradeCount')}</Text>
            <Switch
              size="small"
              checked={settings.showTradeCount}
              onChange={(checked) => 
                onSettingsChange({ ...settings, showTradeCount: checked })
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
    </Space>
  );
};