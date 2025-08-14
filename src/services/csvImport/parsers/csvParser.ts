import type { CSVImportRow } from '../types';
import { parseUSCSVFile } from './usCsvParser';
import { parseKRCSVFile } from './krCsvParser';

/**
 * CSV 파일 파싱 라우터
 * 계정 타입에 따라 적절한 파서로 분기
 */
export async function parseCSVFile(file: File, accountType?: 'US' | 'KR'): Promise<CSVImportRow[]> {
  // accountType이 제공되지 않은 경우 기본값은 US (기존 동작 유지)
  const type = accountType || 'US';
  
  console.log('[CSV Parser Router] 계정 타입:', type);
  console.log('[CSV Parser Router] 파일명:', file.name);
  
  if (type === 'KR') {
    // 키움증권 한국장 CSV 파싱
    console.log('[CSV Parser Router] 한국장 파서 실행');
    return parseKRCSVFile(file);
  } else {
    // 영웅문 미국장 CSV 파싱
    console.log('[CSV Parser Router] 미국장 파서 실행');
    return parseUSCSVFile(file);
  }
}