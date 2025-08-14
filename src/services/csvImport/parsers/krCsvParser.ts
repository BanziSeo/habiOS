import Papa from 'papaparse';
import type { CSVImportRow } from '../types';
import { CSV_ENCODING } from '../constants';

/**
 * 한국장 CSV 파일 읽기 및 파싱 (키움증권 포맷)
 */
export async function parseKRCSVFile(file: File): Promise<CSVImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = processKRCSVData(results.data as string[][]);
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
 * 키움증권 CSV 데이터 처리
 * 키움 거래내역 포맷: 홀수줄(주문정보), 짝수줄(체결정보)
 */
function processKRCSVData(data: string[][]): CSVImportRow[] {
  const trades: CSVImportRow[] = [];
  
  // 첫 번째 줄은 헤더1 (인덱스 0): 주식채권, 주문번호...
  // 두 번째 줄은 헤더2 (인덱스 1): 주문일자, 종목명...
  // 세 번째 줄부터 실제 데이터 시작 (인덱스 2)
  for (let i = 2; i < data.length; i += 2) {
    // 홀수 줄: 주식, 주문번호, 원주문번호, 종목번호, 매매구분, 주문유형구분 등
    // 짝수 줄: 주문일자, 종목명, 접수구분, 신용거래구분, 체결수량, 체결평균단가 등
    if (i + 1 >= data.length) break;
    
    const firstLine = data[i];
    const secondLine = data[i + 1];
    
    if (!firstLine || !secondLine) continue;
    if (!firstLine[0] || !secondLine[0]) continue; // 빈 줄 스킵
    
    // 체결수량 확인 - 빈 문자열이거나 0인 경우 스킵 (체결되지 않은 주문)
    const 체결수량 = secondLine[4];
    
    if (!체결수량 || 체결수량 === "" || 체결수량 === "0") {
      continue;
    }
    
    // 종목번호 추출 (따옴표 제거)
    // 예: '475150 -> 475150
    const tickerRaw = firstLine[3];
    const ticker = tickerRaw ? tickerRaw.replace(/'/g, '') : '';
    
    // 매매구분 파싱
    // "현금매수", "현금매도", "현금매수 K", "현금매도 K" 등
    const 매매구분원본 = firstLine[5];
    let 매매구분: '매수' | '매도';
    
    if (매매구분원본.includes('매수')) {
      매매구분 = '매수';
    } else if (매매구분원본.includes('매도')) {
      매매구분 = '매도';
    } else {
      // 예상치 못한 매매구분인 경우 스킵
      console.warn(`알 수 없는 매매구분: ${매매구분원본} (데이터 줄 ${i - 1}/${i})`);
      continue;
    }
    
    // 체결평균단가 정제 (쉼표, 따옴표 제거)
    const 체결평균단가 = secondLine[5].replace(/[,"]/g, '');
    
    // 체결금액 계산 (체결수량 × 체결평균단가)
    // 체결수량에서 쉼표와 따옴표 제거
    const 체결수량정제 = 체결수량.replace(/[,"]/g, '');
    const 체결수량숫자 = parseInt(체결수량정제, 10);
    
    // 체결수량이 유효한 숫자인지 확인
    if (isNaN(체결수량숫자) || 체결수량숫자 <= 0) {
      console.warn(`유효하지 않은 체결수량: ${체결수량} (데이터 줄 ${i - 1}/${i})`);
      continue;
    }
    
    const 체결평균단가숫자 = parseFloat(체결평균단가);
    
    // 체결평균단가가 유효한 숫자인지 확인
    if (isNaN(체결평균단가숫자) || 체결평균단가숫자 <= 0) {
      console.warn(`유효하지 않은 체결평균단가: ${secondLine[5]} (데이터 줄 ${i - 1}/${i})`);
      continue;
    }
    
    const 체결금액 = (체결수량숫자 * 체결평균단가숫자).toString();
    
    // 체결시간
    const 체결시간 = secondLine[9] || '00:00:00'; // 체결시간이 없는 경우 기본값
    
    // 주문일자 포맷 변경 (2025/08/01 -> 2025-08-01)
    const 주문일자 = secondLine[0].replace(/\//g, '-');
    
    const trade: CSVImportRow = {
      거래일자: 주문일자,
      종목코드: ticker,
      종목명: secondLine[1],
      매매구분: 매매구분,
      체결수량: 체결수량숫자.toString(),
      체결단가: 체결평균단가,
      체결금액: 체결금액,
      체결시간: 체결시간
    };
    
    trades.push(trade);
  }
  
  return trades;
}