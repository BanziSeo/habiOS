import React from 'react';
import { Typography, theme, Tooltip } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { DailyData, CalendarSettings } from '../types';
import { formatPnL } from '../utils/formatters';
import { useTradingStore } from '../../../../stores/tradingStore';

const { Text } = Typography;

interface MonthViewProps {
  dailyData: Map<string, DailyData>;
  settings: CalendarSettings;
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  dailyData,
  settings,
  currentDate,
  onDateChange,
}) => {
  const { token } = theme.useToken();
  const { activeAccount } = useTradingStore();
  
  // 현재 달의 날짜들 가져오기
  const getMonthDays = (): Dayjs[] => {
    const monthStart = currentDate.startOf('month');
    const monthEnd = currentDate.endOf('month');
    const startWeek = monthStart.startOf('week');
    const endWeek = monthEnd.endOf('week');
    
    const days: Dayjs[] = [];
    let current = startWeek;
    
    while (current.isBefore(endWeek) || current.isSame(endWeek, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }
    
    return days;
  };

  const monthDays = getMonthDays();
  const weeks: Dayjs[][] = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7));
  }

  return (
    <div style={{ 
      padding: token.paddingMD,
      background: token.colorBgContainer,
      borderRadius: token.borderRadius,
      height: '100%',
      overflow: 'auto',
    }}>
      {/* 월 헤더 */}
      <div style={{ 
        fontSize: token.fontSizeLG,
        fontWeight: token.fontWeightStrong,
        color: token.colorText,
        marginBottom: token.marginMD,
        textAlign: 'center',
      }}>
        {currentDate.format('MMMM YYYY')}
      </div>

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

      {/* 달력 그리드 */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: token.marginXS,
          marginBottom: token.marginXS,
        }}>
          {week.map(date => {
            const dateStr = date.format('YYYY-MM-DD');
            const data = dailyData.get(dateStr);
            const isCurrentMonth = date.month() === currentDate.month();
            const isToday = date.isSame(dayjs(), 'day');
            const pnlColor = data && data.pnl > 0 ? (settings.profitColor || token.colorSuccess) : 
                            data && data.pnl < 0 ? (settings.lossColor || token.colorError) : 
                            token.colorTextSecondary;

            return (
              <Tooltip
                key={dateStr}
                title={isCurrentMonth ? (
                  data ? (
                    <>
                      {date.format('MMM DD, YYYY')}
                      {settings.showPnL && <><br/>P&L: {formatPnL(data.pnl, settings.pnlDisplayMode || 'currency', activeAccount?.currency)}</>}
                      {(settings.showPositionStats ?? settings.showTradeCount) && (
                        <>
                          {data.openedPositions > 0 && <><br/>Opened: {data.openedPositions}</>}
                          {data.closedPositions > 0 && <><br/>Closed: {data.closedPositions}</>}
                        </>
                      )}
                      {settings.showWinRate && data.closedPositions > 0 && <><br/>Win Rate: {data.winRate.toFixed(1)}%</>}
                    </>
                  ) : (
                    date.format('MMM DD, YYYY')
                  )
                ) : null}
              >
                <div
                  onClick={() => isCurrentMonth && onDateChange(date)}
                  style={{
                    padding: token.paddingXS,
                    background: !isCurrentMonth ? token.colorBgLayout :
                               data && data.pnl !== 0 ? 
                                 (data.pnl > 0 ? 
                                   `${settings.profitColor || token.colorSuccess}20` : 
                                   `${settings.lossColor || token.colorError}20`) :
                               token.colorBgContainer,
                    border: `1px solid ${isToday ? token.colorPrimary : token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusSM,
                    cursor: isCurrentMonth ? 'pointer' : 'default',
                    minHeight: 60,
                    opacity: isCurrentMonth ? 1 : 0.4,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (isCurrentMonth) {
                      e.currentTarget.style.boxShadow = token.boxShadow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    fontSize: token.fontSize,
                    fontWeight: isToday ? token.fontWeightStrong : 'normal',
                    color: isCurrentMonth ? token.colorText : token.colorTextTertiary,
                    marginBottom: 2,
                  }}>
                    {date.format('D')}
                  </div>
                  
                  {data && isCurrentMonth && (
                    <>
                      {settings.showPnL && (
                        <Text style={{ 
                          display: 'block',
                          fontSize: token.fontSizeSM,
                          fontWeight: token.fontWeightStrong,
                          color: pnlColor,
                        }}>
                          {formatPnL(data.pnl, settings.pnlDisplayMode || 'currency', activeAccount?.currency)}
                        </Text>
                      )}
                      {settings.showTradeCount && (
                        <Text style={{ 
                          display: 'block',
                          fontSize: 10,
                          color: token.colorTextSecondary,
                        }}>
                          {data.tradeCount}t
                        </Text>
                      )}
                    </>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
};