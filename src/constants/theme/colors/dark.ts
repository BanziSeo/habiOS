import type { ThemeDefinition } from '../types';

// 다크 테마 정의
export const darkThemes: Record<string, ThemeDefinition> = {
  // Masterpiece 1 - Refined Darkness (기존 테마)
  'masterpiece-dark': {
    name: 'Masterpiece Dark',
    description: '깊고 어두운 GitHub 스타일 테마',
    mode: 'dark',
    colors: {
      // 배경 계층
      L1: '#010409',     // 가장 어두움 (사이드바, 헤더)
      L2: '#0D1117',     // 메인 배경
      L3: '#161B22',     // 카드, 위젯
      L4: '#1C2128',     // 호버 상태
      L5: '#21262D',     // 테두리
      // 시맨틱
      primary: '#00DC82',
      success: '#3FB950',
      error: '#F85149',
      warning: '#D29922',
      info: '#58A6FF',
      // 텍스트
      text: '#C9D1D9',
      textSecondary: '#8B949E',
      textTertiary: '#6E7681',
      textDisabled: '#484F58',
      // 테두리
      border: '#30363D',
      borderSecondary: '#21262D',
    }
  },
  
  // Moonlight Mist
  'moonlight-mist': {
    name: 'Moonlight Mist',
    description: '달빛이 비친 안개 같은 은은한 블루 그레이',
    mode: 'dark',
    colors: {
      // 배경 계층
      L1: '#0D0F19',     // 가장 어두움 (사이드바, 헤더)
      L2: '#191B25',     // 메인 배경
      L3: '#21232F',     // 카드, 위젯  
      L4: '#252835',     // 호버 상태
      L5: '#2A2D3A',     // 테두리
      // 시맨틱
      primary: '#B8C5FF',
      success: '#5EEAD4',
      error: '#FCA5A5',
      warning: '#F9A8BA',
      info: '#A2B0F3',
      // 텍스트
      text: '#F5F7FF',
      textSecondary: '#8B92B3',
      textTertiary: '#6B7394',
      textDisabled: '#4A526E',
      // 테두리
      border: '#2A2D3A',
      borderSecondary: '#21232F',
    }
  },

  // Arctic Twilight - 차가운 블루톤
  'arctic-twilight': {
    name: 'Arctic Twilight',
    description: '북극의 황혼을 연상시키는 차가운 블루 톤',
    mode: 'dark',
    colors: {
      // 배경 계층
      L1: '#0A0D10',     // 베이스
      L2: '#141922',     // 메인 배경
      L3: '#1F2A38',     // 카드 배경 (더 밝게)
      L4: '#283344',     // 호버 상태 (더 밝게)
      L5: '#252E3B',     // 보더 컬러
      // 시맨틱
      primary: '#00D4FF',
      success: '#5CDB95',
      error: '#FF6B6B',
      warning: '#FFB84D',
      info: '#00D4FF',
      // 텍스트
      text: '#E8F4FF',
      textSecondary: '#C9D6E3',
      textTertiary: '#7A92A8',
      textDisabled: '#5A6B78',
      // 테두리
      border: '#252E3B',
      borderSecondary: '#2A3441',
    }
  },

  // Deep Forest - 에메랄드 그린
  'deep-forest': {
    name: 'Deep Forest',
    description: '깊은 숲속의 에메랄드를 연상',
    mode: 'dark',
    colors: {
      // 배경 계층
      L1: '#0A0F0C',     // 베이스
      L2: '#0F1A14',     // 메인 배경
      L3: '#1A2D24',     // 카드 배경 (더 밝게)
      L4: '#243530',     // 호버 상태 (더 밝게)
      L5: '#1E302A',     // 보더 컬러
      // 시맨틱
      primary: '#00E5A0',
      success: '#4AE88C',
      error: '#FF6B8A',
      warning: '#FFB84D',
      info: '#00E5A0',
      // 텍스트
      text: '#E8F5F0',
      textSecondary: '#C4E0D2',
      textTertiary: '#7FA896',
      textDisabled: '#5A7A6A',
      // 테두리
      border: '#1E302A',
      borderSecondary: '#233730',
    }
  },

  // Cosmic Dust - 우주 먼지
  'cosmic-dust': {
    name: 'Cosmic Dust',
    description: '우주 먼지를 연상시키는 깊은 보라빛',
    mode: 'dark',
    colors: {
      // 배경 계층
      L1: '#0F0C13',     // 베이스
      L2: '#191621',     // 메인 배경
      L3: '#2B253C',     // 카드 배경 (더 밝게)
      L4: '#352E47',     // 호버 상태 (더 밝게)
      L5: '#2E2739',     // 보더 컬러
      // 시맨틱
      primary: '#FFB84D',
      success: '#5EE8A2',
      error: '#FF7A8F',
      warning: '#FFB84D',
      info: '#A78BFA',
      // 텍스트
      text: '#F5F0FF',
      textSecondary: '#E0D7F0',
      textTertiary: '#9B92A8',
      textDisabled: '#6B627A',
      // 테두리
      border: '#2E2739',
      borderSecondary: '#332B40',
    }
  },

  // Aurora Borealis - 북극 오로라
  'aurora': {
    name: 'Aurora Borealis',
    description: '북극 오로라에서 영감을 받은 신비로운 테마',
    mode: 'dark',
    colors: {
      // 배경 계층 (5단계 - 어두운 순서)
      L1: '#0A0E1B',     // 가장 어두움 (사이드바, 헤더) - 깊은 남색
      L2: '#0F1424',     // 메인 배경 - 미드나잇 블루
      L3: '#161B2E',     // 카드, 위젯 - 다크 네이비
      L4: '#1E2439',     // 호버 상태 - 슬레이트 블루
      L5: '#2A3147',     // 테두리용 - 밝은 슬레이트
      
      // 시맨틱 색상
      primary: '#00E5FF',    // 주 테마색 - 시안 오로라 (시그니처!)
      success: '#50FA7B',    // 성공/수익 - 민트 그린
      error: '#FF5E5B',      // 오류/손실 - 코랄 레드
      warning: '#FFD93D',    // 경고 - 골든 옐로우
      info: '#92A8F8',       // 정보 - 페리윙클 블루
      
      // 텍스트
      text: '#E8EAED',              // 주 텍스트 - 소프트 화이트
      textSecondary: '#9CA3AF',     // 보조 텍스트 - 쿨 그레이
      textTertiary: '#6B7280',      // 3차 텍스트 - 다크 그레이
      textDisabled: '#4B5563',      // 비활성 텍스트 - 딤 그레이
      
      // 테두리
      border: '#2D3548',            // 기본 테두리 - 블루 그레이
      borderSecondary: '#1F2937',   // 보조 테두리 - 다크 블루 그레이
    }
  },
};