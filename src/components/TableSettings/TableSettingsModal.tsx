import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, List, Button, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 컬럼 설정 타입
interface ColumnConfig {
  key: string;
  title: string;
  visible: boolean;
  order: number;
}

// 기본 컬럼 설정
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'ticker', title: 'Ticker', visible: true, order: 0 },
  { key: 'setup', title: 'Setup', visible: true, order: 1 },
  { key: 'rating', title: 'Rating', visible: true, order: 2 },
  { key: 'size', title: 'Size', visible: true, order: 3 },
  { key: 'maxSize', title: 'Max Size', visible: true, order: 4 },
  { key: 'avgPrice', title: 'Avg. Price', visible: true, order: 5 },
  { key: 'stopLoss', title: 'Stop Loss', visible: true, order: 6 },
  { key: 'realizedPnl', title: 'Realized P&L', visible: true, order: 7 },
  { key: 'aumPnl', title: 'AUM PnL%', visible: true, order: 8 },
  { key: 'initialR', title: 'Initial R', visible: true, order: 9 },
  { key: 'rMultiple', title: 'R-Multiple', visible: true, order: 10 },
  { key: 'pureRisk', title: 'Pure Risk %', visible: true, order: 11 },
  { key: 'totalRisk', title: 'Total Risk %', visible: true, order: 12 },
  { key: 'memo', title: 'Memo', visible: true, order: 13 },
];

// Sortable 아이템 컴포넌트
const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <List.Item
        style={{ cursor: 'move', padding: '8px 0' }}
        actions={[
          <MenuOutlined {...attributes} {...listeners} />
        ]}
      >
        {children}
      </List.Item>
    </div>
  );
};

interface TableSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TableSettingsModal: React.FC<TableSettingsModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation('common');
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // localStorage에서 컬럼 설정 불러오기
  useEffect(() => {
    const savedColumns = localStorage.getItem('tradingTableColumns');
    if (savedColumns) {
      try {
        setColumnConfigs(JSON.parse(savedColumns));
      } catch (e) {
        console.error('Failed to load column settings:', e);
      }
    }
  }, []);

  // 컬럼 설정 저장
  const saveColumnConfigs = (configs: ColumnConfig[]) => {
    setColumnConfigs(configs);
    localStorage.setItem('tradingTableColumns', JSON.stringify(configs));
    // TradingTable이 설정을 다시 로드하도록 이벤트 발생
    window.dispatchEvent(new Event('tradingTableSettingsChanged'));
  };

  // 컬럼 표시/숨김 토글
  const toggleColumnVisibility = (key: string) => {
    const newConfigs = columnConfigs.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    saveColumnConfigs(newConfigs);
  };

  // 컬럼 순서 변경
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnConfigs.findIndex(col => col.key === active.id);
      const newIndex = columnConfigs.findIndex(col => col.key === over.id);
      
      const newConfigs = arrayMove(columnConfigs, oldIndex, newIndex).map((col, index) => ({
        ...col,
        order: index
      }));
      
      saveColumnConfigs(newConfigs);
    }
  };

  const resetToDefault = () => {
    saveColumnConfigs(DEFAULT_COLUMNS);
  };

  return (
    <Modal
      title={t('tableSettings.title')}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="reset" onClick={resetToDefault}>
          {t('tableSettings.resetToDefault')}
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          {t('button.close')}
        </Button>
      ]}
      width={400}
    >
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">
          {t('tableSettings.helpText')}
        </Typography.Text>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnConfigs.map(col => col.key)}
          strategy={verticalListSortingStrategy}
        >
          <List
            dataSource={columnConfigs}
            renderItem={(item) => (
              <SortableItem key={item.key} id={item.key}>
                <Checkbox
                  checked={item.visible}
                  onChange={() => toggleColumnVisibility(item.key)}
                >
                  {item.title}
                </Checkbox>
              </SortableItem>
            )}
          />
        </SortableContext>
      </DndContext>
    </Modal>
  );
};

export default TableSettingsModal;