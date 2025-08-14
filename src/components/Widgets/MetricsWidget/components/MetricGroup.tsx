import React, { useState, useEffect } from 'react';
import { Button, Input, Space, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  EditOutlined, 
  DeleteOutlined,
  CheckOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { MetricGroupProps } from '../types';
import { SortableMetricItem } from './SortableMetricItem';
import { MetricValue } from './MetricValue';
import { HelpTooltip } from '../../../Common/HelpTooltip';
import type { EquityStats } from '../../../../pages/Journal/types';
import type { PortfolioMetrics } from '../../../../utils/metrics/facade';
import type { Account } from '../../../../types';

// Helper function to get translated group title
const getGroupTitle = (groupId: string, title: string, t: (key: string) => string) => {
  const groupKeyMap: Record<string, string> = {
    'portfolio': 'metricsWidget.groups.portfolioOverview',
    'performance': 'metricsWidget.groups.performanceMetrics',
    'risk': 'metricsWidget.groups.riskManagement',
  };
  
  // If it's a default group, use translation, otherwise use the custom title
  return groupKeyMap[groupId] ? t(groupKeyMap[groupId]) : title;
};

// Helper function to get translated card title
const getCardTitle = (cardId: string, t: (key: string) => string) => {
  const cardKeyMap: Record<string, string> = {
    'current-value': 'metricsWidget.metrics.currentValue',
    'total-return': 'metricsWidget.metrics.totalReturn',
    'max-drawdown': 'metricsWidget.metrics.maxDrawdown',
    'trading-days': 'metricsWidget.metrics.tradingDays',
    'stock-cash': 'metricsWidget.metrics.stockCash',
    'win-rate': 'metricsWidget.metrics.winRate',
    'avg-win-r': 'metricsWidget.metrics.avgWinR',
    'avg-loss-r': 'metricsWidget.metrics.avgLossR',
    'avg-positions-day': 'metricsWidget.metrics.avgPositionsDay',
    'avg-holding-time': 'metricsWidget.metrics.avgHolding',
    'avg-winner-holding-time': 'metricsWidget.metrics.avgWinnerHolding',
    'avg-loser-holding-time': 'metricsWidget.metrics.avgLoserHolding',
    'open-positions': 'metricsWidget.metrics.openPositions',
    'portfolio-open-risk': 'metricsWidget.metrics.portfolioOpenRisk',
    'portfolio-open-risk-dollar': 'metricsWidget.metrics.portfolioOpenRiskDollar',
    'portfolio-net-risk': 'metricsWidget.metrics.portfolioNetRisk',
    'portfolio-net-risk-dollar': 'metricsWidget.metrics.portfolioNetRiskDollar',
    'expectancy': 'metricsWidget.metrics.expectancy',
    'expectancy-r': 'metricsWidget.metrics.expectancyR',
    'payoff-ratio': 'metricsWidget.metrics.payoffRatio',
    'avg-risk-per-trade': 'metricsWidget.metrics.avgRiskPerTrade',
    'avg-size-per-trade': 'metricsWidget.metrics.avgSizePerTrade',
    'std-dev-returns': 'metricsWidget.metrics.stdDevReturns',
    'downside-deviation': 'metricsWidget.metrics.downsideDeviation',
    'sharpe-ratio': 'metricsWidget.metrics.sharpeRatio',
    'max-consecutive-wins': 'metricsWidget.metrics.maxConsecutiveWins',
    'max-consecutive-losses': 'metricsWidget.metrics.maxConsecutiveLosses',
    'raroc': 'metricsWidget.metrics.raroc',
  };
  
  return t(cardKeyMap[cardId] || cardId);
};

export const MetricGroup: React.FC<MetricGroupProps & {
  equityStats: EquityStats | undefined;
  portfolioMetrics: PortfolioMetrics | null;
  activeAccount: Account | null;
  isLastGroup: boolean;
  containerWidth?: number;
}> = ({
  group,
  cards,
  hiddenCards,
  onRemoveCard,
  onDeleteGroup,
  onUpdateTitle,
  settings,
  equityStats,
  portfolioMetrics,
  activeAccount,
  isLastGroup,
  containerWidth = 300,
}) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(group.title);
  const [isResizing, setIsResizing] = useState(false);
  
  // 저장된 너비를 불러오거나 기본값 사용
  const [groupWidth, setGroupWidth] = useState(() => {
    const saved = localStorage.getItem(`metric-group-width-${group.id}`);
    return saved ? parseInt(saved, 10) : containerWidth;
  });
  
  // 너비 변경 시 저장
  useEffect(() => {
    localStorage.setItem(`metric-group-width-${group.id}`, groupWidth.toString());
  }, [groupWidth, group.id]);

  const groupCards = cards.filter(c => 
    c.groupId === group.id && 
    !hiddenCards.includes(c.id) &&
    (c.visible !== false) // visible이 false가 아닌 카드만 표시
  );

  const handleSaveTitle = () => {
    if (editingTitle.trim()) {
      onUpdateTitle(group.id, editingTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditingTitle(group.title);
    setIsEditing(false);
  };

  // 리사이즈 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = groupWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(1200, startWidth + e.clientX - startX));
      setGroupWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 너비에 따른 그리드 컬럼 계산
  const getGridColumns = () => {
    if (groupWidth < 400) return 1;
    if (groupWidth < 600) return 2;
    if (groupWidth < 900) return 3;
    return 4;
  };

  return (
    <div 
      className="metric-group" 
      style={{
        background: token.colorFillQuaternary,
        border: `1px solid ${token.colorBorderSecondary}`,
        width: groupWidth,
        position: 'relative',
      }}>
      <div className="group-header" style={{
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}>
        {isEditing ? (
          <Input
            value={editingTitle}
            onChange={e => setEditingTitle(e.target.value)}
            onPressEnter={handleSaveTitle}
            onBlur={handleSaveTitle}
            size="small"
            style={{ width: 200 }}
            autoFocus
            suffix={
              <Space size={4}>
                <CheckOutlined 
                  onClick={handleSaveTitle} 
                  style={{ cursor: 'pointer', color: '#52c41a' }}
                />
                <CloseCircleOutlined 
                  onClick={handleCancelEdit}
                  style={{ cursor: 'pointer', color: '#ff4d4f' }}
                />
              </Space>
            }
          />
        ) : (
          <>
            <h3 className="group-title" style={{ color: token.colorPrimary }}>{getGroupTitle(group.id, group.title, t)}</h3>
            <div className="group-actions">
              <Button
                icon={<EditOutlined />}
                size="small"
                type="text"
                onClick={() => {
                  setIsEditing(true);
                  setEditingTitle(group.title);
                }}
              />
              {!isLastGroup && (
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  type="text"
                  danger
                  onClick={() => onDeleteGroup(group.id)}
                />
              )}
            </div>
          </>
        )}
      </div>

      <SortableContext
        items={groupCards.map(c => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div 
          className="metrics-list"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
            gap: '12px',
          }}
        >
          {groupCards.length === 0 ? (
            <div className="empty-group" style={{ 
              color: token.colorTextDisabled,
              gridColumn: '1 / -1',
              textAlign: 'center',
            }}>
              드래그하여 메트릭 추가
            </div>
          ) : (
            groupCards.map(card => {
              // 카드 ID를 camelCase로 변환 (예: current-value -> currentValue)
              const helpKey = card.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
              return (
                <HelpTooltip
                  key={card.id}
                  title={t(`metricsWidget.help.${helpKey}.title`)}
                  description={t(`metricsWidget.help.${helpKey}.description`)}
                  placement="top"
                >
                  <SortableMetricItem
                    card={card}
                    onRemove={onRemoveCard}
                  >
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%'
                    }}>
                      <div style={{ 
                        fontSize: settings.titleFontSize, 
                        color: token.colorTextTertiary,
                        marginBottom: 4,
                        fontWeight: settings.titleBold ? 'bold' : 'normal',
                        textAlign: 'center'
                      }}>
                        {getCardTitle(card.id, t)}
                      </div>
                      <MetricValue
                        cardId={card.id}
                        equityStats={equityStats}
                        portfolioMetrics={portfolioMetrics}
                        activeAccount={activeAccount}
                        settings={settings}
                      />
                    </div>
                  </SortableMetricItem>
                </HelpTooltip>
              );
            })
          )}
        </div>
      </SortableContext>
      
      {/* 리사이즈 핸들 */}
      <div
        className={`group-resize-handle ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'col-resize',
          background: isResizing ? token.colorPrimary : 'transparent',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isResizing) {
            e.currentTarget.style.background = `${token.colorPrimary}40`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      />
    </div>
  );
};