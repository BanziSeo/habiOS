import React from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { ShortcutInput } from './ShortcutInput';

const { Text } = Typography;

// 타임프레임 옵션을 반환하는 함수
const getTimeframeOptions = (t: (key: string) => string) => [
  { value: '', label: t('shortcuts.timeframe.notSet') },
  { value: '1m', label: t('shortcuts.timeframe.1m') },
  { value: '2m', label: t('shortcuts.timeframe.2m') },
  { value: '3m', label: t('shortcuts.timeframe.3m') },
  { value: '5m', label: t('shortcuts.timeframe.5m') },
  { value: '10m', label: t('shortcuts.timeframe.10m') },
  { value: '15m', label: t('shortcuts.timeframe.15m') },
  { value: '30m', label: t('shortcuts.timeframe.30m') },
  { value: '60m', label: t('shortcuts.timeframe.60m') },
  { value: '65m', label: t('shortcuts.timeframe.65m') },
  { value: '1d', label: t('shortcuts.timeframe.1d') },
  { value: '1wk', label: t('shortcuts.timeframe.1wk') },
];

// 고정된 단축키
const FIXED_KEYS = [
  { key: 'q', label: 'Q' },
  { key: 'w', label: 'W' },
  { key: 'e', label: 'E' },
  { key: 'r', label: 'R' },
];

export const TimeframeShortcuts: React.FC = () => {
  const { t } = useTranslation('settings');
  const { 
    chartSettings, 
    setTimeframeShortcut, 
    removeTimeframeShortcut 
  } = useSettingsStore();

  const handleChange = (key: string, value: string) => {
    if (value) {
      setTimeframeShortcut(key, value);
    } else {
      removeTimeframeShortcut(key);
    }
  };

  const getShortcutValue = (key: string) => {
    const shortcut = chartSettings.timeframeShortcuts?.find(s => s.key === key);
    return shortcut?.timeframe || '';
  };

  return (
    <div className="shortcut-section">
      <div className="shortcut-description">
        <Text type="secondary">
          {t('shortcuts.timeframe.description')}
        </Text>
      </div>
      
      <div className="shortcut-grid">
        {FIXED_KEYS.map(({ key, label }) => (
          <ShortcutInput
            key={key}
            label={label}
            type="select"
            value={getShortcutValue(key)}
            onChange={(value) => handleChange(key, value)}
            options={getTimeframeOptions(t)}
            placeholder={t('shortcuts.timeframe.selectTimeframe')}
          />
        ))}
      </div>
    </div>
  );
};