import { useState, useEffect, useCallback, useRef } from 'react';
import { getInitialContainerWidth } from '../utils/layoutHelpers';

/**
 * 컨테이너 너비 감지 및 업데이트
 */
export const useContainerWidth = () => {
  const [containerWidth, setContainerWidth] = useState(getInitialContainerWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 컨테이너 너비 업데이트
  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      // clientWidth를 사용하여 padding을 제외한 실제 콘텐츠 영역의 너비를 가져옴
      const width = containerRef.current.clientWidth;
      if (width > 0) {
        setContainerWidth(width);
      }
    }
  }, []);
  
  // 컨테이너 크기 감지
  useEffect(() => {
    // 초기 렌더링 시 약간의 지연을 주어 DOM이 완전히 준비되도록 함
    const initialTimer = setTimeout(() => {
      updateContainerWidth();
    }, 50);
    
    const handleResize = () => updateContainerWidth();
    window.addEventListener('resize', handleResize);
    
    // localStorage 변경 감지 (사이드바 토글 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sidebarCollapsed') {
        // 사이드바 애니메이션 시간(0.2s) 후에 너비 업데이트
        setTimeout(() => {
          updateContainerWidth();
        }, 250);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서의 localStorage 변경도 감지
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'sidebarCollapsed') {
        setTimeout(() => {
          updateContainerWidth();
        }, 250);
      }
    };
    
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, [updateContainerWidth]);
  
  return {
    containerWidth,
    containerRef
  };
};