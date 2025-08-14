// 테마 타입 정의
export type ThemeType = 'masterpiece-dark' | 'moonlight-mist' | 
  'arctic-twilight' | 'deep-forest' | 'cosmic-dust' | 'aurora' |
  'pearl' | 'sage' | 'arctic' | 'lavender' | 'coral' | 'slate';

// 테마 정의 인터페이스
export interface ThemeDefinition {
  name: string;
  description: string;
  mode: 'dark' | 'light';
  colors: {
    L1: string;
    L2: string;
    L3: string;
    L4: string;
    L5: string;
    primary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textDisabled: string;
    border: string;
    borderSecondary: string;
  };
}