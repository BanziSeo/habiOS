import { z } from 'zod';
import type { TFunction } from 'i18next';

// CSV 거래 데이터 스키마 생성 함수
export const getCsvTradeSchema = (t?: TFunction) => z.object({
  주문일자: z.string().min(1, t ? t('messages:validation.orderDateRequired') : '주문일자는 필수입니다'),
  주문시간: z.string().min(1, t ? t('messages:validation.orderTimeRequired') : '주문시간은 필수입니다'),
  종목명: z.string().min(1, t ? t('messages:validation.symbolRequired') : '종목명은 필수입니다'),
  매도수: z.enum(['매수', '매도'], { 
    errorMap: () => ({ message: t ? t('messages:validation.sideInvalid') : '매도수는 "매수" 또는 "매도"여야 합니다' })
  }),
  체결수량: z.string().transform((val) => {
    // 쉼표 제거
    const cleanedVal = val.replace(/,/g, '');
    const num = parseInt(cleanedVal, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error(t ? t('messages:validation.quantityPositive') : '체결수량은 양수여야 합니다');
    }
    return num;
  }),
  체결단가: z.string().transform((val) => {
    // 쉼표 제거
    const cleanedVal = val.replace(/,/g, '');
    const num = parseFloat(cleanedVal);
    if (isNaN(num) || num <= 0) {
      throw new Error(t ? t('messages:validation.pricePositive') : '체결단가는 양수여야 합니다');
    }
    return num;
  }),
  체결금액: z.string().transform((val) => {
    // 쉼표 제거
    const cleanedVal = val.replace(/,/g, '');
    const num = parseFloat(cleanedVal);
    if (isNaN(num) || num <= 0) {
      throw new Error(t ? t('messages:validation.amountPositive') : '체결금액은 양수여야 합니다');
    }
    return num;
  }),
});

// 호환성을 위한 기본 스키마 (t 없이)
export const CsvTradeSchema = getCsvTradeSchema();

// 포지션 데이터 스키마
export const PositionSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  ticker: z.string().min(1),
  status: z.enum(['ACTIVE', 'CLOSED']),
  openDate: z.date(),
  closeDate: z.date().optional(),
  avgBuyPrice: z.number().positive(),
  totalShares: z.number().int().nonnegative(),
  maxShares: z.number().int().positive(),
  realizedPnl: z.number(),
});

// 거래 데이터 스키마
export const TradeSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  positionId: z.string().min(1),
  ticker: z.string().min(1),
  tradeType: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  commission: z.number().nonnegative(),
  tradeDate: z.date(),
  tradeTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, '시간 형식은 HH:MM:SS여야 합니다'),
});

// 스탑로스 데이터 스키마
export const StopLossSchema = z.object({
  price: z.number().positive('스탑로스 가격은 양수여야 합니다'),
  quantity: z.number().int().positive('수량은 양수여야 합니다'),
  percentage: z.number().min(0).max(100, '비율은 0-100 사이여야 합니다'),
});

// CSV 임포트 요청 스키마
export const CsvImportRequestSchema = z.object({
  mode: z.enum(['APPEND', 'REPLACE']),
  currentTotalAssets: z.number().positive().optional(),
  accountId: z.string().min(1),
  trades: z.array(TradeSchema),
  positions: z.array(PositionSchema),
});

// 설정 스키마
export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  defaultCurrency: z.enum(['USD', 'KRW']),
  commissionRates: z.object({
    buy: z.number().min(0).max(1),
    sell: z.number().min(0).max(1),
  }),
});

// 타입 추출
export type CsvTrade = z.infer<typeof CsvTradeSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Trade = z.infer<typeof TradeSchema>;
export type StopLoss = z.infer<typeof StopLossSchema>;
export type CsvImportRequest = z.infer<typeof CsvImportRequestSchema>;
export type Settings = z.infer<typeof SettingsSchema>;