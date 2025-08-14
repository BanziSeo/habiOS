import React, { useState } from 'react';
import { Space, Input, Button, Popconfirm, theme } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Position } from '../../../../types';
import type { PositionMetrics } from '../../../../stores/metricsStore';
import type { Category } from '../types';
import { MetricItem } from './MetricItem';

interface CategorySectionProps {
  category: Category;
  position: Position;
  metrics: PositionMetrics;
  currency?: string;
  onEditCategory: (categoryId: string, newName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditItem?: (key: string) => void;
  styles: {
    tableSection: React.CSSProperties;
    rowValue: React.CSSProperties;
    valueNegative: React.CSSProperties;
    valuePositive: React.CSSProperties;
    tableRow: React.CSSProperties;
    dragHandle: React.CSSProperties;
    rowLabel: React.CSSProperties;
  };
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  position,
  metrics,
  currency,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  styles
}) => {
  const { token } = theme.useToken();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(category.name);

  const handleSaveName = () => {
    onEditCategory(category.id, editingName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditingName(category.name);
    setIsEditingName(false);
  };

  // 섹션 헤더 스타일 추가
  const sectionHeaderStyle = {
    padding: '12px 20px',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorFillQuaternary,
    fontWeight: 600,
    fontSize: 14,
    color: token.colorText,
  };

  return (
    <div style={styles.tableSection}>
      <div style={sectionHeaderStyle}>
        {isEditingName ? (
          <Space>
            <Input
              size="small"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onPressEnter={handleSaveName}
              style={{ width: 200 }}
            />
            <Button size="small" type="text" icon={<CheckOutlined />} onClick={handleSaveName} />
            <Button size="small" type="text" icon={<CloseOutlined />} onClick={handleCancelEdit} />
          </Space>
        ) : (
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <span>{category.name}</span>
            <Space>
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => setIsEditingName(true)}
              />
              <Popconfirm
                title="Delete this category?"
                onConfirm={() => onDeleteCategory(category.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Space>
          </Space>
        )}
      </div>
      <SortableContext
        items={category.items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {category.items.map((item) => (
          <MetricItem
            key={item.id}
            item={item}
            position={position}
            metrics={metrics}
            currency={currency}
            onEdit={onEditItem}
            styles={styles}
          />
        ))}
      </SortableContext>
    </div>
  );
};