import React, { useState, useRef, useEffect } from 'react';
import { ChartModal } from '../../../components/Modals/ChartModal';
import { createDummyPosition } from '../../../utils/dummyData';
import { useChartData } from '../../../components/Modals/ChartModal/hooks/useChartData';
import { useTranslation } from 'react-i18next';
import { 
  ExpandOutlined, 
  CompressOutlined, 
  CloseOutlined,
  DragOutlined,
} from '@ant-design/icons';
import type { Position as TradingPosition } from '../../../types';
import './FloatingPreview.css';

interface WindowPosition {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export const FloatingPreview: React.FC = () => {
  const { t } = useTranslation('settings');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  // 절대 위치로 변경 (화면 우측 하단 기준)
  const [position, setPosition] = useState<WindowPosition>({ 
    x: window.innerWidth - 420, 
    y: window.innerHeight - 400 
  });
  const [size, setSize] = useState<Size>({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragStart, setDragStart] = useState<WindowPosition>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number; x: number; y: number }>({ 
    width: 0, 
    height: 0, 
    x: 0, 
    y: 0 
  });
  
  const previewRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // 리사이즈 시작
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (isMaximized || isMinimized) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // 마우스 이동 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        // 우측 하단 핸들로만 리사이즈
        const newWidth = Math.max(300, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        
        setSize({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeDirection]);

  // 최소화/최대화 토글
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  if (!isVisible) return null;

  const previewStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 80,
        left: 20,
        right: 20,
        bottom: 80,
        width: 'auto',
        height: 'auto',
      }
    : {
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: isMinimized ? 200 : size.width,
        height: isMinimized ? 48 : size.height,
      };

  return (
    <div
      ref={previewRef}
      className={`floating-preview ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={previewStyle}
    >
      {/* 헤더 */}
      <div 
        className="floating-preview-header"
        onMouseDown={handleDragStart}
      >
        <div className="preview-drag-handle">
          <DragOutlined />
        </div>
        <span className="preview-title">{t('preview.title')}</span>
        <div className="preview-controls">
          <button 
            className="preview-btn"
            onClick={toggleMinimize}
            title={isMinimized ? t('actions.restore') : t('actions.minimize')}
          >
            <CompressOutlined />
          </button>
          <button 
            className="preview-btn"
            onClick={toggleMaximize}
            title={isMaximized ? t('actions.restore') : t('actions.maximize')}
          >
            <ExpandOutlined />
          </button>
          <button 
            className="preview-btn preview-btn-close"
            onClick={() => setIsVisible(false)}
            title={t('actions.close')}
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* 프리뷰 콘텐츠 */}
      {!isMinimized && (
        <div className="floating-preview-content">
          <FloatingChartContent />
        </div>
      )}

      {/* 리사이즈 핸들 - 우측 하단만 */}
      {!isMinimized && !isMaximized && (
        <div 
          className="resize-handle resize-handle-corner"
          onMouseDown={(e) => handleResizeStart(e, 'corner')}
        />
      )}
    </div>
  );
};

// 차트 콘텐츠를 별도 컴포넌트로 분리
const FloatingChartContent: React.FC = () => {
  const ticker = 'SPY';
  const timeframe = '1d';
  const { chartData } = useChartData(ticker, timeframe);
  const [dummyPosition, setDummyPosition] = useState<TradingPosition | null>(null);
  
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const currentPrice = chartData[chartData.length - 1].close;
      const position = createDummyPosition(ticker, currentPrice, chartData);
      setDummyPosition(position);
    }
  }, [chartData]);
  
  if (!dummyPosition) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span>차트 로딩 중...</span>
      </div>
    );
  }
  
  return (
    <ChartModal
      position={dummyPosition}
      isPreview={true}
    />
  );
};