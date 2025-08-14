import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { TimeframeShortcuts } from './TimeframeShortcuts';
import { ChartShortcuts } from './ChartShortcuts';
import { MenuShortcuts } from './MenuShortcuts';
import './ShortcutSettings.css';

export const ShortcutSettings: React.FC = () => {
  const { t } = useTranslation('settings');
  const [activeKey, setActiveKey] = useState('timeframe');

  const items = [
    {
      key: 'timeframe',
      label: t('shortcuts.timeframe.title'),
      children: <TimeframeShortcuts />
    },
    {
      key: 'chart',
      label: t('shortcuts.chart.title'),
      children: <ChartShortcuts />
    },
    {
      key: 'menu',
      label: t('shortcuts.menu.title'),
      children: <MenuShortcuts />
    }
  ];

  return (
    <div className="shortcut-settings">
      <Tabs 
        activeKey={activeKey} 
        onChange={setActiveKey}
        size="small"
        className="shortcut-tabs"
        items={items}
      />
    </div>
  );
};