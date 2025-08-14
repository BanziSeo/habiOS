import type { Position } from '../../../types';
import type { PositionMetrics } from '../../../stores/metricsStore';

// 메트릭 아이템 정의
export interface MetricItem {
  id: string;
  key: string;
  label: string;
  labelKey?: string; // i18n 번역 키
  formatter?: (value: string | number | null, position: Position, metrics: PositionMetrics) => string;
  editable?: boolean;
  showProgressBar?: boolean;
}

// 카테고리 정의
export interface Category {
  id: string;
  name: string;
  items: MetricItem[];
}

// 모달 레이아웃 정의
export interface ModalLayout {
  categories: Category[];
  quickStats: string[]; // 상단 Quick Stats에 표시할 항목 key
}

// Props 정의
export interface PositionDetailModalProps {
  position: Position;
}

// 포맷터 함수 타입
export type MetricFormatter = (
  value: string | number | null,
  position: Position,
  metrics: PositionMetrics,
  currency?: string
) => string;

// 포맷터 레코드 타입
export type FormattersRecord = Record<string, MetricFormatter>;