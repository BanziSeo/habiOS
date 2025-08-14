import React, { useState } from 'react';
import { Button, theme } from 'antd';
import { SettingOutlined, DragOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
import type { Modifier } from '@dnd-kit/core';
import { useMetricsStore } from '../../../stores/metricsStore';
import { useTradingStore } from '../../../stores/tradingStore';
import type { PositionDetailModalProps } from './types';
import { usePositionSync } from './hooks/usePositionSync';
import { useModalLayout } from './hooks/useModalLayout';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useInitialREdit } from './hooks/useInitialREdit';
import { QuickStats } from './components/QuickStats';
import { CategorySection } from './components/CategorySection';
import { SettingsModal } from './components/SettingsModal';
import { InitialREditModal } from './components/InitialREditModal';
import { AddCategoryButton } from './components/AddCategoryButton';
import { findDraggedItem } from './utils/layoutHelpers';

const PositionDetailModal: React.FC<PositionDetailModalProps> = ({ position }) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const { activeAccount } = useTradingStore();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // 스타일 정의 (Design Token 사용)
  const styles = {
    modalContent: {
      padding: 0,
    },
    dataTable: {
      width: '100%',
    },
    tableSection: {
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    tableRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      transition: 'background 0.15s ease',
      position: 'relative' as const,
    },
    tableRowHover: {
      background: token.colorFillQuaternary,
    },
    dragHandle: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'grab',
      color: token.colorTextQuaternary,
      transition: 'color 0.2s',
    },
    dragHandleHover: {
      color: token.colorTextTertiary,
    },
    rowLabel: {
      flex: 1,
      paddingLeft: 40,
      fontSize: 14,
      color: token.colorTextSecondary,
    },
    rowValue: {
      fontSize: 14,
      fontWeight: 500,
      color: token.colorText,
    },
    // 값에 따른 색상
    valuePositive: {
      color: token.colorSuccess,
    },
    valueNegative: {
      color: token.colorError,
    },
    valueWarning: {
      color: token.colorWarning,
    },
    addButton: {
      margin: '16px 20px',
      padding: '12px',
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: 6,
      color: token.colorTextTertiary,
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.2s',
      fontSize: 14,
    },
    addButtonHover: {
      borderColor: token.colorSuccess,
      color: token.colorSuccess,
      background: token.colorSuccessBg,
    },
  };
  
  // Custom hooks
  const localPosition = usePositionSync(position);
  const {
    layout,
    setLayout,
    editCategory,
    deleteCategory,
    addCategory,
    toggleMetric
  } = useModalLayout();
  
  const {
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd
  } = useDragAndDrop(layout, setLayout);
  
  const getPositionMetrics = useMetricsStore(state => state.getPositionMetrics);
  const calculateAndCachePositionMetrics = useMetricsStore(state => state.calculateAndCachePositionMetrics);
  // metricsLastUpdated를 구독하여 메트릭 변경 시 리렌더링
  const metricsLastUpdated = useMetricsStore(state => state.lastUpdated);
  
  // localPosition 변경 시 메트릭 재계산
  React.useEffect(() => {
    calculateAndCachePositionMetrics(localPosition);
  }, [localPosition, localPosition.maxRiskAmount, calculateAndCachePositionMetrics]);
  
  const metrics = React.useMemo(
    () => getPositionMetrics(localPosition.id) || {},
    // localPosition 자체를 dependency에 추가하여 포지션 변경 시 메트릭 재계산
    [getPositionMetrics, localPosition.id, metricsLastUpdated, localPosition.maxRiskAmount]
  );
  
  const {
    isEditingInitialR,
    editingInitialR,
    setEditingInitialR,
    loading,
    handleEditItem,
    handleSaveInitialR,
    handleCancelInitialR
  } = useInitialREdit(localPosition, metrics);

  const draggedItem = findDraggedItem(activeId, layout.categories);

  // DragOverlay modifier - 드래그 아이템을 마우스 커서 위치에 맞춤
  const adjustTranslate: Modifier = ({ transform }) => {
    return {
      ...transform,
      y: transform.y - 50, // 50px 위로 올려서 마우스 커서와 맞춤
      x: transform.x - 50, // 왼쪽으로 이동하여 중앙 정렬
    };
  };

  return (
    <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Settings Button */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => setSettingsModalVisible(true)}
        />
      </div>
      
      {/* Quick Stats Bar */}
      <QuickStats
        quickStats={layout.quickStats}
        position={localPosition}
        metrics={metrics}
        currency={activeAccount?.currency}
      />

      {/* Data Table with DnD */}
      <div style={styles.dataTable}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {layout.categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              position={localPosition}
              metrics={metrics}
              currency={activeAccount?.currency}
              onEditCategory={editCategory}
              onDeleteCategory={deleteCategory}
              onEditItem={handleEditItem}
              styles={styles}
            />
          ))}
          
          <DragOverlay
            dropAnimation={null}
            modifiers={[adjustTranslate]}
            style={{
              cursor: 'grabbing',
            }}
          >
            {draggedItem && (
              <div style={{ 
                ...styles.tableRow, 
                backgroundColor: token.colorBgContainer, 
                boxShadow: `0 4px 12px ${token.colorBgMask}`,
                opacity: 0.9
              }}>
                <div style={styles.dragHandle}>
                  <DragOutlined />
                </div>
                <span style={styles.rowLabel}>
                  {draggedItem.labelKey ? t(draggedItem.labelKey.replace('widgets:', '')) : draggedItem.label}
                </span>
                <span style={styles.rowValue}>...</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
        
        {/* Add Category Button */}
        <AddCategoryButton
          onAdd={addCategory}
          styles={styles}
        />
      </div>
      
      {/* Initial R Edit Modal */}
      <InitialREditModal
        visible={isEditingInitialR}
        value={editingInitialR}
        onChange={setEditingInitialR}
        onSave={handleSaveInitialR}
        onCancel={handleCancelInitialR}
        loading={loading}
        currency={activeAccount?.currency}
        styles={styles}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        layout={layout}
        onToggleMetric={toggleMetric}
      />
    </div>
  );
};

export default PositionDetailModal;