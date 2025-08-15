import React from 'react';
import { Button, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface DateSelectorProps {
  selectedDate: dayjs.Dayjs;
  onDateChange: (date: dayjs.Dayjs) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  const { t } = useTranslation('journal');
  const isToday = selectedDate.isSame(dayjs(), 'day');
  
  return (
    <>
      <Button
        type={isToday ? "text" : "link"}
        onClick={() => onDateChange(dayjs())}
        size="small"
        disabled={isToday}
        style={{ 
          minWidth: 60,
          opacity: isToday ? 0.3 : 1,
          cursor: isToday ? 'default' : 'pointer'
        }}
      >
        {t('header.dateSelector.today')}
      </Button>
      
      <Button
        icon={<LeftOutlined />}
        onClick={() => onDateChange(selectedDate.subtract(1, 'day'))}
        size="small"
      />
      
      <DatePicker
        value={selectedDate}
        onChange={(date) => date && onDateChange(date)}
        format="YYYY-MM-DD"
        size="small"
        style={{ width: 150 }}
        suffixIcon={<CalendarOutlined />}
        placeholder={t('header.dateSelector.selectDate')}
        disabledDate={(current) => current && current > dayjs().endOf('day')}
      />
      
      <Button
        icon={<RightOutlined />}
        onClick={() => onDateChange(selectedDate.add(1, 'day'))}
        disabled={isToday}
        size="small"
      />
    </>
  );
};