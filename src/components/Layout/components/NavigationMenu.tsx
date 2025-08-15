import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileTextOutlined,
  BarChartOutlined,
  CameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useJournalNames } from '../../../hooks/useJournalNames';

interface NavigationMenuProps {
  collapsed: boolean;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const location = useLocation();
  const { journalNames } = useJournalNames();

  const mainMenuItems = [
    {
      key: '/journal1',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>{journalNames.journal1}</span>,
    },
    {
      key: '/journal2',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>{journalNames.journal2}</span>,
    },
    // Equity Curve는 위젯으로 이동됨 - 백업용으로 주석 처리
    // {
    //   key: '/equity-curve',
    //   icon: <LineChartOutlined style={{ fontSize: 18 }} />,
    //   label: (
    //     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
    //       <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.equityCurve')}</span>
    //       {!collapsed && getShortcutForMenu('/equity-curve') && (
    //         <span style={{ fontSize: 12, marginLeft: 'auto', opacity: 0.45 }}>
    //           {getShortcutForMenu('/equity-curve')}
    //         </span>
    //       )}
    //     </div>
    //   ),
    // },
    {
      key: '/analysis',
      icon: <BarChartOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.analysis')}</span>,
    },
    {
      key: '/chartbook',
      icon: <CameraOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.chartBook')}</span>,
    },
    {
      key: '/import',
      icon: <UploadOutlined style={{ fontSize: 18 }} />,
      label: <span style={{ fontSize: 15, fontWeight: 500 }}>{t('navigation.csvImport')}</span>,
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