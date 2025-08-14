import { useState, useEffect } from 'react';

// Breakpoints for desktop-focused responsive design
const BREAKPOINTS = {
  xs: 768,    // Small windows, split screen
  sm: 1024,   // Compact desktop
  md: 1440,   // Standard desktop
  lg: 1920,   // Large desktop
  xl: 2560,   // Ultra-wide monitors
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: BreakpointKey;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isCompact: boolean; // xs or sm
  isStandard: boolean; // md or lg
  isWide: boolean; // xl
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    
    return {
      width,
      height,
      breakpoint,
      ...getBreakpointFlags(breakpoint),
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      // Debounce resize events
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const breakpoint = getBreakpoint(width);
        
        setState({
          width,
          height,
          breakpoint,
          ...getBreakpointFlags(breakpoint),
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return state;
};

function getBreakpoint(width: number): BreakpointKey {
  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  return 'xl';
}

function getBreakpointFlags(breakpoint: BreakpointKey) {
  return {
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    isCompact: breakpoint === 'xs' || breakpoint === 'sm',
    isStandard: breakpoint === 'md' || breakpoint === 'lg',
    isWide: breakpoint === 'xl',
  };
}

// Helper hook for grid columns
export const useGridColumns = () => {
  const { breakpoint } = useResponsive();
  
  switch (breakpoint) {
    case 'xs': return { widgets: 1, table: 4, metrics: 2 };
    case 'sm': return { widgets: 2, table: 6, metrics: 3 };
    case 'md': return { widgets: 3, table: 8, metrics: 4 };
    case 'lg': return { widgets: 4, table: 10, metrics: 4 };
    case 'xl': return { widgets: 5, table: 12, metrics: 5 };
    default: return { widgets: 4, table: 10, metrics: 4 };
  }
};

// Helper hook for widget dimensions
export const useWidgetDimensions = () => {
  const { width } = useResponsive();
  const sidebarWidth = 200; // Default sidebar width
  const padding = 32; // Content padding
  const gap = 16; // Grid gap
  
  const contentWidth = width - sidebarWidth - (padding * 2);
  const columns = useGridColumns().widgets;
  const widgetWidth = (contentWidth - (gap * (columns - 1))) / columns;
  
  return {
    minWidth: 280,
    maxWidth: 600,
    calculatedWidth: Math.max(280, Math.min(600, widgetWidth)),
    columns,
  };
};