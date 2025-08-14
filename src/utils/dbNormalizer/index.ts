/**
 * 데이터베이스 정규화/비정규화 유틸리티
 * 
 * DB (snake_case) <-> Frontend (camelCase) 간의 데이터 변환을 담당합니다.
 * 모든 데이터는 이 모듈을 통해 변환되어야 합니다.
 */

// Constants
export { FIELD_MAPPINGS, TYPE_CONVERTERS } from './constants';

// Position normalizers
export {
  normalizePositionFromDB,
  denormalizePositionToDB,
  normalizePositionFromDTO,
  denormalizePositionToDTO
} from './normalizers/position';

// Trade normalizers
export {
  normalizeTradeFromDB,
  denormalizeTradeToDB,
  normalizeTradeFromDTO,
  denormalizeTradeToDTO
} from './normalizers/trade';

// StopLoss normalizers
export {
  normalizeStopLossFromDB,
  denormalizeStopLossToDB,
  normalizeStopLossFromDTO,
  denormalizeStopLossToDTO
} from './normalizers/stopLoss';

// Utility functions
export {
  normalizePositionsFromDB,
  normalizeTradesFromDB
} from './utils';