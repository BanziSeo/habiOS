import React from 'react';
import { Button, theme } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SortableMetricItemProps } from '../types';

export const SortableMetricItem: React.FC<SortableMetricItemProps> = ({ 
  card, 
  children, 
  onRemove 
}) => {
  const { token } = theme.useToken();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="metric-item-wrapper"
    >
      <div 
        className="metric-item"
        style={{
          background: token.colorFillQuaternary,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        {...attributes} 
        {...listeners}
      >
        {children}
        <Button
          icon={<CloseOutlined />}
          size="small"
          type="text"
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(card.id);
          }}
        />
      </div>
    </div>
  );
};