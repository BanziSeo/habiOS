import React from 'react';
import { Typography, theme, Tooltip } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { DailyData, CalendarSettings } from '../types';

const { Text } = Typography;

interface WeekViewProps {
  dailyData: Map<string, DailyData>;
  settings: CalendarSettings;
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  dailyData,
  settings,
  currentDate,
  onDateChange,
}) => {
  const { token } = theme.useToken();

  const getWeekDays = (): Dayjs[] => {
    const weekStart = currentDate.startOf('week');
    const days: Dayjs[] = [];
    
    const numWeeks = settings.period === '1week' ? 1 :
                    settings.period === '2weeks' ? 2 :
                    settings.period === '4weeks' ? 4 : 1;
    
    for (let week = 0; week < numWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        days.push(weekStart.add(week * 7 + day, 'day'));
      }
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const weeks: Dayjs[][] = [];
  for (let i = 0; i < weekDays.length; i += 7) {
    weeks.push(weekDays.slice(i, i + 7));
  }

  return (
    <div style={{ 
      padding: token.paddingMD,
      background: token.colorBgContainer,
      borderRadius: token.borderRadius,
      height: '100%',
      overflow: 'auto',
    }}>
      {/* 요일 헤더 */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: token.marginXS,
        marginBottom: token.marginMD,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        paddingBottom: token.paddingXS,
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={{ 
            textAlign: 'center',
            fontSize: token.fontSize,
            fontWeight: token.fontWeightStrong,
            color: token.colorTextLabel,
          }}>
            {day}
          </Text>
        ))}
      </div>

      {/* 주간 달력 */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} style={{ marginBottom: token.marginMD }}>
          {weekIndex > 0 && (
            <div style={{ 
              fontSize: token.fontSizeSM,
              color: token.colorTextTertiary,
              marginBottom: token.marginXS,
            }}>
              Week {weekIndex + 1}
            </div>
          )}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: token.marginXS,
          }}>
            {week.map(date => {
              const dateStr = date.format('YYYY-MM-DD');
              const data = dailyData.get(dateStr);
              const isToday = date.isSame(dayjs(), 'day');
              const pnlColor = data && data.pnl > 0 ? token.colorSuccess : 
                              data && data.pnl < 0 ? token.colorError : 
                              token.colorTextSecondary;

              return (
                <Tooltip
                  key={dateStr}
                  title={data ? (
                    <>
                      {date.format('MMM DD, YYYY')}
                      {settings.showPnL && <><br/>P&L: ${data.pnl.toFixed(2)}</>}
                      {settings.showTradeCount && <><br/>Trades: {data.tradeCount}</>}
                      {settings.showWinRate && data.tradeCount > 0 && <><br/>Win Rate: {data.winRate.toFixed(1)}%</>}
                    </>
                  ) : (
                    date.format('MMM DD, YYYY')
                  )}
                >
                  <div
                    onClick={() => onDateChange(date)}
                    style={{
                      padding: token.paddingSM,
                      background: data && data.pnl > 0 ? token.colorSuccessBg :
                                 data && data.pnl < 0 ? token.colorErrorBg :
                                 token.colorBgLayout,
                      border: `1px solid ${isToday ? token.colorPrimary : token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusSM,
                      cursor: 'pointer',
                      minHeight: 80,
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = token.boxShadow;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      fontSize: token.fontSize,
                      fontWeight: isToday ? token.fontWeightStrong : 'normal',
                      color: token.colorText,
                      marginBottom: token.marginXS,
                    }}>
                      {date.format('D')}
                    </div>
                    
                    {data && (
                      <>
                        {settings.showPnL && (
                          <Text style={{ 
                            display: 'block',
                            fontSize: token.fontSize,
                            fontWeight: token.fontWeightStrong,
                            color: pnlColor,
                          }}>
                            {data.pnl > 0 ? '+' : ''}{data.pnl.toFixed(0)}
                          </Text>
                        )}
                        {settings.showTradeCount && (
                          <Text style={{ 
                            display: 'block',
                            fontSize: token.fontSizeSM,
                            color: token.colorTextSecondary,
                          }}>
                            {data.tradeCount} trades
                          </Text>
                        )}
                        {settings.showWinRate && data.tradeCount > 0 && (
                          <Text style={{
                            display: 'block',
                            fontSize: token.fontSizeSM,
                            color: data.winRate >= 50 ? token.colorSuccess : token.colorError,
                          }}>
                            {data.winRate.toFixed(0)}%
                          </Text>
                        )}
                      </>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};