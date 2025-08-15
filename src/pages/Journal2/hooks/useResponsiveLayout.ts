import { useMemo } from 'react';
import { useResponsive } from '../../../hooks/useResponsive';
import { getResponsiveLayouts } from '../utils/layoutHelpers';

/**
 * 반응형 레이아웃 관리
 */
export const useResponsiveLayout = () => {
  const responsive = useResponsive();
  
  // 반응형에 따른 기본 레이아웃 계산
  const responsiveLayouts = useMemo(() => {
    return getResponsiveLayouts(responsive.isCompact);
  }, [responsive.isCompact]);
  
  return {
    responsive,
    responsiveLayouts
  };
};