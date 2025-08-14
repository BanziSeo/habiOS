import { Decimal } from 'decimal.js';

/**
 * 필드 매핑 정의
 * DB (snake_case) <-> Frontend (camelCase) 간의 명시적 매핑
 * 
 * 이 매핑 테이블은 데이터 흐름의 핵심입니다.
 * 새로운 필드 추가 시 반드시 여기에 매핑을 추가해야 합니다.
 */
export const FIELD_MAPPINGS = {
  // Position 필드 매핑
  position: {
    // DB -> Frontend
    toFrontend: {
      'id': 'id',
      'account_id': 'accountId',
      'ticker': 'ticker',
      'ticker_name': 'tickerName',
      'status': 'status',
      'open_date': 'openDate',
      'close_date': 'closeDate',
      'avg_buy_price': 'avgBuyPrice',
      'total_shares': 'totalShares',
      'max_shares': 'maxShares',
      'realized_pnl': 'realizedPnl',
      'max_risk_amount': 'maxRiskAmount',
      'setup_type': 'setupType',
      'entry_time': 'entryTime',
      'rating': 'rating',
      'memo': 'memo',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    },
    // Frontend -> DB
    toDB: {
      'id': 'id',
      'accountId': 'account_id',
      'ticker': 'ticker',
      'tickerName': 'ticker_name',
      'status': 'status',
      'openDate': 'open_date',
      'closeDate': 'close_date',
      'avgBuyPrice': 'avg_buy_price',
      'totalShares': 'total_shares',
      'maxShares': 'max_shares',
      'realizedPnl': 'realized_pnl',
      'maxRiskAmount': 'max_risk_amount',
      'setupType': 'setup_type',
      'entryTime': 'entry_time',
      'rating': 'rating',
      'memo': 'memo',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    }
  },
  
  // Trade 필드 매핑
  trade: {
    // DB -> Frontend
    toFrontend: {
      'id': 'id',
      'account_id': 'accountId',
      'position_id': 'positionId',
      'ticker': 'ticker',
      'trade_type': 'tradeType',
      'price': 'price',
      'quantity': 'quantity',
      'total': 'total',
      'trade_date': 'tradeDate',
      'broker_date': 'brokerDate',
      'broker_time': 'brokerTime',
      'created_at': 'createdAt',
      'note': 'note'
    },
    // Frontend -> DB
    toDB: {
      'id': 'id',
      'accountId': 'account_id',
      'positionId': 'position_id',
      'ticker': 'ticker',
      'tradeType': 'trade_type',
      'price': 'price',
      'quantity': 'quantity',
      'total': 'total',
      'tradeDate': 'trade_date',
      'brokerDate': 'broker_date',
      'brokerTime': 'broker_time',
      'createdAt': 'created_at',
      'note': 'note'
    }
  },
  
  // StopLoss 필드 매핑
  stopLoss: {
    // DB -> Frontend
    toFrontend: {
      'id': 'id',
      'position_id': 'positionId',
      'stop_price': 'stopPrice',
      'stop_quantity': 'stopQuantity',
      'stop_percentage': 'stopPercentage',
      'is_active': 'isActive',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt'
    },
    // Frontend -> DB
    toDB: {
      'id': 'id',
      'positionId': 'position_id',
      'stopPrice': 'stop_price',
      'stopQuantity': 'stop_quantity',
      'stopPercentage': 'stop_percentage',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    }
  }
} as const;

/**
 * 타입 변환 규칙
 * 각 필드의 타입 변환 방법을 정의
 */
export const TYPE_CONVERTERS = {
  // DB -> Frontend 변환
  toFrontend: {
    date: (value: unknown) => value ? new Date(value as string | number | Date) : undefined,
    decimal: (value: unknown) => value ? new Decimal(value as string | number) : new Decimal(0),
    boolean: (value: unknown) => value === 1,
    tradeType: (value: string) => {
      // SHORT/COVER를 SELL로 매핑
      if (value === 'SHORT' || value === 'COVER') return 'SELL';
      return value as 'BUY' | 'SELL';
    }
  },
  // Frontend -> DB 변환
  toDB: {
    date: (value: Date | undefined) => value ? value.toISOString() : null,
    decimal: (value: Decimal) => value.toString(),
    boolean: (value: boolean) => value ? 1 : 0,
    tradeType: (value: string): 'BUY' | 'SELL' => value as 'BUY' | 'SELL' // 타입 캐스팅
  }
};