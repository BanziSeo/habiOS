// 수수료율
export const DEFAULT_BUY_COMMISSION_RATE = 0.0007;
export const DEFAULT_SELL_COMMISSION_RATE = 0.0007;

// 애프터마켓 시작 시간
export const AFTERMARKET_START_HOUR = 0;
export const AFTERMARKET_END_HOUR = 8;

// CSV 파싱 설정
export const CSV_ENCODING = 'EUC-KR';
export const CSV_HEADER_SKIP_LINES = 3; // 첫 3줄은 헤더

// 날짜/시간 포맷
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const ID_DATE_FORMAT = 'YYYYMMDD';
export const ID_TIME_FORMAT = 'HHmmss';

// Trade ID 포맷
export const TRADE_ID_FORMAT = '${date}_${time}_${ticker}_${type}';
export const POSITION_ID_FORMAT = '${date}_${time}_${ticker}';