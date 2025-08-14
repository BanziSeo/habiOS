import type { ThemeType, ThemeDefinition } from '../types';
import { darkThemes } from './dark';
import { lightThemes } from './light';

// 모든 테마 통합
export const themes: Record<ThemeType, ThemeDefinition> = {
  ...darkThemes,
  ...lightThemes,
} as Record<ThemeType, ThemeDefinition>;