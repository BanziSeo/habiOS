import { Decimal } from 'decimal.js';
import type { StopLoss } from '../../../types';
import type { DBStopLossRow, StopLossDTO } from '../../../types/api';
import type { DBStopLoss } from '../../../types/database';
import type { DBStopLossInput, ExtendedStopLoss } from '../types';
import { TYPE_CONVERTERS } from '../constants';

/**
 * DB 스탑로스를 Frontend 스탑로스로 변환
 * 이전 버전과의 호환성을 위해 DBStopLoss 타입도 받을 수 있도록 함
 */
export function normalizeStopLossFromDB(dbStopLoss: (DBStopLoss | DBStopLossRow) & Partial<DBStopLossInput>): StopLoss {
  return {
    id: dbStopLoss.id,
    positionId: dbStopLoss.position_id,
    stopPrice: TYPE_CONVERTERS.toFrontend.decimal(dbStopLoss.stop_price),
    stopQuantity: dbStopLoss.stop_quantity || 0,
    stopPercentage: dbStopLoss.stop_percentage || 0,
    inputMode: dbStopLoss.input_mode || 'percentage',
    isActive: TYPE_CONVERTERS.toFrontend.boolean(dbStopLoss.is_active),
    createdAt: TYPE_CONVERTERS.toFrontend.date(dbStopLoss.created_at) || new Date()
  };
}

/**
 * Frontend 스탑로스를 DB 형식으로 변환
 */
export function denormalizeStopLossToDB(stopLoss: Partial<StopLoss>): DBStopLossInput {
  const dbData: DBStopLossInput = {};
  
  if (stopLoss.id !== undefined) dbData.id = stopLoss.id;
  if (stopLoss.positionId !== undefined) dbData.position_id = stopLoss.positionId;
  if (stopLoss.stopPrice !== undefined) dbData.stop_price = TYPE_CONVERTERS.toDB.decimal(stopLoss.stopPrice);
  if (stopLoss.stopQuantity !== undefined) dbData.stop_quantity = stopLoss.stopQuantity;
  if (stopLoss.stopPercentage !== undefined) dbData.stop_percentage = stopLoss.stopPercentage;
  if (stopLoss.inputMode !== undefined) dbData.input_mode = stopLoss.inputMode;
  if (stopLoss.isActive !== undefined) dbData.is_active = TYPE_CONVERTERS.toDB.boolean(stopLoss.isActive);
  
  return dbData;
}

/**
 * API DTO를 Frontend StopLoss로 변환
 * DTO는 이미 camelCase를 사용
 */
export function normalizeStopLossFromDTO(dto: StopLossDTO & Partial<ExtendedStopLoss>): StopLoss {
  return {
    id: dto.id,
    positionId: dto.positionId,
    stopPrice: new Decimal(dto.stopPrice),
    stopQuantity: dto.stopQuantity,
    stopPercentage: dto.stopPercentage,
    inputMode: dto.inputMode || 'percentage',
    isActive: dto.isActive,
    createdAt: dto.createdAt
  };
}

/**
 * Frontend StopLoss를 API DTO로 변환
 * DTO는 이미 camelCase를 사용
 */
export function denormalizeStopLossToDTO(stopLoss: StopLoss): Partial<StopLossDTO & ExtendedStopLoss> {
  const dto: Partial<StopLossDTO & ExtendedStopLoss> = {
    id: stopLoss.id,
    positionId: stopLoss.positionId,
    stopPrice: stopLoss.stopPrice.toNumber(),
    stopQuantity: stopLoss.stopQuantity,
    stopPercentage: stopLoss.stopPercentage,
    isActive: stopLoss.isActive,
    // ExtendedStopLoss 필드
    inputMode: stopLoss.inputMode
  };
  
  return dto;
}