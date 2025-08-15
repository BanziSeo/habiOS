import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileTextOutlined,
  LineChartOutlined,
  BarChartOutlined,
  CameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useJournalNames } from '../../../hooks/useJournalNames';

interface NavigationMenuProps {
  collapsed: boolean;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ collapsed }) => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const location = useLocation();
  const { generalSettings } = useSettingsStore();
  const { journalNames } = useJournalNames();

  // 메뉴별 단축키 찾기
  const getShortcutForMenu = (menu: string) => {
    return generalSettings.menuShortcuts?.find(s => s.menu === menu)?.key || '';
  };

  const mainMenuItems = [
    {
      key: '/journal1',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{journalNames.journal1}</span>
          {!collapsed && getShortcutForMenu('/journal1') && (
            <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
              {getShortcutForMenu('/journal1')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: '/journal2',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{journalNames.journal2}</span>
          {!collapsed && getShortcutForMenu('/journal2') && (
            <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
              {getShortcutForMenu('/journal2')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: '/equity-curve',
      icon: <LineChartOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.equityCurve')}</span>
          {!collapsed && getShortcutForMenu('/equity-curve') && (
            <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
              {getShortcutForMenu('/equity-curve')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: '/analysis',
      icon: <BarChartOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.analysis')}</span>
          {!collapsed && getShortcutForMenu('/analysis') && (
            <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
              {getShortcutForMenu('/analysis')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: '/chartbook',
      icon: <CameraOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.chartBook')}</span>
          {!collapsed && getShortcutForMenu('/chartbook') && (
            <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
              {getShortcutForMenu('/chartbook')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: '/import',
      icon: <UploadOutlined style={{ fontSize: 18 }} />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.csvImport')}</span>
          {!collapsed && getShortcutForMenu('/import') && (
            <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
              {getShortcutForMenu('/import')}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={mainMenuItems}
      onClick={({ key }) => navigate(key)}
      style={{ 
        height: 'calc(100% - 64px)', 
        borderRight: 0,
        fontSize: 14
      }}
    />
  );
};