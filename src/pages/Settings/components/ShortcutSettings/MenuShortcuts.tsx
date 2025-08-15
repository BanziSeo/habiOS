import React, { useMemo } from 'react';
import { Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { ShortcutInput } from './ShortcutInput';
import { useJournalNames } from '../../../../hooks/useJournalNames';
import type { MenuShortcut } from '../../../../stores/settings/types';

const { Text } = Typography;

export const MenuShortcuts: React.FC = () => {
  const { t } = useTranslation('settings');
  const { journalNames } = useJournalNames();
  
  // 메뉴 단축키 기본 설정 - i18n 적용
  const DEFAULT_MENU_SHORTCUTS: MenuShortcut[] = useMemo(() => [
    { menu: '/journal1', key: '1', label: journalNames.journal1 },
    { menu: '/journal2', key: '2', label: journalNames.journal2 },
    { menu: '/equity-curve', key: '3', label: t('shortcuts.menu.equityCurve') },
    { menu: '/analysis', key: '4', label: t('shortcuts.menu.analysis') },
    { menu: '/chart-book', key: '5', label: t('shortcuts.menu.chartBook') },
    { menu: '/import', key: '6', label: t('shortcuts.menu.import') },
    { menu: '/settings', key: '7', label: t('shortcuts.menu.settings') },
  ], [t, journalNames]);
  const { 
    generalSettings, 
    setMenuShortcut, 
    removeMenuShortcut,
    resetMenuShortcuts
  } = useSettingsStore();

  // 저장된 단축키가 있으면 해당 키 값을 사용하되, 라벨은 항상 번역된 값을 사용
  const menuShortcuts = DEFAULT_MENU_SHORTCUTS.map(defaultShortcut => {
    const savedShortcut = generalSettings.menuShortcuts?.find(s => s.menu === defaultShortcut.menu);
    return {
      ...defaultShortcut,
      key: savedShortcut?.key || defaultShortcut.key
    };
  });

  const handleShortcutChange = (menu: string, value: string) => {
    if (value) {
      // 다른 메뉴에서 이미 사용 중인 키인지 확인
      const isUsed = menuShortcuts.some(
        s => s.menu !== menu && s.key === value
      );
      if (isUsed) {
        // 중복 키 경고는 ShortcutInput에서 처리
        return;
      }
      setMenuShortcut(menu, value);
    } else {
      removeMenuShortcut(menu);
    }
  };

  const getShortcutValue = (menu: string) => {
    const shortcut = menuShortcuts.find(s => s.menu === menu);
    return shortcut?.key || '';
  };

  return (
    <div className="shortcut-section">
      <div className="shortcut-header">
        <Text type="secondary">
          {t('shortcuts.menu.numberPlaceholder')}{t('shortcuts.menu.description')}
        </Text>
        <Button 
          type="text"
          size="small" 
          icon={<ReloadOutlined />}
          onClick={resetMenuShortcuts}
        />
      </div>

      <div className="shortcut-list">
        {menuShortcuts.map((shortcut) => (
          <div key={shortcut.menu} className="shortcut-item-row">
            <Text className="shortcut-menu-label">
              {shortcut.label}
            </Text>
            <div className="shortcut-input-wrapper">
              <ShortcutInput
                label=""
                type="input"
                value={getShortcutValue(shortcut.menu)}
                onChange={(value) => handleShortcutChange(shortcut.menu, value)}
                placeholder={t('shortcuts.menu.numberPlaceholder')}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};