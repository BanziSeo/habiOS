import React from 'react';
import { Tooltip, theme, Typography } from 'antd';
import { type Dayjs } from 'dayjs';
import type { DailyData, CalendarSettings } from '../types';
import { formatPnL } from '../utils/formatters';
import { useTradingStore } from '../../../../stores/tradingStore';

const { Text } = Typography;

interface HeatmapViewProps {
  dailyData: Map<string, DailyData>;
  settings: CalendarSettings;
  currentDate: Dayjs;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  dailyData,
  settings,
  currentDate,
}) => {
  const { token } = theme.useToken();
  const { activeAccount } = useTradingStore();

  const getDateRange = (): Dayjs[] => {
    const dates: Dayjs[] = [];
    let weeksCount = 4;
    
    switch (settings.period) {
      case '1week':
        weeksCount = 1;
        break;
      case '2weeks':
        weeksCount = 2;
        break;
      case '4weeks':
        weeksCount = 4;
        break;
      case 'month':
        weeksCount = 5;
        break;
    }

    const startDate = currentDate.subtract(weeksCount, 'week').startOf('week');
    
    for (let week = 0; week < weeksCount; week++) {
      for (let day = 0; day < 7; day++) {
        dates.push(startDate.add(week * 7 + day, 'day'));
      }
    }
    
    return dates;
  };

  const getHeatmapColor = (pnl: number): string => {
    if (pnl === 0) return token.colorBgLayout;
    
    const maxPnl = Math.max(...Array.from(dailyData.values()).map(d => Math.abs(d.pnl)));
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1);
    
    if (pnl > 0) {
      // 수익 색상 그라데이션 (사용자 지정 색상 또는 기본값)
      const baseColor = settings.profitColor || token.colorSuccess;
      // HEX to RGBA with opacity
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.8})`;
    } else {
      // 손실 색상 그라데이션 (사용자 지정 색상 또는 기본값)
      const baseColor = settings.lossColor || token.colorError;
      // HEX to RGBA with opacity
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.8})`;
    }
  };

  const dates = getDateRange();
  const weeks: Dayjs[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isHorizontal = settings.heatmapDirection === 'horizontal';

  const renderCell = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const data = dailyData.get(dateStr);
    const pnl = data?.pnl || 0;
    
    return (
      <Tooltip
        key={dateStr}
        title={
          <div>
            <div>{date.format('MMM DD, YYYY')}</div>
            {data && (
              <>
                {settings.showPnL && (
                  <div>P&L: {formatPnL(pnl, settings.pnlDisplayMode || 'currency', activeAccount?.currency)}</div>
                )}
                {(settings.showPositionStats ?? settings.showTradeCount) && (
                  <>
                    {data.openedPositions > 0 && <div>Opened: {data.openedPositions}</div>}
                    {data.closedPositions > 0 && <div>Closed: {data.closedPositions}</div>}
                  </>
                )}
                {settings.showWinRate && data.tradeCount > 0 && (
                  <div>Win Rate: {data.winRate.toFixed(1)}%</div>
                )}
              </>
            )}
          </div>
        }
      >
        <div
          style={{
            width: isHorizontal ? 20 : '100%',
            height: isHorizontal ? '100%' : 20,
            background: data ? getHeatmapColor(pnl) : token.colorBgLayout,
            borderRadius: token.borderRadiusXS,
            border: `1px solid ${token.colorBorderSecondary}`,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = token.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </Tooltip>
    );
  };

  return (
    <div style={{ 
      padding: token.paddingSM,
      background: token.colorBgContainer,
      borderRadius: token.borderRadius,
      height: '100%',
      overflow: 'auto',
    }}>
      {isHorizontal ? (
        // 가로 방향 히트맵
        <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginXS }}>
          {weekDays.map((day, dayIndex) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Text style={{ 
                fontSize: token.fontSizeSM - 2,
                color: token.colorTextTertiary,
                width: 30,
              }}>
                {day}
              </Text>
              <div style={{ display: 'flex', gap: 4, flex: 1, height: 20 }}>
                {weeks.map((week) => renderCell(week[dayIndex]))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 세로 방향 히트맵 (기존)
        <div style={{ display: 'flex', gap: token.marginXS }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-around',
            marginRight: token.marginXS,
          }}>
            {weekDays.map(day => (
              <Text 
                key={day} 
                style={{ 
                  fontSize: token.fontSizeSM - 2,
                  color: token.colorTextTertiary,
                  height: 20,
                  lineHeight: '20px',
                }}
              >
                {day}
              </Text>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                {week.map(date => renderCell(date))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ 
        marginTop: token.marginMD,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
          {dates[0]?.format('MMM D')} - {dates[dates.length - 1]?.format('MMM D, YYYY')}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS }}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
            Less
          </Text>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
              <div
                key={intensity}
                style={{
                  width: 12,
                  height: 12,
                  background: `rgba(${parseInt((settings.profitColor || token.colorSuccess).slice(1, 3), 16)}, ${parseInt((settings.profitColor || token.colorSuccess).slice(3, 5), 16)}, ${parseInt((settings.profitColor || token.colorSuccess).slice(5, 7), 16)}, ${0.2 + intensity * 0.6})`,
                  borderRadius: token.borderRadiusXS,
                }}
              />
            ))}
          </div>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}>
            More
          </Text>
        </div>
      </div>
    </div>
  );
};