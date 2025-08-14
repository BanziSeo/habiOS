import i18n from '../../i18n';
import type { ThemeType } from './types';
import { themes } from './colors';
import { createTheme } from './antConfig';

// 타입과 테마 정의 re-export
export type { ThemeType, ThemeDefinition } from './types';
export { themes } from './colors';
export { createTheme } from './antConfig';

// 기본 테마 내보내기 (Moonlight Mist)
export const darkTheme = createTheme('moonlight-mist');

// 테마 목록을 번역과 함께 가져오는 함수
export const getThemeList = () => {
  return Object.entries(themes).map(([key, theme]) => ({
    key: key as ThemeType,
    name: theme.name,
    description: i18n.t(`common:theme.descriptions.${key}`),
    mode: theme.mode,
    primary: theme.colors.primary,
    background: theme.colors.L2,
  }));
};

// 하위 호환성을 위한 정적 export (초기값은 영어)
export const themeList = Object.entries(themes).map(([key, theme]) => ({
  key: key as ThemeType,
  name: theme.name,
  description: theme.description,
  mode: theme.mode,
  primary: theme.colors.primary,
  background: theme.colors.L2,
}));