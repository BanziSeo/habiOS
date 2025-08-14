import React from 'react';
import { Select, message, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useSettingsStore } from '../../../../stores/settingsStore';

interface TimeframeOption {
  value: string;
  label: string;
}

// 타임프레임 옵션을 동적으로 생성하는 함수
const getTimeframeOptions = (t: TFunction): TimeframeOption[] => [
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
const FIXED_KEYS = ['q', 'w', 'e', 'r'];

export const TimeframeShortcuts: React.FC = () => {
  const { t } = useTranslation('settings') as { t: TFunction };
  const { chartSettings, setTimeframeShortcut } = useSettingsStore();
  const { token } = theme.useToken();
  
  const shortcuts = chartSettings.timeframeShortcuts || [];
  
  // 각 고정 키에 대한 현재 설정값 가져오기
  const getShortcutValue = (key: string) => {
    const shortcut = shortcuts.find(s => s.key === key);
    return shortcut?.timeframe || '';
  };
  
  const handleTimeframeChange = (key: string, value: string) => {
    if (value === '') {
      // "설정 안 함" 선택 시 단축키 제거
      setTimeframeShortcut(key, null);
      message.info(`${key.toUpperCase()} 단축키 설정 해제`);
    } else {
      setTimeframeShortcut(key, value);
      const timeframeOptions = getTimeframeOptions(t);
      message.success(`${key.toUpperCase()} → ${timeframeOptions.find((opt: TimeframeOption) => opt.value === value)?.label}`);
    }
  };

  
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 8 }}>
          차트에서 키보드 단축키를 사용하여 빠르게 타임프레임을 전환할 수 있습니다.
        </p>
        <p style={{ marginBottom: 0, color: token.colorTextSecondary, fontSize: 12 }}>
          예: Q키를 누르면 설정된 타임프레임으로 즉시 전환됩니다.
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px',
        maxWidth: '600px'
      }}>
        {FIXED_KEYS.map(key => (
          <div key={key} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 12px',
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: '6px'
          }}>
            <div style={{ 
              width: '40px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: token.colorPrimaryBg,
              color: token.colorPrimaryText,
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {key.toUpperCase()}
            </div>
            <Select
              value={getShortcutValue(key)}
              onChange={(value) => handleTimeframeChange(key, value)}
              options={getTimeframeOptions(t)}
              style={{ flex: 1 }}
              placeholder={t('shortcuts.timeframe.selectTimeframe')}
              allowClear
              size="small"
            />
          </div>
        ))}
      </div>
    </div>
  );
};