import React, { useState } from 'react';
import { Tabs, Empty, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import TradingTable from '../TradingTable';
import TableSettingsModal from '../TableSettings/TableSettingsModal';
import type { Position } from '../../types';

interface PositionTableWidgetProps {
  positions: Position[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const PositionTableWidget: React.FC<PositionTableWidgetProps> = ({
  positions,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation('widgets');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // Active와 Closed 포지션 분리
  const activePositions = positions.filter(p => p.status === 'ACTIVE');
  const closedPositions = positions.filter(p => p.status === 'CLOSED');

  const tabItems = [
    {
      key: 'active',
      label: t('positionTable.activePositionsTab', { count: activePositions.length }),
      children: activePositions.length > 0 ? (
        <TradingTable positions={activePositions} />
      ) : (
        <Empty description={t('positionTable.noActivePositions')} />
      ),
    },
    {
      key: 'closed',
      label: t('positionTable.closedPositionsTab', { count: closedPositions.length }),
      children: closedPositions.length > 0 ? (
        <TradingTable positions={closedPositions} />
      ) : (
        <Empty description={t('positionTable.noClosedPositions')} />
      ),
    },
  ];

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        style={{ height: '100%' }}
        tabBarExtraContent={
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSettingsModalVisible(true)}
            size="small"
            type="text"
          />
        }
      />
      <TableSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </>
  );
};