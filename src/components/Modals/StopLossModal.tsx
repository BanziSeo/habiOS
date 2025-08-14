import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, App, Typography, Checkbox, Tooltip, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Position } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useTradingStore } from '../../stores/tradingStore';
import { useMetricsStore } from '../../stores/metricsStore';
import { useStopLossManager } from '../../hooks/useStopLossManager';
import { StopLossForm } from '../StopLoss/StopLossForm';

const { Text } = Typography;

interface StopLossModalProps {
  position: Position;
}

const StopLossModal: React.FC<StopLossModalProps> = ({ position }) => {
  const { t } = useTranslation('widgets');
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { activeAccount } = useTradingStore();
  const { getPositionMetrics, calculateStopLossRisk, updateTotalAssets } = useMetricsStore();
  const [localPosition, setLocalPosition] = useState<Position>(position);
  const [inputMode, setInputMode] = useState<'percentage' | 'quantity'>('percentage');
  const [setAsInitialR, setSetAsInitialR] = useState<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // 커스텀 훅 사용
  const {
    stopLosses,
    loading,
    addStopLoss,
    removeStopLoss,
    updateStopLoss,
    saveStopLosses,
    previewRisk,
    validateStopLosses,
    initializeFromPosition
  } = useStopLossManager({
    position: localPosition,
    onSaveSuccess: () => {
      if (setAsInitialR) {
        message.success(t('stopLoss.messages.saveSuccess'));
      } else {
        message.success(t('stopLoss.messages.saveSuccessSimple'));
      }
    },
    onSaveError: (error) => {
      message.error(error.message || t('stopLoss.messages.saveError'));
    }
  });

  // Zustand store 구독으로 포지션 변경 감지
  useEffect(() => {
    const unsubscribe = useTradingStore.subscribe((state) => {
      const updatedPosition = state.positions.find(p => p.id === position.id);
      if (updatedPosition) {
        setLocalPosition(updatedPosition);
      }
    });
    
    // 메트릭 스토어도 구독
    const unsubscribeMetrics = useMetricsStore.subscribe(() => {
      // 메트릭이 업데이트되면 컴포넌트가 리렌더됨
    });

    return () => {
      unsubscribe();
      unsubscribeMetrics();
    };
  }, [position.id]);

  // props의 position이 변경되면 localPosition도 업데이트
  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  // 초기 스탑로스 불러오기
  useEffect(() => {
    initializeFromPosition();
  }, [initializeFromPosition]);
  

  // 총자산 가져오기
  useEffect(() => {
    const fetchTotalAssets = async () => {
      if (activeAccount) {
        try {
          const equityCurve = await window.electronAPI.database.query(
            'SELECT total_value FROM equity_curve WHERE account_id = ? ORDER BY date DESC LIMIT 1',
            [activeAccount.id]
          );
          if (equityCurve && equityCurve.rows && equityCurve.rows.length > 0) {
            const firstRow = equityCurve.rows[0] as { total_value: string };
            const assets = firstRow.total_value;
            updateTotalAssets(parseFloat(assets));
          }
        } catch (error) {
          console.error('Failed to fetch total assets:', error);
        }
      }
    };
    fetchTotalAssets();
  }, [activeAccount, updateTotalAssets]);

  // 메트릭 가져오기
  const metrics = getPositionMetrics(localPosition.id) || {};
  
  // 포지션 크기 계산 (총자산 대비)
  const positionSize = metrics.size?.toFixed(1) || '0.0';

  // 리스크 확인이 필요한지 체크
  const checkRiskConfirmation = async (): Promise<boolean> => {
    const { percent: riskPercent } = previewRisk;
    const currentMaxRisk = localPosition.maxRiskAmount?.toNumber() || 0;
    
    let confirmMessages: string[] = [];
    
    // 1. 포지션 리스크가 2% 초과
    if (riskPercent > 2) {
      confirmMessages.push(
        t('stopLoss.messages.riskExceeds2Percent', { risk: riskPercent.toFixed(2) })
      );
    }
    
    // 2. 기존 Initial R(최대 리스크)를 초과
    if (currentMaxRisk > 0 && previewRisk.amount > currentMaxRisk) {
      const increasePercent = ((previewRisk.amount - currentMaxRisk) / currentMaxRisk * 100).toFixed(1);
      confirmMessages.push(
        t('stopLoss.messages.riskExceedsInitial', { percent: increasePercent })
      );
    }
    
    // 확인이 필요한 경우
    if (confirmMessages.length > 0) {
      return new Promise((resolve) => {
        modal.confirm({
          title: t('stopLoss.messages.riskConfirmTitle'),
          content: (
            <div>
              {confirmMessages.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
              <p style={{ marginTop: 16, fontWeight: 'bold' }}>
                {t('stopLoss.messages.continueQuestion')}
              </p>
            </div>
          ),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
          okText: t('stopLoss.actions.confirm'),
          cancelText: t('stopLoss.actions.cancel'),
        });
      });
    }
    
    return true;
  };

  // 저장 처리
  const handleSaveStopLosses = async () => {
    const validation = validateStopLosses();
    if (!validation.isValid) {
      message.error(validation.errors[0]);
      return;
    }
    
    const confirmed = await checkRiskConfirmation();
    if (!confirmed) return;
    
    await saveStopLosses(setAsInitialR);
  };

  // 수량/비율 표시와 함께 리스크 정보 추가
  const enrichedStopLosses = stopLosses.map(sl => ({
    ...sl,
    risk: sl.price && sl.price > 0 && sl.quantity > 0 
      ? calculateStopLossRisk(localPosition.avgBuyPrice, sl.price, sl.quantity)
      : null
  }));

  return (
    <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 정보 */}
        <div style={{ 
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${token.colorBorderSecondary}`
        }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">{t('stopLoss.header.position')}</Text>
              <Text strong>{localPosition.tickerName || localPosition.ticker}</Text>
            </Space>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">{t('stopLoss.header.quantity')}</Text>
              <Text>{localPosition.totalShares}주 @ {formatCurrency(localPosition.avgBuyPrice, activeAccount?.currency)}</Text>
            </Space>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">{t('stopLoss.header.positionSize')}</Text>
              <Text style={{ color: token.colorInfo, fontWeight: 'bold' }}>{positionSize}%</Text>
            </Space>
            <div style={{
              marginTop: 12,
              padding: 12,
              background: token.colorFillQuaternary,
              borderRadius: 6
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('stopLoss.header.expectedRisk')}</Text>
              <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: token.colorError, fontWeight: 'bold' }}>
                  {formatCurrency(Math.abs(previewRisk.amount), activeAccount?.currency)}
                </Text>
                <Text style={{ color: previewRisk.percent === 0 ? token.colorTextSecondary : token.colorError }}>
                  {t('stopLoss.header.pureRisk')}: {previewRisk.percent.toFixed(2)}%
                </Text>
              </Space>
            </div>
          </Space>
        </div>

        {/* 스탑로스 폼 */}
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          <StopLossForm
            stopLosses={enrichedStopLosses}
            onAdd={addStopLoss}
            onRemove={removeStopLoss}
            onUpdate={updateStopLoss}
            onSave={handleSaveStopLosses}
            totalShares={localPosition.totalShares}
            currency={activeAccount?.currency}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            showTabs={true}
            firstInputRef={firstInputRef}
          />
          
          {/* 각 스탑로스의 리스크 표시 */}
          {enrichedStopLosses.map((sl) => 
            sl.risk && (
              <div key={sl.id} style={{ marginTop: 4, marginLeft: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {t('stopLoss.messages.risk')}: {formatCurrency(Math.abs(sl.risk.amount), activeAccount?.currency)} 
                  ({sl.risk.percent.toFixed(2)}%)
                </Text>
              </div>
            )
          )}
        </div>

        {/* 액션 버튼 */}
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          {stopLosses.length > 0 && (
            <>
              <Space align="center">
                <Checkbox 
                  checked={setAsInitialR}
                  onChange={(e) => setSetAsInitialR(e.target.checked)}
                >
                  {t('stopLoss.actions.setAsInitialR')}
                </Checkbox>
                <Tooltip title={t('stopLoss.tooltip.initialR')}>
                  <QuestionCircleOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />
                </Tooltip>
              </Space>
              <Button
                type="primary"
                size="small"
                onClick={handleSaveStopLosses}
                loading={loading}
                style={{ padding: '2px 12px', fontSize: 12 }}
              >
                {t('stopLoss.actions.save')}
              </Button>
            </>
          )}
        </Space>
    </div>
  );
};

export default StopLossModal;