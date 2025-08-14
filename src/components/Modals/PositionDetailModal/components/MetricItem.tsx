import React from 'react';
import { DragOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import type { Position } from '../../../../types';
import type { PositionMetrics } from '../../../../stores/metricsStore';
import type { MetricItem as MetricItemType } from '../types';
import { formatters } from '../utils/metricFormatters';

interface MetricItemProps {
  item: MetricItemType;
  position: Position;
  metrics: PositionMetrics;
  currency?: string;
  onEdit?: (key: string) => void;
  styles: {
    rowValue: React.CSSProperties;
    valueNegative: React.CSSProperties;
    valuePositive: React.CSSProperties;
    tableRow: React.CSSProperties;
    dragHandle: React.CSSProperties;
    rowLabel: React.CSSProperties;
  };
}

export const MetricItem: React.FC<MetricItemProps> = ({
  item,
  position,
  metrics,
  currency,
  onEdit,
  styles
}) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const value = formatters[item.key]?.(null, position, metrics, currency) || 'N/A';
  
  // 값에 따른 스타일 결정
  const getValueStyle = () => {
    const baseStyle = { ...styles.rowValue };
    
    // 값에 따른 색상 적용
    if (item.key.includes('profit') || item.key.includes('win')) {
      if (metrics && value && value.toString().includes('-')) {
        return { ...baseStyle, ...styles.valueNegative };
      }
      return { ...baseStyle, ...styles.valuePositive };
    }
    
    if (item.key.includes('loss') || item.key.includes('risk')) {
      return { ...baseStyle, ...styles.valueNegative };
    }
    
    return baseStyle;
  };

  const rowStyle = {
    ...styles.tableRow,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const editButtonStyle = {
    marginLeft: 8,
    padding: '2px 6px',
    fontSize: 12,
    background: 'transparent',
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: 4,
    color: token.colorTextTertiary,
    cursor: 'pointer',
  };

  return (
    <div ref={setNodeRef} style={rowStyle}>
      <div style={styles.dragHandle} {...attributes} {...listeners}>
        <DragOutlined />
      </div>
      <span style={styles.rowLabel}>
        {item.labelKey ? t(item.labelKey.replace('widgets:', '')) : item.label}
        {item.editable && (
          <button style={editButtonStyle} onClick={() => onEdit?.(item.key)}>
            {t('common:button.edit')}
          </button>
        )}
      </span>
      <span style={getValueStyle()}>{value}</span>
    </div>
  );
};