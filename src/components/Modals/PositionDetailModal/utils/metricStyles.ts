import type { Position } from '../../../../types';
import type { PositionMetrics } from '../../../../stores/metricsStore';

interface StyleClasses {
  [key: string]: string;
}

// 메트릭 값에 따른 스타일 클래스 결정
export const getMetricValueClass = (
  key: string,
  position: Position,
  metrics: PositionMetrics,
  baseClass: string,
  styles: StyleClasses
): string => {
  let valueClass = baseClass;
  
  if (key === 'realizedPnl' || key === 'aumPnl') {
    if (position.realizedPnl.gt(0)) valueClass += ` ${styles.positive}`;
    else if (position.realizedPnl.lt(0)) valueClass += ` ${styles.negative}`;
  } else if (key === 'rMultiple') {
    const rValue = metrics.rMultiple || 0;
    if (rValue > 0) valueClass += ` ${styles.positive}`;
    else if (rValue < 0) valueClass += ` ${styles.negative}`;
  } else if (key === 'pureRisk') {
    const risk = metrics.pureRisk || 0;
    if (risk > 2) valueClass += ` ${styles.warning}`;
  } else if (key === 'pureRiskDollar') {
    const risk = metrics.pureRiskDollar || 0;
    if (risk > 0) valueClass += ` ${styles.negative}`;
  } else if (key === 'totalRisk') {
    const risk = metrics.totalRisk || 0;
    if (risk > 0) valueClass += ` ${styles.negative}`;
    else valueClass += ` ${styles.positive}`;
  } else if (key === 'totalRiskDollar') {
    const risk = metrics.totalRiskDollar || 0;
    if (risk > 0) valueClass += ` ${styles.negative}`;
    else valueClass += ` ${styles.positive}`;
  }
  
  return valueClass;
};

// Quick Stats 값 스타일 클래스 결정
export const getQuickStatValueClass = (
  key: string,
  position: Position,
  metrics: PositionMetrics,
  baseClass: string,
  styles: StyleClasses
): string => {
  let valueClass = baseClass;
  
  if (key === 'rMultiple') {
    const rValue = metrics.rMultiple || 0;
    if (rValue > 0) valueClass += ` ${styles.positive}`;
    else if (rValue < 0) valueClass += ` ${styles.negative}`;
  } else if (key === 'realizedPnl') {
    if (position.realizedPnl.gt(0)) valueClass += ` ${styles.positive}`;
    else if (position.realizedPnl.lt(0)) valueClass += ` ${styles.negative}`;
  } else if (key === 'totalRisk') {
    const risk = metrics.totalRisk || 0;
    if (risk > 0) valueClass += ` ${styles.negative}`;
    else valueClass += ` ${styles.positive}`;
  }
  
  return valueClass;
};