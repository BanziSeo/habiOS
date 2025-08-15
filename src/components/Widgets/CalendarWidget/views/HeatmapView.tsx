import React from 'react';
import { Tooltip, theme, Typography } from 'antd';
import { type Dayjs } from 'dayjs';
import type { DailyData, CalendarSettings } from '../types';

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
      // 녹색 그라데이션
      const baseColor = token.colorSuccess;
      return `${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
    } else {
      // 빨간색 그라데이션
      const baseColor = token.colorError;
      return `${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
    }
  };

  const dates = getDateRange();
  const weeks: Dayjs[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ 
      padding: token.paddingSM,
      background: token.colorBgContainer,
      borderRadius: token.borderRadius,
      height: '100%',
      overflow: 'auto',
    }}>
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
              {week.map((date) => {
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
                              <div>P&L: {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}</div>
                            )}
                            {settings.showTradeCount && (
                              <div>Trades: {data.tradeCount}</div>
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
                        width: '100%',
                        height: 20,
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
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ 
        marginTop: token.marginMD,
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXS,
      }}>
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
                background: `${token.colorSuccess}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`,
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
  );
};