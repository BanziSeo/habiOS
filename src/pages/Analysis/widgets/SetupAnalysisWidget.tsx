import React, { useMemo } from 'react';
import { Card, Statistic, Row, Col, Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'decimal.js';
import type { Position, Account } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { ChartTooltip } from '../../../components/Common/ChartTooltip';

interface SetupAnalysisWidgetProps {
  positions: Position[];
  activeAccount?: Account;
}

interface SetupStats {
  name: string;
  count: number;
  winCount: number;
  lossCount: number;
  totalPnl: Decimal;
  avgPnl: Decimal;
  winRate: number;
  avgWin: Decimal;
  avgLoss: Decimal;
}

export const SetupAnalysisWidget: React.FC<SetupAnalysisWidgetProps> = ({ positions, activeAccount }) => {
  const { t } = useTranslation('analysis');
  const setupStats = useMemo(() => {
    const statsMap = new Map<string, SetupStats>();

    // 셋업이 없는 포지션은 "미분류"로 처리
    positions.forEach(position => {
      const setupType = position.setupType || t('widgets.uncategorized');
      
      if (!statsMap.has(setupType)) {
        statsMap.set(setupType, {
          name: setupType,
          count: 0,
          winCount: 0,
          lossCount: 0,
          totalPnl: new Decimal(0),
          avgPnl: new Decimal(0),
          winRate: 0,
          avgWin: new Decimal(0),
          avgLoss: new Decimal(0),
        });
      }

      const stats = statsMap.get(setupType)!;
      const pnl = position.realizedPnl || new Decimal(0);
      
      stats.count++;
      stats.totalPnl = stats.totalPnl.plus(pnl);
      
      if (pnl.greaterThan(0)) {
        stats.winCount++;
      } else if (pnl.lessThan(0)) {
        stats.lossCount++;
      }
    });

    // 통계 계산
    statsMap.forEach(stats => {
      if (stats.count > 0) {
        stats.avgPnl = stats.totalPnl.div(stats.count);
        stats.winRate = (stats.winCount / stats.count) * 100;
        
        // 평균 승리/손실 계산
        let totalWin = new Decimal(0);
        let totalLoss = new Decimal(0);
        
        positions
          .filter(p => (p.setupType || t('widgets.uncategorized')) === stats.name)
          .forEach(p => {
            const pnl = p.realizedPnl || new Decimal(0);
            if (pnl.greaterThan(0)) {
              totalWin = totalWin.plus(pnl);
            } else if (pnl.lessThan(0)) {
              totalLoss = totalLoss.plus(pnl.abs());
            }
          });
        
        stats.avgWin = stats.winCount > 0 ? totalWin.div(stats.winCount) : new Decimal(0);
        stats.avgLoss = stats.lossCount > 0 ? totalLoss.div(stats.lossCount) : new Decimal(0);
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
  }, [positions]);

  // 파이 차트 데이터
  const pieData = setupStats.map(stats => ({
    name: stats.name,
    value: stats.count,
    percent: (stats.count / positions.length) * 100
  }));

  // 차트 색상
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  // 커스텀 툴팁 렌더 함수
  const renderTooltipContent = (payload: Array<{ name: string; value: number; payload: { percent: number } }>) => {
    const data = payload[0];
    const stats = setupStats.find(s => s.name === data.name);
    if (!stats) return null;
    
    return (
      <>
        <p style={{ margin: 0, color: '#fff' }}><strong>{data.name}</strong></p>
        <p style={{ margin: 0, color: '#888' }}>{t('widgets.tradeCountValue', { count: stats.count })}</p>
        <p style={{ margin: 0, color: '#888' }}>{t('widgets.ratioPercent', { percent: data.payload.percent.toFixed(1) })}</p>
        <p style={{ margin: 0, color: stats.winRate >= 50 ? '#52c41a' : '#ff4d4f' }}>
          {t('widgets.winRatePercent', { rate: stats.winRate.toFixed(1) })}
        </p>
      </>
    );
  };

  const CustomTooltip = (props: TooltipProps<number, string>) => (
    <ChartTooltip {...props} renderContent={renderTooltipContent} />
  );

  // 커스텀 레이블
  const renderCustomizedLabel = (entry: { name: string; value: number }) => {
    return `${entry.name}: ${entry.value}`;
  };

  if (positions.length === 0) {
    return <Empty description={t('noPositions')} />;
  }

  const selectedSetup = setupStats[0]; // 가장 많이 사용된 셋업

  return (
    <div className="analysis-widget-content">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col span={12}>
          {selectedSetup && (
            <Card size="small" title={t('widgets.detailedStats', { name: selectedSetup.name })}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title={t('widgets.tradeCount')}
                    value={selectedSetup.count}
                    suffix={t('widgets.count')}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('widgets.winRate')}
                    value={selectedSetup.winRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: selectedSetup.winRate >= 50 ? '#3f8600' : '#cf1322' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={t('widgets.totalPnl')}
                    value={formatCurrency(selectedSetup.totalPnl, activeAccount?.currency)}
                    valueStyle={{ 
                      color: selectedSetup.totalPnl.greaterThan(0) ? '#3f8600' : '#cf1322',
                      fontSize: 16
                    }}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>
      
      <div style={{ marginTop: 16, maxHeight: 200, overflow: 'auto' }}>
        {setupStats.map(stats => (
          <Card 
            key={stats.name} 
            size="small" 
            style={{ marginBottom: 8 }}
            styles={{ body: { padding: '8px 16px' } }}
          >
            <Row align="middle" gutter={16}>
              <Col span={6}>
                <strong>{stats.name}</strong>
              </Col>
              <Col span={4}>
                {stats.count}{t('widgets.count')}
              </Col>
              <Col span={5}>
                {t('widgets.winRatePercent', { rate: stats.winRate.toFixed(1) })}
              </Col>
              <Col span={9} style={{ textAlign: 'right' }}>
                <span style={{ 
                  color: stats.totalPnl.greaterThan(0) ? '#3f8600' : '#cf1322',
                  fontWeight: 'bold'
                }}>
                  {formatCurrency(stats.totalPnl, activeAccount?.currency)}
                </span>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </div>
  );
};