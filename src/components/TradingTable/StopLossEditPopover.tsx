import React, { useState, useEffect, useRef } from 'react';
import { Popover, Space, Button, Typography, Tooltip, App } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Position } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useTradingStore } from '../../stores/tradingStore';
import { useMetricsStore } from '../../stores/metricsStore';
import { useStopLossManager } from '../../hooks/useStopLossManager';
import { StopLossForm } from '../StopLoss/StopLossForm';

const { Text } = Typography;

interface StopLossEditPopoverProps {
  position: Position;
  onSave?: (positionId: string, stopLossList: { price: number; percent: number }[]) => Promise<void>;
}

const StopLossEditPopoverComponent: React.FC<StopLossEditPopoverProps> = ({ position }) => {
  const { t } = useTranslation('widgets');
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { activeAccount, positions } = useTradingStore();
  const { calculateTotalRisk } = useMetricsStore();
  
  // store에서 최신 position 가져오기
  const currentPosition = positions.find(p => p.id === position.id) || position;
  
  // 커스텀 훅 사용
  const {
    stopLosses,
    loading,
    addStopLoss,
    removeStopLoss,
    updateStopLoss,
    saveStopLosses,
    validateStopLosses,
    setStopLosses,
    initializeFromPosition
  } = useStopLossManager({
    position: currentPosition,
    onSaveSuccess: () => {
      setOpen(false);
    },
    onSaveError: () => {
      // Error handling done in useStopLossManager hook
    }
  });
  
  useEffect(() => {
    if (open) {
      initializeFromPosition();
      
      // 팝오버가 열릴 때 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open, initializeFromPosition]);
  
  const handleSave = async () => {
    const validation = validateStopLosses();
    if (!validation.isValid) {
      // 팝오버에서는 간단한 검증만 진행
      return;
    }
    
    await saveStopLosses(false);
  };

  // 현재 스탑로스 설정을 Initial R로 설정
  const handleSetAsInitialR = async () => {
    const validation = validateStopLosses();
    if (!validation.isValid) {
      message.error(t('stopLoss.messages.noValidStopLoss'));
      return;
    }

    try {
      // 전체 스탑로스의 리스크 계산
      const validStopLosses = stopLosses.filter(sl => sl.price !== undefined && sl.price > 0 && sl.percentage > 0);
      const stopLossData = validStopLosses.map(sl => ({
        price: sl.price as number,
        quantity: sl.quantity
      }));
      
      const riskResult = calculateTotalRisk(currentPosition.avgBuyPrice, stopLossData);
      const totalRisk = riskResult.amount;
      
      
      // Initial R로 설정하면서 저장
      await saveStopLosses(true);
      
      message.success(t('stopLoss.messages.initialRSet', { amount: totalRisk.toFixed(2) }));
      
      // 팝오버를 닫지 않고 스탑로스 리스트를 업데이트
      const updatedPosition = await window.electronAPI.positions.getById(currentPosition.id);
      if (updatedPosition && updatedPosition.stopLosses) {
        const newStopLosses = updatedPosition.stopLosses.map((sl: { id: string; stop_price: string; stop_percentage: number; stop_quantity: number }) => ({
          id: sl.id,
          price: parseFloat(sl.stop_price) || 0,
          percentage: sl.stop_percentage || 0,
          quantity: sl.stop_quantity || 0
        }));
        setStopLosses(newStopLosses);
      }
    } catch (error) {
      message.error(t('stopLoss.messages.initialRSetFailed'));
    }
  };
  
  // 활성화된 스탑로스들
  const activeStopLosses = currentPosition.stopLosses?.filter(sl => sl.isActive) || [];
  
  // Closed 포지션이거나 totalShares가 0인 경우
  if (currentPosition.status === 'CLOSED' || currentPosition.totalShares === 0) {
    return <Text type="secondary">-</Text>;
  }
  
  // 100% 스탑로스인지 확인
  const totalStopQuantity = activeStopLosses.reduce((sum, sl) => sum + sl.stopQuantity, 0);
  const stopCoverage = (totalStopQuantity / currentPosition.totalShares) * 100;
  const isFullStopLoss = Math.abs(stopCoverage - 100) < 0.01;
  
  // 단일 스탑로스이고 100%인 경우 가격 표시
  const isSingleFullStopLoss = activeStopLosses.length === 1 && isFullStopLoss;
  
  let displayText;
  if (activeStopLosses.length === 0) {
    displayText = <Text type="warning">{t('stopLoss.noSL')}</Text>;
  } else if (!isFullStopLoss) {
    // 100%가 아닌 모든 경우 - 경고 표시
    displayText = (
      <Tooltip title={
        stopCoverage > 100 
          ? t('stopLoss.warning.overCoverage', { coverage: stopCoverage.toFixed(1) })
          : t('stopLoss.warning.underCoverage', { coverage: stopCoverage.toFixed(1) })
      }>
        <Text type="danger">
          ⚠️ {stopCoverage.toFixed(0)}%
        </Text>
      </Tooltip>
    );
  } else if (isSingleFullStopLoss) {
    displayText = formatCurrency(activeStopLosses[0].stopPrice, activeAccount?.currency);
  } else if (isFullStopLoss) {
    // 여러 개의 스탑로스이지만 합이 100%인 경우
    displayText = <Text type="secondary">{t('stopLoss.multiSL')}</Text>;
  }
  
  const content = (
    <div style={{ width: 300 }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
        {t('stopLoss.titleWithTicker', { ticker: position.ticker })}
      </div>
      
      <StopLossForm
        stopLosses={stopLosses}
        onAdd={addStopLoss}
        onRemove={removeStopLoss}
        onUpdate={updateStopLoss}
        onSave={handleSave}
        totalShares={position.totalShares}
        currency={activeAccount?.currency}
        firstInputRef={firstInputRef}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <Space>
          <Button
            size="small"
            onClick={() => setOpen(false)}
          >
            {t('stopLoss.actions.cancel')}
          </Button>
          <Tooltip title={t('stopLoss.actions.setAsInitialR')}>
            <Button
              type="text"
              size="small"
              onClick={handleSetAsInitialR}
              disabled={stopLosses.every(sl => !sl.price || sl.price <= 0) || loading}
              style={{ 
                color: stopLosses.some(sl => sl.price && sl.price > 0) ? '#1890ff' : 'rgba(255, 255, 255, 0.25)',
                fontSize: '12px',
                fontWeight: 'bold',
                marginRight: 8
              }}
            >
              R
            </Button>
          </Tooltip>
          <Button
            type="primary"
            size="small"
            onClick={handleSave}
            loading={loading}
          >
            {t('stopLoss.actions.save')}
          </Button>
        </Space>
      </div>
    </div>
  );
  
  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={(visible) => {
        // 사용자가 팝오버 바깥을 클릭하여 닫을 때만 처리
        if (!visible && !loading) {
          setOpen(false);
        }
      }}
      placement="left"
    >
      <Space>
        {displayText}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
      </Space>
    </Popover>
  );
};

// store에서 직접 position을 가져오므로 memo 불필요
export const StopLossEditPopover = StopLossEditPopoverComponent;