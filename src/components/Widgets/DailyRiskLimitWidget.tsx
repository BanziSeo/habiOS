import React, { useState, useMemo } from 'react';
import { Space, Button, InputNumber, Progress, Typography, Spin, List, Badge, theme, Radio, Tooltip, Switch } from 'antd';
import { EditOutlined, SaveOutlined, InfoCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTradingStore } from '../../stores/tradingStore';
import { useMetricsStore } from '../../stores/metricsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatCurrency } from '../../utils/formatters';
import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import { useDailyPlan } from '../../hooks/useDailyPlan';

const { Text } = Typography;

interface DailyRiskLimitWidgetProps {
  selectedDate: dayjs.Dayjs;
}


export const DailyRiskLimitWidget: React.FC<DailyRiskLimitWidgetProps> = ({ selectedDate }) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const { activeAccount, positions } = useTradingStore();
  const { totalAssets, calculateStopLossRisk } = useMetricsStore();
  const { generalSettings, updateGeneralSettings } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPositionBreakdown, setShowPositionBreakdown] = useState(false);
  
  // 리스크 계산 모드 (기본값: downsideOnly)
  const riskMode = generalSettings.riskCalculationMode || 'downsideOnly';
  
  // 커스텀 훅 사용
  const {
    loadedPlan,
    isLoading,
    isSaving,
    dailyRiskLimit,
    dailyRiskPercent,
    saveDailyPlan,
    updateDailyRiskPercent,
  } = useDailyPlan({ selectedDate });
  
  const handleSave = async () => {
    await saveDailyPlan({ dailyRiskLimit });
    setIsEditing(false);
  };
  
  const handleModeChange = (mode: 'downsideOnly' | 'withUpside') => {
    updateGeneralSettings({ riskCalculationMode: mode });
  };

  // 리스크 계산 (모드에 따라 다르게 계산)
  const riskMetrics = useMemo(() => {
    // 영웅문 거래일 기준으로 변경
    const targetBrokerDate = selectedDate.format('YYYY/MM/DD');
    
    
    let existingRisk = new Decimal(0);
    let newRisk = new Decimal(0);
    let totalRealizedPnl = new Decimal(0); // 오늘 총 실현 손익
    
    // 포지션 분류별 리스크
    const breakdown = {
      overnightActive: new Decimal(0),
      overnightClosed: new Decimal(0),
      todayActive: new Decimal(0),
      todayClosed: new Decimal(0)
    };
    
    // 1. ACTIVE 포지션의 Open Risk 계산 (현재 노출된 리스크)
    const activePositions = positions.filter(pos => pos.status === 'ACTIVE');
    activePositions.forEach(pos => {
      // 첫 거래(매수)의 brokerDate로 판단 (영웅문 거래일 기준)
      const firstBuyTrade = pos.trades?.find(t => t.tradeType === 'BUY');
      const openBrokerDate = firstBuyTrade?.brokerDate;
      const isNewPosition = openBrokerDate === targetBrokerDate;
      
      
      let positionRisk = new Decimal(0);
      
      // 스탑로스가 있는 경우
      const activeStopLoss = pos.stopLosses?.find(sl => sl.isActive);
      if (activeStopLoss) {
        const riskResult = calculateStopLossRisk(pos.avgBuyPrice, activeStopLoss.stopPrice.toNumber(), activeStopLoss.stopQuantity);
        positionRisk = new Decimal(riskResult.amount);
        
        
        // 모드별 처리
        if (riskMode === 'downsideOnly') {
          // Downside Only: Trailing stop으로 이익 확보된 경우 0으로 처리
          if (positionRisk.lessThan(0)) {
            positionRisk = new Decimal(0);
          }
        } else {
        }
        // With Upside: 음수 값도 그대로 사용 (이익으로 리스크 감소)
      } else if (pos.totalShares > 0) {
        // 스탑로스가 없는 경우: 전체 포지션을 리스크로 간주
        positionRisk = pos.avgBuyPrice.times(pos.totalShares).times(1.0014); // 수수료 포함
      }
      
      
      if (isNewPosition) {
        newRisk = newRisk.plus(positionRisk);
        breakdown.todayActive = breakdown.todayActive.plus(positionRisk);
      } else {
        existingRisk = existingRisk.plus(positionRisk);
        breakdown.overnightActive = breakdown.overnightActive.plus(positionRisk);
      }
    });
    
    // 2. 오늘 CLOSED된 포지션의 실현 손익 처리
    const closedTodayPositions = positions.filter(pos => {
      if (pos.status !== 'CLOSED') return false;
      // 마지막 거래(매도)의 brokerDate로 판단 (영웅문 거래일 기준)
      const lastSellTrade = pos.trades?.filter(t => t.tradeType === 'SELL').pop();
      const closeBrokerDate = lastSellTrade?.brokerDate;
      return closeBrokerDate === targetBrokerDate;
    });
    
    closedTodayPositions.forEach(pos => {
      // 첫 거래(매수)의 brokerDate로 판단 (영웅문 거래일 기준)
      const firstBuyTrade = pos.trades?.find(t => t.tradeType === 'BUY');
      const openBrokerDate = firstBuyTrade?.brokerDate;
      const isNewPosition = openBrokerDate === targetBrokerDate;
      
      
      // 오늘 실현 손익 누적 (모드와 관계없이 통계용)
      totalRealizedPnl = totalRealizedPnl.plus(pos.realizedPnl);
      
      if (riskMode === 'downsideOnly') {
        // Downside Only: 실현 손실만 리스크에 추가 (이익은 무시)
        if (pos.realizedPnl.lessThan(0)) {
          const realizedLoss = pos.realizedPnl.abs(); // 손실을 양수로 변환
          if (isNewPosition) {
            // 오늘 오픈하고 오늘 손실로 마감한 포지션
            newRisk = newRisk.plus(realizedLoss);
            breakdown.todayClosed = breakdown.todayClosed.plus(realizedLoss);
          } else {
            // 이전에 오픈하고 오늘 손실로 마감한 포지션
            existingRisk = existingRisk.plus(realizedLoss);
            breakdown.overnightClosed = breakdown.overnightClosed.plus(realizedLoss);
          }
        } else {
        }
      } else {
        // With Upside: 실현 손익을 리스크에서 차감 (Net Risk 계산)
        // 손실은 리스크 증가, 이익은 리스크 감소
        const netRiskAdjustment = pos.realizedPnl.neg(); // 손실은 양수로, 이익은 음수로
        if (isNewPosition) {
          newRisk = newRisk.plus(netRiskAdjustment);
          breakdown.todayClosed = breakdown.todayClosed.plus(netRiskAdjustment);
        } else {
          existingRisk = existingRisk.plus(netRiskAdjustment);
          breakdown.overnightClosed = breakdown.overnightClosed.plus(netRiskAdjustment);
        }
      }
    });
    
    const totalAssetsNum = totalAssets > 0 ? totalAssets : 1;
    const existingRiskPercent = existingRisk.div(totalAssetsNum).mul(100);
    const newRiskPercent = newRisk.div(totalAssetsNum).mul(100);
    const totalRiskPercent = existingRiskPercent.plus(newRiskPercent);
    
    
    return {
      existingPercent: existingRiskPercent.toNumber(),
      newPercent: newRiskPercent.toNumber(),
      totalPercent: totalRiskPercent.toNumber(),
      isOverLimit: totalRiskPercent.toNumber() > dailyRiskPercent,
      todayRealizedPnl: totalRealizedPnl.toNumber(),
      todayRealizedPnlPercent: totalRealizedPnl.div(totalAssetsNum).mul(100).toNumber(),
      breakdown: {
        overnightActive: {
          amount: breakdown.overnightActive.toNumber(),
          percent: breakdown.overnightActive.div(totalAssetsNum).mul(100).toNumber()
        },
        overnightClosed: {
          amount: breakdown.overnightClosed.toNumber(),
          percent: breakdown.overnightClosed.div(totalAssetsNum).mul(100).toNumber()
        },
        todayActive: {
          amount: breakdown.todayActive.toNumber(),
          percent: breakdown.todayActive.div(totalAssetsNum).mul(100).toNumber()
        },
        todayClosed: {
          amount: breakdown.todayClosed.toNumber(),
          percent: breakdown.todayClosed.div(totalAssetsNum).mul(100).toNumber()
        }
      }
    };
  }, [positions, selectedDate, totalAssets, dailyRiskPercent, calculateStopLossRisk, riskMode]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin />
      </div>
    );
  }

  if (!activeAccount) {
    return <div>{t('dailyRiskLimit.selectAccount')}</div>;
  }

  // 리스크 항목 데이터
  const riskItems = [
    {
      key: 'target',
      label: t('dailyRiskLimit.targetLimit'),
      description: t('dailyRiskLimit.targetLimitDesc'),
      value: `${dailyRiskPercent.toFixed(1)}%`,
      subValue: formatCurrency(dailyRiskLimit, activeAccount.currency),
      valueColor: token.colorPrimary
    },
    {
      key: 'current',
      label: t('dailyRiskLimit.currentUsage'),
      description: t('dailyRiskLimit.currentUsageDesc', { 
        existing: riskMetrics.existingPercent.toFixed(1), 
        new: riskMetrics.newPercent.toFixed(1) 
      }),
      value: `${riskMetrics.totalPercent.toFixed(1)}%`,
      subValue: formatCurrency(
        totalAssets > 0 ? totalAssets * (riskMetrics.totalPercent / 100) : 0,
        activeAccount.currency
      ),
      valueColor: riskMetrics.isOverLimit ? token.colorError : token.colorPrimary
    },
    {
      key: 'remain',
      label: riskMetrics.isOverLimit ? t('dailyRiskLimit.exceededAmount') : t('dailyRiskLimit.remainingLimit'),
      description: riskMetrics.isOverLimit ? t('dailyRiskLimit.positionAdjustNeeded') : t('dailyRiskLimit.availableForNew'),
      value: `${riskMetrics.isOverLimit ? '-' : ''}${Math.abs(dailyRiskPercent - riskMetrics.totalPercent).toFixed(1)}%`,
      subValue: formatCurrency(
        totalAssets > 0 ? totalAssets * Math.abs((dailyRiskPercent - riskMetrics.totalPercent) / 100) : 0,
        activeAccount.currency
      ),
      valueColor: riskMetrics.isOverLimit ? token.colorError : token.colorSuccess
    }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .risk-list-item:hover {
          background: ${token.colorFillQuaternary};
        }
        .risk-warning-badge {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
      
      <div style={{ 
        borderRadius: 8, 
        padding: 16,
        border: riskMetrics.isOverLimit ? `1px solid ${token.colorErrorBorder}` : '1px solid transparent'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{t('dailyRiskLimit.title')}</h3>
            {riskMetrics.isOverLimit && (
              <Badge 
                count={t('dailyRiskLimit.exceeded')} 
                style={{ 
                  backgroundColor: token.colorError,
                  fontSize: 11,
                  height: 20,
                  lineHeight: '20px',
                  padding: '0 8px'
                }}
                className="risk-warning-badge"
              />
            )}
          </div>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => setIsEditing(true)}
            type="text"
          />
        </div>
        
        {/* 리스크 계산 모드 전환 */}
        <div style={{ marginBottom: 16, padding: '8px 12px', background: token.colorFillQuaternary, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Radio.Group 
              value={riskMode} 
              onChange={(e) => handleModeChange(e.target.value)}
              size="small"
              buttonStyle="solid"
            >
              <Radio.Button value="downsideOnly">
                <Tooltip title={t('dailyRiskLimit.downsideOnlyTooltip')}>
                  {t('dailyRiskLimit.downsideOnly')}
                </Tooltip>
              </Radio.Button>
              <Radio.Button value="withUpside">
                <Tooltip title={t('dailyRiskLimit.withUpsideTooltip')}>
                  {t('dailyRiskLimit.withUpside')}
                </Tooltip>
              </Radio.Button>
            </Radio.Group>
            <Tooltip 
              title={
                riskMode === 'downsideOnly' 
                  ? t('dailyRiskLimit.downsideOnlyDesc')
                  : t('dailyRiskLimit.withUpsideDesc')
              }
            >
              <InfoCircleOutlined style={{ fontSize: 14, color: token.colorTextTertiary, cursor: 'help' }} />
            </Tooltip>
          </div>
          
          {/* 포지션 분류 토글 */}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary, marginRight: 8 }}>
              {t('dailyRiskLimit.positionBreakdown')}
            </Text>
            <Switch
              size="small"
              checked={showPositionBreakdown}
              onChange={setShowPositionBreakdown}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>
        </div>
        
        {isEditing ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>{t('dailyRiskLimit.targetRiskLimitPercent')}</Text>
              <InputNumber
                value={dailyRiskPercent}
                onChange={(val) => updateDailyRiskPercent(val || 0)}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value!.replace('%', ''))}
                min={0}
                max={100}
                step={0.1}
                precision={1}
                style={{ width: '100%', fontSize: 18, marginTop: 8 }}
                autoFocus
              />
              <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 4, display: 'block' }}>
                = {formatCurrency(dailyRiskLimit, activeAccount.currency)}
              </Text>
            </div>
            <Space>
              <Button size="small" onClick={() => {
                setIsEditing(false);
                if (loadedPlan) {
                  updateDailyRiskPercent((loadedPlan.dailyRiskLimit / (totalAssets || 1)) * 100);
                }
              }}>{t('dailyRiskLimit.cancel')}</Button>
              <Button 
                type="primary" 
                size="small"
                icon={<SaveOutlined />}
                loading={isSaving}
                onClick={handleSave}
              >
                {t('dailyRiskLimit.save')}
              </Button>
            </Space>
          </div>
        ) : (
          <List
            dataSource={riskItems}
            renderItem={item => (
              <List.Item 
                key={item.key}
                className="risk-list-item"
                style={{ 
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  transition: 'background 0.2s',
                  borderRadius: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                  marginLeft: -8,
                  marginRight: -8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: token.colorTextTertiary }}>{item.description}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: item.valueColor }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: token.colorTextTertiary }}>{item.subValue}</div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
        
        {/* 포지션 분류별 리스크 표시 */}
        {showPositionBreakdown && !isEditing && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px', 
            background: token.colorFillQuaternary, 
            borderRadius: 6,
            border: `1px solid ${token.colorBorderSecondary}`
          }}>
            <Text style={{ fontSize: 12, fontWeight: 600, color: token.colorText, display: 'block', marginBottom: 12 }}>
              {t('dailyRiskLimit.positionBreakdown')}
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, display: 'block', marginBottom: 4 }}>
                  {t('dailyRiskLimit.overnightActive')}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 500, color: token.colorPrimary }}>
                  {riskMetrics.breakdown.overnightActive.percent.toFixed(2)}%
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginLeft: 8 }}>
                  {formatCurrency(riskMetrics.breakdown.overnightActive.amount, activeAccount?.currency || 'USD')}
                </Text>
              </div>
              <div>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, display: 'block', marginBottom: 4 }}>
                  {t('dailyRiskLimit.overnightClosed')}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 500, color: token.colorPrimary }}>
                  {riskMetrics.breakdown.overnightClosed.percent.toFixed(2)}%
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginLeft: 8 }}>
                  {formatCurrency(riskMetrics.breakdown.overnightClosed.amount, activeAccount?.currency || 'USD')}
                </Text>
              </div>
              <div>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, display: 'block', marginBottom: 4 }}>
                  {t('dailyRiskLimit.todayActive')}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 500, color: token.colorPrimary }}>
                  {riskMetrics.breakdown.todayActive.percent.toFixed(2)}%
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginLeft: 8 }}>
                  {formatCurrency(riskMetrics.breakdown.todayActive.amount, activeAccount?.currency || 'USD')}
                </Text>
              </div>
              <div>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, display: 'block', marginBottom: 4 }}>
                  {t('dailyRiskLimit.todayClosed')}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 500, color: token.colorPrimary }}>
                  {riskMetrics.breakdown.todayClosed.percent.toFixed(2)}%
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary, marginLeft: 8 }}>
                  {formatCurrency(riskMetrics.breakdown.todayClosed.amount, activeAccount?.currency || 'USD')}
                </Text>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ 
            marginBottom: 12, 
            fontSize: 20, 
            fontWeight: 600,
            color: riskMetrics.isOverLimit ? token.colorError : token.colorSuccess,
            textAlign: 'center'
          }}>
            {t('dailyRiskLimit.usage')}: {((riskMetrics.totalPercent / dailyRiskPercent) * 100).toFixed(0)}%
          </div>
          <Progress 
            percent={Math.min((riskMetrics.totalPercent / dailyRiskPercent) * 100, 100)} 
            strokeColor={{
              '0%': riskMetrics.isOverLimit ? token.colorError : token.colorPrimary,
              '100%': riskMetrics.isOverLimit ? token.colorError : token.colorInfo
            }}
            showInfo={false}
            size="small"
          />
          
          {/* 오늘 실현 손익 정보 */}
          <div style={{ 
            marginTop: 12, 
            padding: '8px 12px', 
            background: token.colorFillQuaternary, 
            borderRadius: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              {t('dailyRiskLimit.todayRealizedPnl')}
            </Text>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: 600,
              color: riskMetrics.todayRealizedPnl >= 0 ? token.colorSuccess : token.colorError 
            }}>
              {riskMetrics.todayRealizedPnlPercent >= 0 ? '+' : ''}{riskMetrics.todayRealizedPnlPercent.toFixed(2)}%
              <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginLeft: 8 }}>
                ({formatCurrency(riskMetrics.todayRealizedPnl, activeAccount?.currency || 'USD')})
              </Text>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};