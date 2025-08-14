import React, { useMemo } from 'react';
import { Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import type { Position, Account } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { ChartTooltip } from '../../../components/Common/ChartTooltip';

interface TimeAnalysisWidgetProps {
  positions: Position[];
  activeAccount?: Account;
}

interface TimeSlotStats {
  hour: string;
  count: number;
  totalPnl: number;
  winCount: number;
}

export const TimeAnalysisWidget: React.FC<TimeAnalysisWidgetProps> = ({ positions, activeAccount }) => {
  const { t } = useTranslation('analysis');
  const timeSlotStats = useMemo(() => {
    const statsMap = new Map<string, TimeSlotStats>();
    
    // 22:30부터 05:30까지의 시간대 초기화
    const hours = [
      '22:30', '23:30', '00:30', '01:30', '02:30', '03:30', '04:30', '05:30'
    ];
    
    hours.forEach(hour => {
      statsMap.set(hour, {
        hour,
        count: 0,
        totalPnl: 0,
        winCount: 0,
      });
    });

    // 포지션별로 시간대 통계 계산
    positions.forEach(position => {
      // entry_time이 없으면 첫 거래 시간 사용
      let entryTime = position.entryTime;
      if (!entryTime && position.trades && position.trades.length > 0) {
        entryTime = position.trades[0].tradeDate;
      }
      
      if (!entryTime) return;
      
      const time = dayjs(entryTime);
      const hour = time.hour();
      const minute = time.minute();
      
      // 시간대 결정 (30분 단위로 반올림)
      let timeSlot: string;
      if (hour >= 22) {
        // 22:30 또는 23:30
        timeSlot = minute < 30 ? '22:30' : '23:30';
      } else if (hour <= 5) {
        // 00:30 ~ 05:30
        timeSlot = minute < 30 ? 
          `${String(hour).padStart(2, '0')}:30` : 
          `${String((hour + 1) % 24).padStart(2, '0')}:30`;
      } else {
        // 장 시간 외
        return;
      }
      
      const stats = statsMap.get(timeSlot);
      if (stats) {
        stats.count++;
        const pnl = position.realizedPnl || new Decimal(0);
        stats.totalPnl += pnl.toNumber();
        if (pnl.greaterThan(0)) {
          stats.winCount++;
        }
      }
    });

    return Array.from(statsMap.values());
  }, [positions]);

  // 툴팁 렌더 함수
  const renderTooltipContent = (payload: any[], label?: string) => {  // intentional-any: Recharts 호환
    const data = payload[0].payload;
    return (
      <>
        <p style={{ margin: 0, color: '#fff' }}>{t('widgets.timeSlotCount', { label, count: data.count })}</p>
        <p style={{ margin: 0, color: data.totalPnl >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatCurrency(new Decimal(data.totalPnl), activeAccount?.currency)}
        </p>
        {data.count > 0 && (
          <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
            {t('widgets.winRatePercent', { rate: ((data.winCount / data.count) * 100).toFixed(1) })}
          </p>
        )}
      </>
    );
  };

  const CustomTooltip = (props: any) => (  // intentional-any: Recharts props
    <ChartTooltip {...props} renderContent={renderTooltipContent} />
  );

  if (positions.length === 0) {
    return <Empty description={t('noPositions')} />;
  }

  return (
    <div className="analysis-widget-content">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={timeSlotStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="hour" stroke="#888" />
          <YAxis 
            stroke="#888" 
            tickFormatter={(value) => formatCurrency(new Decimal(value), activeAccount?.currency)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalPnl" radius={[8, 8, 0, 0]}>
            {timeSlotStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? '#52c41a' : '#ff4d4f'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};