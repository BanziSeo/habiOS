import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Trade, Position, Account, EquityCurveData, StopLoss } from '../types/index.js';
import { Decimal } from 'decimal.js';
import { useSettingsStore } from './settingsStore';
import { useMetricsStore } from './metricsStore';
import { notifyError, notifyDBError } from '../utils/errorNotification';
import { normalizePositionFromDB, normalizeTradeFromDB } from '../utils/dbNormalizer';
import i18n from '../i18n';

interface TradingStore {
  // 상태
  positions: Position[];
  trades: Trade[];
  accounts: Account[];
  activeAccount: Account | null;
  equityCurve: EquityCurveData[];
  isLoading: boolean;
  error: string | null;
  
  // 액션 - 포지션 관련
  loadPositions: (accountId?: string) => Promise<void>;
  updatePosition: (id: string, data: Partial<Position>) => Promise<void>;
  updateStopLosses: (positionId: string, stopLosses: StopLoss[], setAsInitialR?: boolean) => Promise<void>;
  
  // 액션 - 거래 관련
  loadTrades: (accountId?: string) => Promise<void>;
  
  // 액션 - 계정 관련
  setActiveAccount: (account: Account) => void;
  loadAccounts: () => Promise<Account[]>;
  
  // 액션 - Equity Curve 관련
  loadEquityCurve: (accountId?: string) => Promise<void>;
  
  // 액션 - CSV 임포트 관련
  importCSV: (data: {
    trades: Trade[];
    positions: Position[];
    importType: 'FULL' | 'APPEND';
    currentTotalAssets?: Decimal;
    equityCurveData?: EquityCurveData[];
  }) => Promise<{
    success: boolean;
    savedTradesCount: number;
    skippedTradesCount: number;
    savedPositionsCount: number;
    skippedPositionsCount: number;
  }>;
  
