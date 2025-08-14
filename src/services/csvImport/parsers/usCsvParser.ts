import Papa from 'papaparse';
import { z } from 'zod';
import { CsvTradeSchema } from '../../../utils/validation/schemas';
import type { CSVImportRow } from '../types';
import { CSV_ENCODING, CSV_HEADER_SKIP_LINES } from '../constants';

/**
 * 미국장 CSV 파일 읽기 및 파싱 (영웅문 포맷)
 */
export async function parseUSCSVFile(file: File): Promise<CSVImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      Papa.parse(text, {
        header: false, // 헤더를 수동으로 처리
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = processUSCSVData(results.data as string[][]);
            resolve(rows);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: unknown) => {
          reject(error);
        }
      });
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    // EUC-KR 인코딩으로 읽기
    reader.readAsText(file, CSV_ENCODING);
  });
}

/**
 * 영웅문 미국장 CSV 데이터 처리
 * 영웅문 거래내역 포맷: 홀수줄(날짜, 통화, 종목코드 등), 짝수줄(시간, 거래소, 종목명, 매수/매도 등)
 */
function processUSCSVData(data: string[][]): CSVImportRow[] {
  const trades: CSVImportRow[] = [];
  
  // 첫 번째 줄은 Version 정보이므로 스킵
  // 두 번째, 세 번째 줄은 헤더이므로 스킵
  for (let i = CSV_HEADER_SKIP_LINES; i < data.length; i += 2) {
    // 홀수 줄: 날짜, 통화, 종목코드 등
    // 짝수 줄: 시간, 거래소, 종목명, 매수/매도 등
    if (i + 1 >= data.length) break;
    
    const firstLine = data[i];
    const secondLine = data[i + 1];
    
    if (!firstLine[0] || !secondLine[0]) continue; // 빈 줄 스킵
    
    // 종목코드 추출 (작은따옴표 제거)
    const tickerRaw = firstLine[2];
    const ticker = tickerRaw ? tickerRaw.replace(/'/g, '') : '';
    
    // 체결수량이 0이거나 없는 경우 스킵
    const 체결수량 = firstLine[6];
    if (!체결수량 || 체결수량 === "0" || 체결수량.replace(/[\",]/g, '') === "0") {
      continue;
    }
    
    const rawTrade = {
      주문일자: firstLine[0],
      종목코드: ticker,
      종목명: secondLine[2],
      매도수: secondLine[3],
      체결수량: firstLine[6],
      체결단가: secondLine[6],
      체결금액: secondLine[9],
      주문시간: secondLine[0]
    };
    
    try {
      // Zod 스키마로 검증
      const validatedTrade = CsvTradeSchema.parse(rawTrade);
      
      const trade: CSVImportRow = {
        거래일자: rawTrade.주문일자,
        종목코드: ticker,
        종목명: validatedTrade.종목명,
        매매구분: validatedTrade.매도수 as '매수' | '매도',
        체결수량: validatedTrade.체결수량.toString(),
        체결단가: validatedTrade.체결단가.toString(),
        체결금액: validatedTrade.체결금액.toString(),
        체결시간: validatedTrade.주문시간
      };
      
      trades.push(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`데이터 검증 실패 (줄 ${i + 1}): ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }
  
  return trades;
}