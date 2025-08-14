import '@testing-library/jest-dom';
import { vi } from 'vitest';

// global 타입 확장
declare global {
  var electronAPI: any;
}

// Electron API 모킹
global.electronAPI = {
  // Account
  getAccounts: vi.fn(),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
  
  // Positions & Trades
  getPositions: vi.fn(),
  getTrades: vi.fn(),
  updatePosition: vi.fn(),
  updateTrade: vi.fn(),
  
  // Settings
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  
  // Utility
  openExternal: vi.fn(),
  getVersion: vi.fn(),
} as any;

// matchMedia 모킹 (Ant Design 컴포넌트용)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// IntersectionObserver 모킹
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// LocalStorage Mock
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as Storage;

// Ant Design message mock
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  App: {
    useApp: () => ({
      message: {
        error: vi.fn(),
        success: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
      },
    }),
  },
}));