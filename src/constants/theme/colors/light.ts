import type { ThemeDefinition } from '../types';

// 라이트 테마 정의
export const lightThemes: Record<string, ThemeDefinition> = {
  // Pearl White
  'pearl': {
    name: 'Pearl White',
    description: '진주처럼 은은하고 부드러운 라이트 테마',
    mode: 'light',
    colors: {
      // 배경 계층 (5단계 - 밝은 순서)
      L1: '#FAFBFC',     // 가장 밝음 (사이드바, 헤더) - 오프 화이트
      L2: '#FFFFFF',     // 메인 배경 - 순백
      L3: '#F6F8FA',     // 카드, 위젯 - 소프트 그레이
      L4: '#E8ECF0',     // 호버 상태 - 라이트 그레이
      L5: '#DDE2E8',     // 테두리용 - 쿨 그레이
      
      // 시맨틱 색상
      primary: '#5B6FED',    // 주 테마색 - 페리윙클 블루 (시그니처!)
      success: '#2E7D32',    // 성공/수익 - 다크 그린
      error: '#DC2626',      // 오류/손실 - 레드
      warning: '#D97706',    // 경고 - 다크 앰버
      info: '#4285F4',       // 정보 - 코발트 블루
      
      // 텍스트
      text: '#1A1F2E',              // 주 텍스트 - 차콜
      textSecondary: '#57606A',     // 보조 텍스트 - 슬레이트
      textTertiary: '#8B949E',      // 3차 텍스트 - 미디엄 그레이
      textDisabled: '#ACB5BD',      // 비활성 텍스트 - 라이트 그레이
      
      // 테두리
      border: '#D0D7DE',            // 기본 테두리 - 실버
      borderSecondary: '#E2E8EE',   // 보조 테두리 - 페일 그레이
    }
  },

  // Sage Garden
  'sage': {
    name: 'Sage Garden',
    description: '세이지 그린의 차분하고 자연스러운 테마',
    mode: 'light',
    colors: {
      // 배경 계층 (5단계 - 밝은 순서)
      L1: '#F8FAF7',     // 가장 밝음 - 민트 크림
      L2: '#FFFFFF',     // 메인 배경 - 화이트
      L3: '#F2F5F0',     // 카드, 위젯 - 세이지 틴트
      L4: '#E5EBE1',     // 호버 상태 - 페일 세이지
      L5: '#D4DED0',     // 테두리용 - 라이트 세이지
      
      // 시맨틱 색상
      primary: '#2E7D32',    // 주 테마색 - 포레스트 그린 (시그니처!)
      success: '#2E7D32',    // 성공/수익 - 다크 그린
      error: '#C62828',      // 오류/손실 - 다크 레드
      warning: '#EA580C',    // 경고 - 다크 오렌지
      info: '#1E88E5',       // 정보 - 블루
      
      // 텍스트
      text: '#1B2A1F',              // 주 텍스트 - 다크 그린
      textSecondary: '#4A5D50',     // 보조 텍스트 - 미디엄 그린
      textTertiary: '#6B8270',      // 3차 텍스트 - 세이지
      textDisabled: '#9CAB9F',      // 비활성 텍스트 - 페일 세이지
      
      // 테두리
      border: '#C3D4C6',            // 기본 테두리 - 라이트 세이지
      borderSecondary: '#DCE6DD',   // 보조 테두리 - 페일 그린
    }
  },

  // Arctic Ice
  'arctic': {
    name: 'Arctic Ice',
    description: '북극 빙하의 시원하고 깨끗한 테마',
    mode: 'light',
    colors: {
      // 배경 계층 (5단계 - 밝은 순서)
      L1: '#F7FAFB',     // 가장 밝음 - 아이스 화이트
      L2: '#FFFFFF',     // 메인 배경 - 순백
      L3: '#EFF5F7',     // 카드, 위젯 - 프로스트
      L4: '#E0EBF0',     // 호버 상태 - 페일 시안
      L5: '#C8DCE5',     // 테두리용 - 라이트 시안
      
      // 시맨틱 색상
      primary: '#0891B2',    // 주 테마색 - 시안 (시그니처!)
      success: '#059669',    // 성공/수익 - 다크 에메랄드
      error: '#DC2626',      // 오류/손실 - 다크 레드
      warning: '#D97706',    // 경고 - 다크 앰버
      info: '#3B82F6',       // 정보 - 블루
      
      // 텍스트
      text: '#0F172A',              // 주 텍스트 - 미드나이트
      textSecondary: '#475569',     // 보조 텍스트 - 슬레이트
      textTertiary: '#64748B',      // 3차 텍스트 - 그레이
      textDisabled: '#94A3B8',      // 비활성 텍스트 - 라이트 그레이
      
      // 테두리
      border: '#CBD5E1',            // 기본 테두리 - 쿨 그레이
      borderSecondary: '#E2E8F0',   // 보조 테두리 - 페일 그레이
    }
  },

  // Lavender Fields
  'lavender': {
    name: 'Lavender Fields',
    description: '라벤더 들판의 우아하고 세련된 테마',
    mode: 'light',
    colors: {
      // 배경 계층 (5단계 - 밝은 순서)
      L1: '#FAF9FC',     // 가장 밝음 - 라벤더 미스트
      L2: '#FFFFFF',     // 메인 배경 - 화이트
      L3: '#F5F3F9',     // 카드, 위젯 - 페일 라벤더
      L4: '#EAE5F3',     // 호버 상태 - 라이트 라벤더
      L5: '#DDD5EA',     // 테두리용 - 라벤더
      
      // 시맨틱 색상
      primary: '#8B5CF6',    // 주 테마색 - 바이올렛 (시그니처!)
      success: '#16A34A',    // 성공/수익 - 다크 그린
      error: '#E11D48',      // 오류/손실 - 다크 로즈
      warning: '#CA8A04',    // 경고 - 다크 옐로우
      info: '#6366F1',       // 정보 - 인디고
      
      // 텍스트
      text: '#1E1B2E',              // 주 텍스트 - 다크 퍼플
      textSecondary: '#4C4966',     // 보조 텍스트 - 퍼플 그레이
      textTertiary: '#7A7699',      // 3차 텍스트 - 미디엄 퍼플
      textDisabled: '#A7A3C2',      // 비활성 텍스트 - 라이트 퍼플
      
      // 테두리
      border: '#D4CEDF',            // 기본 테두리 - 페일 퍼플
      borderSecondary: '#E9E5F0',   // 보조 테두리 - 미스티 퍼플
    }
  },

  // Coral Reef
  'coral': {
    name: 'Coral Reef',
    description: '산호초의 생동감 있고 따뜻한 테마',
    mode: 'light',
    colors: {
      // 배경 계층 (5단계 - 밝은 순서)
      L1: '#FFF9F8',     // 가장 밝음 - 블러시
      L2: '#FFFFFF',     // 메인 배경 - 화이트
      L3: '#FFF3F1',     // 카드, 위젯 - 페일 피치
      L4: '#FFE4E0',     // 호버 상태 - 라이트 코랄
      L5: '#FFD1CA',     // 테두리용 - 코랄 핑크
      
      // 시맨틱 색상
      primary: '#FF6B6B',    // 주 테마색 - 코랄 레드 (시그니처!)
      success: '#2E8B57',    // 성공/수익 - 씨 그린
      error: '#B91C1C',      // 오류/손실 - 다크 크림슨
      warning: '#DC8F00',    // 경고 - 다크 골드
      info: '#339AF0',       // 정보 - 스카이 블루
      
      // 텍스트
      text: '#2D1F1F',              // 주 텍스트 - 다크 브라운
      textSecondary: '#5C4545',     // 보조 텍스트 - 브라운
      textTertiary: '#8A7070',      // 3차 텍스트 - 로즈 브라운
      textDisabled: '#B89999',      // 비활성 텍스트 - 페일 브라운
      
      // 테두리
      border: '#F0D0D0',            // 기본 테두리 - 페일 로즈
      borderSecondary: '#F8E8E8',   // 보조 테두리 - 블러시
    }
  },

  // Slate Minimal
  'slate': {
    name: 'Slate Minimal',
    description: '무채색 계열의 미니멀하고 모던한 테마',
    mode: 'light',
    colors: {
      // 배경 계층 (5단계 - 밝은 순서)
      L1: '#F8FAFB',     // 가장 밝음 - 페일 그레이
      L2: '#FFFFFF',     // 메인 배경 - 화이트
      L3: '#F1F5F9',     // 카드, 위젯 - 라이트 슬레이트
      L4: '#E2E8F0',     // 호버 상태 - 슬레이트
      L5: '#CBD5E1',     // 테두리용 - 미디엄 슬레이트
      
      // 시맨틱 색상
      primary: '#334155',    // 주 테마색 - 다크 슬레이트 (시그니처!)
      success: '#15803D',    // 성공/수익 - 다크 그린
      error: '#DC2626',      // 오류/손실 - 레드
      warning: '#D97706',    // 경고 - 오렌지
      info: '#2563EB',       // 정보 - 블루
      
      // 텍스트
      text: '#0F172A',              // 주 텍스트 - 다크 네이비
      textSecondary: '#475569',     // 보조 텍스트 - 슬레이트
      textTertiary: '#64748B',      // 3차 텍스트 - 미디엄 슬레이트
      textDisabled: '#94A3B8',      // 비활성 텍스트 - 라이트 슬레이트
      
      // 테두리
      border: '#CBD5E1',            // 기본 테두리 - 슬레이트
      borderSecondary: '#E2E8F0',   // 보조 테두리 - 페일 슬레이트
    }
  },
};