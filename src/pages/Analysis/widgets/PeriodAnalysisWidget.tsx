import React, { useMemo, useState } from 'react';
import { Card, Radio, Row, Col, Statistic, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import type { Position, Account } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { ChartTooltip } from '../../../components/Common/ChartTooltip';

interface PeriodAnalysisWidgetProps {
  positions: Position[];
  activeAccount?: Account;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

interface PeriodStats {
  period: string;
  date: string;
  count: number;
  totalPnl: number;
  winCount: number;
  winRate: number;
  cumulativePnl: number;
}

export const PeriodAnalysisWidget: React.FC<PeriodAnalysisWidgetProps> = ({ positions, activeAccount }) => {
  const { t } = useTranslation('analysis');
  const [periodType, setPeriodType] = useState<PeriodType>('daily');

  const periodStats = useMemo(() => {
    const statsMap = new Map<string, PeriodStats>();
    
    // 포지션을 날짜순으로 정렬
    const sortedPositions = [...positions].sort((a, b) => 
      new Date(a.closeDate || a.openDate).getTime() - new Date(b.closeDate || b.openDate).getTime()
    );

    // 기간별 통계 계산
    sortedPositions.forEach(position => {
      // 마지막 SELL 거래의 brokerDate 또는 첫 BUY 거래의 brokerDate 사용
      let brokerDate: string | undefined;
      
      if (position.status === 'CLOSED' && position.trades) {
        const lastSell = position.trades
          .filter(t => t.tradeType === 'SELL')
          .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime())[0];
        brokerDate = lastSell?.brokerDate;
      }
      
      if (!brokerDate && position.trades) {
        const firstBuy = position.trades.find(t => t.tradeType === 'BUY');
        brokerDate = firstBuy?.brokerDate;
      }
      
      if (!brokerDate) return; // brokerDate가 없으면 건너뜀
      
      // brokerDate 형식 통일 (YYYY/MM/DD -> YYYY-MM-DD)
      const normalizedDate = brokerDate.replace(/\//g, '-');
      const momentDate = dayjs(normalizedDate);
      
      let periodKey: string;
      if (periodType === 'daily') {
        periodKey = momentDate.format('YYYY-MM-DD');
      } else if (periodType === 'weekly') {
        const weekStart = momentDate.startOf('week');
        periodKey = weekStart.format('YYYY-MM-DD');
      } else {
        periodKey = momentDate.format('YYYY-MM');
      }

      if (!statsMap.has(periodKey)) {
        statsMap.set(periodKey, {
          period: periodKey,
          date: periodKey,
          count: 0,
          totalPnl: 0,
          winCount: 0,
          winRate: 0,
          cumulativePnl: 0,
        });
      }

      const stats = statsMap.get(periodKey)!;
      const pnl = position.realizedPnl || new Decimal(0);
      
      stats.count++;
      stats.totalPnl += pnl.toNumber();
      
      if (pnl.greaterThan(0)) {
        stats.winCount++;
      }
    });

    // 승률 및 누적 손익 계산
    let cumulative = 0;
    const statsArray = Array.from(statsMap.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    );
    
    statsArray.forEach(stats => {
      cumulative += stats.totalPnl;
      stats.cumulativePnl = cumulative;
      if (stats.count > 0) {
        stats.winRate = (stats.winCount / stats.count) * 100;
      }
    });

    return statsArray;
  }, [positions, periodType]);

  // 툴팁 렌더 함수
  const renderTooltipContent = (_: any[], label?: string) => {  // intentional-any: Recharts 호환
    const data = periodStats.find(s => s.period === label);
    if (!data) return null;
    
    return (
      <>
        <p style={{ margin: 0, color: '#fff' }}><strong>{label}</strong></p>
        <p style={{ margin: 0, color: '#888' }}>{t('widgets.tradeCountValue', { count: data.count })}</p>
        <p style={{ margin: 0, color: data.totalPnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {t('widgets.periodPnlValue', { value: formatCurrency(new Decimal(data.totalPnl), activeAccount?.currency) })}
        </p>
        <p style={{ margin: 0, color: data.cumulativePnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {t('widgets.cumulativePnlValue', { value: formatCurrency(new Decimal(data.cumulativePnl), activeAccount?.currency) })}
        </p>
        <p style={{ margin: 0, color: '#888' }}>{t('widgets.winRatePercent', { rate: data.winRate.toFixed(1) })}</p>
      </>
    );
  };

  const CustomTooltip = (props: any) => (  // intentional-any: Recharts props
    <ChartTooltip {...props} renderContent={renderTooltipContent} />
  );

  // 전체 통계
  const totalStats = useMemo(() => {
    const totalPnl = positions.reduce((sum, p) => 
      sum.plus(p.realizedPnl || new Decimal(0)), new Decimal(0)
    );
    const winCount = positions.filter(p => 
      p.realizedPnl && p.realizedPnl.greaterThan(0)
    ).length;
    const winRate = positions.length > 0 ? (winCount / positions.length) * 100 : 0;
    
    // 최고/최저 기간 찾기
    const bestPeriod = periodStats.length > 0 
      ? periodStats.reduce((best, current) => 
          current.totalPnl > best.totalPnl ? current : best, periodStats[0])
      : null;
    const worstPeriod = periodStats.length > 0
      ? periodStats.reduce((worst, current) => 
          current.totalPnl < worst.totalPnl ? current : worst, periodStats[0])
      : null;

    return { totalPnl, winRate, bestPeriod, worstPeriod };
  }, [positions, periodStats]);

  if (positions.length === 0) {
    return (
      <div className="analysis-widget-content">
        <Empty description={t('noPositions')} />
      </div>
    );
  }

  return (
    <div className="analysis-widget-content">
      <div style={{ marginBottom: 16 }}>
        <Radio.Group 
          value={periodType} 
          onChange={(e) => setPeriodType(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="daily">{t('widgets.daily')}</Radio.Button>
          <Radio.Button value="weekly">{t('widgets.weekly')}</Radio.Button>
          <Radio.Button value="monthly">{t('widgets.monthly')}</Radio.Button>
        </Radio.Group>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={t('widgets.overallPnl')}
              value={formatCurrency(totalStats.totalPnl, activeAccount?.currency)}
              valueStyle={{ 
                color: totalStats.totalPnl.greaterThan(0) ? '#3f8600' : '#cf1322' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={t('widgets.overallWinRate')}
              value={totalStats.winRate}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: totalStats.winRate >= 50 ? '#3f8600' : '#cf1322' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={periodType === 'daily' ? t('widgets.bestDay') : periodType === 'weekly' ? t('widgets.bestWeek') : t('widgets.bestMonth')}
              value={formatCurrency(new Decimal(totalStats.bestPeriod?.totalPnl || 0), activeAccount?.currency)}
              valueStyle={{ color: '#3f8600', fontSize: 16 }}
            />
            <div style={{ fontSize: 12, color: '#999' }}>
              {totalStats.bestPeriod?.period}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title={periodType === 'daily' ? t('widgets.worstDay') : periodType === 'weekly' ? t('widgets.worstWeek') : t('widgets.worstMonth')}
              value={formatCurrency(new Decimal(totalStats.worstPeriod?.totalPnl || 0), activeAccount?.currency)}
              valueStyle={{ color: '#cf1322', fontSize: 16 }}
            />
            <div style={{ fontSize: 12, color: '#999' }}>
              {totalStats.worstPeriod?.period}
            </div>
          </Card>
        </Col>
      </Row>

      <div className="analysis-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={periodStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="period" 
              stroke="#888"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#888" 
              tickFormatter={(value) => formatCurrency(new Decimal(value), activeAccount?.currency)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="cumulativePnl" 
              stroke="#1890ff" 
              strokeWidth={2}
              dot={{ fill: '#1890ff', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};