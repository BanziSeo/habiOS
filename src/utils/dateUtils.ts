import dayjs from 'dayjs';

/**
 * 선택한 날짜의 시작과 끝 시간을 반환
 */
export const getDateRange = (selectedDate: dayjs.Dayjs) => {
  return {
    startOfDay: selectedDate.startOf('day').toDate(),
    endOfDay: selectedDate.endOf('day').toDate(),
  };
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return dayjs(date1).isSame(date2, 'day');
};

/**
 * 날짜가 특정 범위 내에 있는지 확인
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * 오늘 날짜인지 확인
 */
export const isToday = (date: Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};