  // 액션 - 유틸리티
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTradingStore = create<TradingStore>()(
  devtools(
    immer((set, get) => ({
      // 초기 상태
      positions: [],
      trades: [],
      accounts: [],
      activeAccount: null,
      equityCurve: [],
      isLoading: false,
      error: null,
      
      // 포지션 로드
      loadPositions: async (accountId) => {
        const activeAcct = get().activeAccount;
        const account = accountId || activeAcct?.id;
        
        if (!account) {
          notifyError(i18n.t('messages:account.error'), i18n.t('messages:account.noActiveAccount'));
          set({ error: i18n.t('messages:account.noActiveAccountShort') });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const activePositions = await window.electronAPI.positions.getByAccount(account, 'ACTIVE');
          const closedPositions = await window.electronAPI.positions.getByAccount(account, 'CLOSED');
          
          const positions = [...activePositions, ...closedPositions].map(pos => {
            try {
              return normalizePositionFromDB(pos);
            } catch (error) {
              notifyError(i18n.t('messages:trading.dataProcessError'), `${i18n.t('common:position')} ${pos.ticker} ${i18n.t('common:processingError')}`);
              return null;
            }
          }).filter(pos => pos !== null);
          
          positions.sort((a, b) => {
            if (a.status === 'ACTIVE' && b.status === 'CLOSED') return -1;
            if (a.status === 'CLOSED' && b.status === 'ACTIVE') return 1;
            
            const aDate = a.status === 'CLOSED' ? a.closeDate! : a.openDate;
            const bDate = b.status === 'CLOSED' ? b.closeDate! : b.openDate;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
          
          set({ positions, isLoading: false });
        } catch (error) {
          notifyDBError(error);
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
        }
      },
      
      // 포지션 업데이트
      updatePosition: async (id, data) => {
        try {
          await window.electronAPI.positions.update(id, {
            setup_type: data.setupType,
            rating: data.rating,
            memo: data.memo,
          });
          
          set((state) => {
            const position = state.positions.find(pos => pos.id === id);
            if (position) {
              Object.assign(position, data);
            }
          });
        } catch (error) {
          throw error;
        }
      },

      // 스탑로스 업데이트
      updateStopLosses: async (positionId, stopLosses, setAsInitialR = false) => {
        try {
          await window.electronAPI.stopLoss.update(positionId, stopLosses.map(sl => ({
            stopPrice: sl.stopPrice.toNumber(),
            stopQuantity: sl.stopQuantity,
            stopPercentage: sl.stopPercentage,
            inputMode: sl.inputMode
          })));
          
          if (setAsInitialR && stopLosses.length > 0) {
            const position = get().positions.find(p => p.id === positionId);
            if (position) {
              const totalRisk = stopLosses.reduce((sum, sl) => {
                return sum.plus(sl.stopPrice.minus(position.avgBuyPrice).times(sl.stopQuantity).abs());
              }, new Decimal(0));
              await window.electronAPI.positions.updateInitialR(positionId, totalRisk.toNumber());
            }
          }
          
          const updatedPosition = await window.electronAPI.positions.getById(positionId);
          if (!updatedPosition) {
            return;
          }
          const normalizedPosition = normalizePositionFromDB(updatedPosition);
          
          set((state) => {
            const positionIndex = state.positions.findIndex(pos => pos.id === positionId);
            if (positionIndex !== -1) {
              state.positions[positionIndex] = normalizedPosition;
            }
          });
          
          const { calculateAndCachePositionMetrics } = useMetricsStore.getState();
          calculateAndCachePositionMetrics(normalizedPosition);
          
        } catch (error) {
          notifyError(i18n.t('messages:stopLoss.updateFailed'), error);
          set((state) => { state.error = i18n.t('messages:stopLoss.updateFailedMessage'); });
          throw error;
        }
      },
      
      // 거래 로드
      loadTrades: async (accountId) => {
        const accountIdToUse = accountId || get().activeAccount?.id;
        if (!accountIdToUse) return;
        
        try {
          const trades = await window.electronAPI.trades.getByAccount(accountIdToUse);
          
          const formattedTrades = trades.map((trade: { id: string; position_id: string; account_id: string; ticker: string; ticker_name: string; trade_type: 'BUY' | 'SELL'; quantity: number; price: string; commission: string; trade_date: string; trade_time?: string; broker_date?: string; broker_time?: string; created_at: string }) => normalizeTradeFromDB(trade));
          
          set({ trades: formattedTrades });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
      },
      
      setActiveAccount: (account) => {
        set({ activeAccount: account });
        if (account?.id) {
          localStorage.setItem('activeAccountId', account.id);
        } else {
          localStorage.removeItem('activeAccountId');
        }
      },
      
      // 계정 목록 로드
      loadAccounts: async () => {
        try {
          const accountsData = await window.electronAPI.account.getAll();
          const accounts = accountsData.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            accountType: acc.account_type || acc.accountType, // DB에서는 account_type, 프론트는 accountType
            currency: acc.currency,
            initialBalance: acc.initial_balance || acc.initialBalance || 0,
            createdAt: new Date(acc.created_at || acc.createdAt),
            updatedAt: new Date(acc.updated_at || acc.updatedAt)
          }));
          set({ accounts });
          return accounts;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' });
          return [];
        }
      },
      
      // Equity Curve 로드
      loadEquityCurve: async (accountId) => {
        const account = accountId || get().activeAccount?.id;
        if (!account) return;
        
        try {
          const data = await window.electronAPI.database.query(
            'SELECT * FROM equity_curve WHERE account_id = ? ORDER BY date ASC',
            [account]
          );
          
          const equityCurve = data.rows.map((row: { date: string; total_value: string; cash_value?: string; stock_value?: string; daily_pnl: string }) => {
            const typedRow = row as {
              date: string;
              total_value: string;
              cash_value?: string;
              stock_value?: string;
              daily_pnl: string;
            };
            return {
              date: new Date(typedRow.date),
              totalValue: new Decimal(typedRow.total_value || 0),
              cashValue: typedRow.cash_value ? new Decimal(typedRow.cash_value) : undefined,
              stockValue: typedRow.stock_value ? new Decimal(typedRow.stock_value) : undefined,
              dailyPnl: new Decimal(typedRow.daily_pnl || 0)
            };
          });
          
          set({ equityCurve });
          
          const { activeAccount: currentAccount } = get();
          
          if (equityCurve.length > 0) {
            const newTotalAssets = equityCurve[equityCurve.length - 1].totalValue;
            
            const { updateTotalAssets } = useMetricsStore.getState();
            updateTotalAssets(newTotalAssets.toNumber());
          } else if (currentAccount && currentAccount.initialBalance > 0) {
            const newTotalAssets = new Decimal(currentAccount.initialBalance);
            
            const { updateTotalAssets } = useMetricsStore.getState();
            updateTotalAssets(newTotalAssets.toNumber());
            const { positions, activeAccount } = get();
            
            if (positions.length > 0 && activeAccount) {
              const { calculateAndCacheAllMetrics } = useMetricsStore.getState();
              const { generalSettings } = useSettingsStore.getState();
              const accountCreatedDate = new Date(activeAccount.createdAt);
              
              calculateAndCacheAllMetrics(
                positions,
                newTotalAssets.toNumber(),
                accountCreatedDate,
                generalSettings.winRateThreshold || 0.05
              ).catch(() => {
              });
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
      },
      
      // CSV 임포트
      importCSV: async ({ trades, positions, importType, currentTotalAssets, equityCurveData }) => {
        set({ isLoading: true, error: null });
        
        try {
          const accountId = get().activeAccount?.id;
          if (!accountId) {
            throw new Error(i18n.t('messages:account.notSelected'));
          }
          
          const { generalSettings } = useSettingsStore.getState();
          const buyCommissionRate = generalSettings.buyCommissionRate || 0.0007;
          const sellCommissionRate = generalSettings.sellCommissionRate || 0.0007;
          
          // Serialized 타입 정의
          type SerializedTrade = Omit<Trade, 'price' | 'commission' | 'tradeDate' | 'createdAt'> & {
            price: string;
            commission: string;
            tradeDate: string;
            createdAt: string;
          };
          
          const serializedTrades = trades.map((trade) => {
            try {
              const serializedTrade: SerializedTrade = {
                ...trade,
                price: trade.price instanceof Decimal ? trade.price.toString() : String(trade.price),
                commission: trade.commission instanceof Decimal ? trade.commission.toString() : String(trade.commission),
                tradeDate: trade.tradeDate instanceof Date ? trade.tradeDate.toISOString() : String(trade.tradeDate),
                createdAt: trade.createdAt ? (trade.createdAt instanceof Date ? trade.createdAt.toISOString() : String(trade.createdAt)) : new Date().toISOString()
              };
              
              // Optional 필드는 undefined 그대로 유지 (타입 호환성)
              
              return serializedTrade;
            } catch (err) {
              throw err;
            }
          });
          
          // Serialized Position 타입 정의
          type SerializedPosition = Omit<Position, 'openDate' | 'closeDate' | 'avgBuyPrice' | 'realizedPnl' | 'trades' | 'stopLosses' | 'maxRiskAmount' | 'currentPrice' | 'marketValue' | 'unrealizedPnl' | 'totalPnl' | 'initialR' | 'entryTime'> & {
            openDate: string;
            closeDate: string | null;
            avgBuyPrice: string;
            realizedPnl: string;
            maxRiskAmount?: string | null;
            currentPrice?: string;
            marketValue?: string;
            unrealizedPnl?: string;
            totalPnl?: string;
            initialR?: string;
            entryTime?: string | null;
            trades?: SerializedTrade[];
            stopLosses?: Array<Omit<StopLoss, 'stopPrice' | 'createdAt'> & { stopPrice: string; createdAt: string }>;
          };
          
          const serializedPositions = positions.map((position) => {
            try {
              // Decimal 필드들을 먼저 변환
              const serializedPosition: SerializedPosition = {
                ...position,
                openDate: position.openDate instanceof Date ? position.openDate.toISOString() : String(position.openDate),
                closeDate: position.closeDate ? (position.closeDate instanceof Date ? position.closeDate.toISOString() : String(position.closeDate)) : null,
                avgBuyPrice: position.avgBuyPrice instanceof Decimal ? position.avgBuyPrice.toString() : String(position.avgBuyPrice),
                realizedPnl: position.realizedPnl instanceof Decimal ? position.realizedPnl.toString() : String(position.realizedPnl),
                maxRiskAmount: position.maxRiskAmount ? (position.maxRiskAmount instanceof Decimal ? position.maxRiskAmount.toString() : String(position.maxRiskAmount)) : null,
                // Optional Decimal 필드들 변환
                currentPrice: position.currentPrice ? (position.currentPrice instanceof Decimal ? position.currentPrice.toString() : String(position.currentPrice)) : undefined,
                marketValue: position.marketValue ? (position.marketValue instanceof Decimal ? position.marketValue.toString() : String(position.marketValue)) : undefined,
                unrealizedPnl: position.unrealizedPnl ? (position.unrealizedPnl instanceof Decimal ? position.unrealizedPnl.toString() : String(position.unrealizedPnl)) : undefined,
                totalPnl: position.totalPnl ? (position.totalPnl instanceof Decimal ? position.totalPnl.toString() : String(position.totalPnl)) : undefined,
                initialR: position.initialR ? (position.initialR instanceof Decimal ? position.initialR.toString() : String(position.initialR)) : undefined,
                entryTime: position.entryTime ? (position.entryTime instanceof Date ? position.entryTime.toISOString() : String(position.entryTime)) : null,
                trades: position.trades ? position.trades.map(t => ({
                  ...t,
                  price: t.price instanceof Decimal ? t.price.toString() : String(t.price),
                  commission: t.commission instanceof Decimal ? t.commission.toString() : String(t.commission),
                  tradeDate: t.tradeDate instanceof Date ? t.tradeDate.toISOString() : String(t.tradeDate),
                  createdAt: t.createdAt ? (t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt)) : new Date().toISOString()
                })) : [],
                stopLosses: []
              };
              
              return serializedPosition;
            } catch (err) {
              throw err;
            }
          });
          
          const positionTradeMap: Record<string, string[]> = {};
          positions.forEach(position => {
            if (position.trades) {
              positionTradeMap[position.id] = position.trades.map(t => t.id);
            }
          });
          
          const serializedEquityCurve = equityCurveData?.map(data => ({
            date: data.date.toISOString(),
            totalValue: data.totalValue.toString(),
            cashValue: data.cashValue?.toString() || '0',
            stockValue: data.stockValue?.toString() || '0',
            dailyPnl: data.dailyPnl.toString()
          }));
          
          const importData = {
            trades: serializedTrades,
            positions: serializedPositions,
            importType,
            accountId,
            currentTotalAssets: currentTotalAssets?.toString(),
            positionTradeMap,
            buyCommissionRate,
            sellCommissionRate,
            equityCurveData: serializedEquityCurve
          };

          try {
            JSON.stringify(importData);
          } catch (err) {
            for (const [, value] of Object.entries(importData)) {
              try {
                JSON.stringify(value);
              } catch (fieldErr) {
              }
            }
            throw new Error('Data serialization failed - cannot send to IPC');
          }

          const result = await window.electronAPI.csv.import(importData);
          
          if (!result.success) {
            throw new Error(result.errors?.join(', ') || i18n.t('messages:trading.importFailed'));
          }
          
          await get().loadPositions();
          await get().loadTrades();
          await get().loadEquityCurve();
          
          set({ isLoading: false });
          
          return {
            success: result.success,
            savedTradesCount: result.savedTradesCount || 0,
            skippedTradesCount: result.skippedTradesCount || 0,
            savedPositionsCount: result.savedPositionsCount || 0,
            skippedPositionsCount: result.skippedPositionsCount || 0
          };
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
          throw error;
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    })),
    {
      name: 'trading-store'
    }
  )
);