import React, { useState, useEffect, useRef } from 'react';
import { Space, InputNumber, Button } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Position } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useMetricsStore } from '../../stores/metricsStore';
import { useTradingStore } from '../../stores/tradingStore';

interface InitialREditCellProps {
  position: Position;
  onSave: (positionId: string, value: number) => Promise<void>;
}

const InitialREditCellComponent: React.FC<InitialREditCellProps> = ({ position, onSave }) => {
  const { t } = useTranslation('widgets');
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { activeAccount } = useTradingStore();
  const getPositionMetrics = useMetricsStore(state => state.getPositionMetrics);
  const metrics = getPositionMetrics(position.id) || {};
  const displayValue = position.maxRiskAmount || metrics.initialR;
  
  useEffect(() => {
    if (isEditing) {
      const currentValue = position.maxRiskAmount?.toNumber() || metrics.initialR?.toNumber();
      setValue(currentValue || undefined);
      // 포커스와 전체 선택
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isEditing, position.maxRiskAmount, metrics.initialR]);
  
  const handleSave = async () => {
    if (value === undefined || value === null) return;
    
    setLoading(true);
    try {
      await onSave(position.id, value);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save Initial R:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setValue(undefined);
  };
  
  if (isEditing) {
    return (
      <Space>
        <InputNumber
          ref={inputRef}
          value={value}
          onChange={(val) => setValue(val !== null ? val : undefined)}
          placeholder={activeAccount?.currency === 'KRW' ? "0" : "0.00"}
          prefix={activeAccount?.currency === 'KRW' ? "₩" : "$"}
          precision={activeAccount?.currency === 'KRW' ? 0 : 2}
          style={{ width: 90 }}
          min={0}
          onPressEnter={handleSave}
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={handleSave}
          loading={loading}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          disabled={loading}
        />
      </Space>
    );
  }
  
  return (
    <Space>
      {displayValue ? formatCurrency(displayValue, activeAccount?.currency) : (!displayValue && position.status === 'ACTIVE' ? <span style={{ color: '#faad14' }}>{t('positionTable.setSL')}</span> : '-')}
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      />
    </Space>
  );
};

export const InitialREditCell = React.memo(InitialREditCellComponent, (prevProps, nextProps) => {
  // Position ID와 maxRiskAmount가 같으면 리렌더링 스킵
  return prevProps.position.id === nextProps.position.id &&
         prevProps.position.maxRiskAmount?.toNumber() === nextProps.position.maxRiskAmount?.toNumber() &&
         prevProps.position.stopLosses?.length === nextProps.position.stopLosses?.length;
});