import React, { useState, useEffect } from 'react';
import { Button, Popover, theme, Space } from 'antd';
import { SettingOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { CalendarWidgetProps, CalendarSettings } from './types';
import { useDailyData } from './hooks/useDailyData';
import { SettingsPopover } from './components/SettingsPopover';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { HeatmapView } from './views/HeatmapView';

const STORAGE_KEY_PREFIX = 'calendarWidget_settings_';

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  widgetId,
  positions,
}) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();

  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 위젯별 설정을 localStorage에서 불러오기
  const [settings, setSettings] = useState<CalendarSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${widgetId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse calendar settings:', e);
      }
    }
    return {
      viewMode: 'month',
      period: '4weeks',
      showPnL: true,
      showTradeCount: true,
      showWinRate: false,
      showVolume: false,
    };
  });

  // 설정 변경시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${widgetId}`, JSON.stringify(settings));
  }, [settings, widgetId]);

  const dailyData = useDailyData(positions);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const amount = settings.period === '1week' ? 1 : 
                   settings.period === '2weeks' ? 2 : 
                   settings.period === '4weeks' ? 4 : 1;
    
    if (settings.viewMode === 'month') {
      setCurrentDate(direction === 'prev' 
        ? currentDate.subtract(1, 'month')
        : currentDate.add(1, 'month')
      );
    } else {
      setCurrentDate(direction === 'prev'
        ? currentDate.subtract(amount, 'week')
        : currentDate.add(amount, 'week')
      );
    }
  };

  const renderView = () => {
    switch (settings.viewMode) {
      case 'week':
        return (
          <WeekView
            dailyData={dailyData}
            settings={settings}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        );
      case 'heatmap':
        return (
          <HeatmapView
            dailyData={dailyData}
            settings={settings}
            currentDate={currentDate}
          />
        );
      case 'month':
      default:
        return (
          <MonthView
            dailyData={dailyData}
            settings={settings}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        );
    }
  };

  const getNavigationLabel = () => {
    if (settings.viewMode === 'month') {
      return currentDate.format('MMMM YYYY');
    } else if (settings.viewMode === 'heatmap') {
      const weeks = settings.period === '1week' ? 1 :
                   settings.period === '2weeks' ? 2 :
                   settings.period === '4weeks' ? 4 : 5;
      return t('calendar.lastWeeks', `Last ${weeks} weeks`);
    } else {
      const weekStart = currentDate.startOf('week');
      const weekEnd = weekStart.add(
        settings.period === '1week' ? 6 :
        settings.period === '2weeks' ? 13 :
        settings.period === '4weeks' ? 27 : 6,
        'day'
      );
      return `${weekStart.format('MMM DD')} - ${weekEnd.format('MMM DD, YYYY')}`;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      position: 'relative',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: token.marginMD,
      }}>
        <Space>
          <Button
            type="text"
            size="small"
            icon={<LeftOutlined />}
            onClick={() => handleNavigate('prev')}
          />
          <span style={{ 
            fontSize: token.fontSize,
            fontWeight: token.fontWeightStrong,
            minWidth: 150,
            textAlign: 'center',
            display: 'inline-block',
          }}>
            {getNavigationLabel()}
          </span>
          <Button
            type="text"
            size="small"
            icon={<RightOutlined />}
            onClick={() => handleNavigate('next')}
          />
        </Space>
        
        <Popover
          content={
            <SettingsPopover
              settings={settings}
              onSettingsChange={setSettings}
            />
          }
          trigger="click"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          placement="bottomLeft"
          overlayStyle={{ zIndex: 1050 }}
        >
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined />}
          />
        </Popover>
      </div>

      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        minHeight: 0,
      }}>
        {renderView()}
      </div>
    </div>
  );
};