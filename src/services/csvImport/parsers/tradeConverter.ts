import { Decimal } from 'decimal.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { Trade } from '../../../types';
import type { CSVImportRow } from '../types';
import { DATE_FORMAT, ID_DATE_FORMAT } from '../constants';
import { convertHeroicTimeToActualTime } from '../../../utils/heroicTimeConverter';

dayjs.extend(customParseFormat);

/**
 * CSV 데이터를 Trade 객체로 변환
 */
export function convertToTrades(csvRows: CSVImportRow[], accountId: string, accountType?: 'US' | 'KR'): Trade[] {
  // ID 중복 체크를 위한 맵
  const idCountMap = new Map<string, number>();
  
  return csvRows.map((row) => {
    // 날짜와 시간 파싱
    const tradeDate = dayjs(row.거래일자, DATE_FORMAT);
    
    // 영웅문 시간을 실제 시간으로 변환
    // brokerDate/brokerTime은 영웅문 표기 그대로 저장하고
    // tradeDate는 실제 시간으로 변환하여 저장
    const actualDateTime = convertHeroicTimeToActualTime(row.거래일자, row.체결시간);
    const tradeDateToUse = actualDateTime || tradeDate.toDate(); // 변환 실패 시 fallback
    
    // 체결수량과 체결단가 파싱
    const quantity = parseInt(row.체결수량.replace(/,/g, ''), 10);
    const price = new Decimal(row.체결단가.replace(/,/g, ''));
    
    // Trade ID 생성: ACCOUNTID_YYYYMMDD_HHMMSS_TICKER_BUY/SELL
    // accountId를 prefix로 추가하여 계정별 고유성 보장
    const tradeType = row.매매구분 === '매수' ? 'BUY' : 'SELL';
    const baseId = `${accountId}_${tradeDate.format(ID_DATE_FORMAT)}_${row.체결시간?.replace(/:/g, '')}_${row.종목코드}_${tradeType}`;
    
    // 중복 체크 및 순번 추가
    const count = idCountMap.get(baseId) || 0;
    idCountMap.set(baseId, count + 1);
    const id = count > 0 ? `${baseId}_${count}` : baseId;
    
    // 한국 주식의 경우 티커에 .KS 추가 (야후 파이낸스용)
    let ticker = row.종목코드;
    if (accountType === 'KR' && ticker && !ticker.includes('.')) {
      ticker = `${ticker}.KS`;
    }
    
    const trade: Trade = {
      id,
      accountId,
      ticker: ticker,
      tickerName: row.종목명,
      tradeType: tradeType as 'BUY' | 'SELL',
      quantity,
      price,
      commission: new Decimal(0), // CSV에는 수수료 정보가 없음
      tradeDate: tradeDateToUse, // 실제 시간으로 변환된 날짜
      tradeTime: row.체결시간,
      brokerDate: row.거래일자, // 브로커 표기 날짜 (UI 표시용)
      brokerTime: row.체결시간, // 브로커 표기 시간 (UI 표시용)
      createdAt: new Date()
    };
    
    return trade;
  });
}