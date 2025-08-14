import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChartSnapshot {
  id: string;
  ticker: string;
  positionId?: string;
  imageDataUrl: string;
  captureDate: Date;
  timeframe: string;
  memo?: string;
  tags?: string[];
  metadata?: {
    avgPrice?: number;
    currentPrice?: number;
    priceChange?: number;
    indicators?: string[];
  };
}

interface ChartBookStore {
  charts: ChartSnapshot[];
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initializeCharts: () => Promise<void>;
  addChart: (chart: Omit<ChartSnapshot, 'id' | 'captureDate'>) => Promise<string>;
  updateChart: (id: string, updates: Partial<ChartSnapshot>) => Promise<void>;
  deleteChart: (id: string) => Promise<void>;
  getChart: (id: string) => ChartSnapshot | undefined;
  getChartsByTicker: (ticker: string) => ChartSnapshot[];
  getChartsByPosition: (positionId: string) => ChartSnapshot[];
  searchCharts: (query: string) => ChartSnapshot[];
  deleteAllCharts: () => Promise<void>;
}

// IndexedDB helper functions
const DB_NAME = 'TradesLogChartBook';
const DB_VERSION = 1;
const STORE_NAME = 'charts';

class ChartBookDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('ticker', 'ticker', { unique: false });
          store.createIndex('positionId', 'positionId', { unique: false });
          store.createIndex('captureDate', 'captureDate', { unique: false });
        }
      };
    });
  }

  async add(chart: ChartSnapshot): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(chart);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async update(id: string, updates: Partial<ChartSnapshot>): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const chart = getRequest.result;
        if (chart) {
          const updated = { ...chart, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Chart not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<ChartSnapshot[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const charts = request.result.map(chart => ({
          ...chart,
          captureDate: new Date(chart.captureDate)
        }));
        resolve(charts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const chartBookDB = new ChartBookDB();

export const useChartBookStore = create<ChartBookStore>()(
  persist(
    (set, get) => ({
      charts: [],
      isLoading: false,
      isInitialized: false,

      initializeCharts: async () => {
        if (get().isInitialized) return;
        
        try {
          set({ isLoading: true });
          
          await chartBookDB.init();
          const charts = await chartBookDB.getAll();
          
          set({ charts, isLoading: false, isInitialized: true });
        } catch (error) {
          // 에러가 발생해도 앱은 계속 실행되도록 함
          set({ charts: [], isLoading: false, isInitialized: true });
        }
      },

      addChart: async (chartData) => {
        const id = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newChart: ChartSnapshot = {
          ...chartData,
          id,
          captureDate: new Date()
        };

        try {
          set({ isLoading: true });
          await chartBookDB.add(newChart);
          const charts = await chartBookDB.getAll();
          set({ charts, isLoading: false });
          return id;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateChart: async (id, updates) => {
        try {
          set({ isLoading: true });
          await chartBookDB.update(id, updates);
          const charts = await chartBookDB.getAll();
          set({ charts, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteChart: async (id) => {
        try {
          set({ isLoading: true });
          await chartBookDB.delete(id);
          const charts = await chartBookDB.getAll();
          set({ charts, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getChart: (id) => {
        return get().charts.find(chart => chart.id === id);
      },

      getChartsByTicker: (ticker) => {
        return get().charts.filter(chart => chart.ticker === ticker);
      },

      getChartsByPosition: (positionId) => {
        return get().charts.filter(chart => chart.positionId === positionId);
      },

      searchCharts: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().charts.filter(chart => 
          chart.ticker.toLowerCase().includes(lowercaseQuery) ||
          chart.memo?.toLowerCase().includes(lowercaseQuery) ||
          chart.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      },

      deleteAllCharts: async () => {
        try {
          set({ isLoading: true });
          await chartBookDB.deleteAll();
          set({ charts: [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'chartbook-storage',
      // persist는 isInitialized 상태만 저장하여 중복 초기화 방지
      partialize: (state) => ({ isInitialized: state.isInitialized })
    }
  )
);