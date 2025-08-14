import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { CheckOutlined } from '@ant-design/icons';
import { theme, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { Position } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { useTradingStore } from '../../stores/tradingStore';
import { useSettingsStore } from '../../stores/settingsStore';
import './ModalManager.css';

// Lazy load modal components
const PositionDetailModal = lazy(() => import('./PositionDetailModal'));
const ChartModal = lazy(() => import('./ChartModal'));
const StopLossModal = lazy(() => import('./StopLossModal'));
const TradeHistoryModal = lazy(() => import('./TradeHistoryModal'));
const PositionMemoContent = lazy(() => import('./PositionMemoContent').then(module => ({
  default: module.PositionMemoContent
})));

interface ModalManagerProps {
  visible: boolean;
  position: Position | null;
  onClose: () => void;
}

const ModalManager: React.FC<ModalManagerProps> = ({ visible, position: initialPosition, onClose }) => {
  const { token } = theme.useToken();
  const { t } = useTranslation('common');
  const { loadPositions, positions } = useTradingStore();
  const { generalSettings, toggleEditMode } = useSettingsStore();
  const isEditMode = generalSettings.isEditMode;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const position = initialPosition ? positions.find(p => p.id === initialPosition.id) || initialPosition : null;
  
  const defaultLayouts = {
    'position-detail': { i: 'position-detail', x: 0, y: 0, w: 10, h: 10, minW: 5, minH: 1, static: false, isResizable: true },
    'trade-history': { i: 'trade-history', x: 10, y: 0, w: 10, h: 10, minW: 5, minH: 1, static: false, isResizable: true },
    'chart': { i: 'chart', x: 0, y: 10, w: 14, h: 14, minW: 7, minH: 8, static: false, isResizable: true },
    'stop-loss': { i: 'stop-loss', x: 14, y: 10, w: 6, h: 14, minW: 3, minH: 1, static: false, isResizable: true },
    'position-memo': { i: 'position-memo', x: 0, y: 24, w: 10, h: 8, minW: 5, minH: 6, static: false, isResizable: true },
  };
  
  const getInitialLayout = () => {
    const savedLayout = localStorage.getItem('modalLayout');
    if (savedLayout) {
      return JSON.parse(savedLayout);
    }
    return Object.values(defaultLayouts);
  };

  const getInitialVisibility = () => {
    const savedVisibility = localStorage.getItem('modalVisibility');
    if (savedVisibility) {
      return JSON.parse(savedVisibility);
    }
    return {
      'position-detail': true,
      'trade-history': true,
      'chart': true,
      'stop-loss': true,
      'position-memo': true,
    };
  };

  const initialVisibility = getInitialVisibility();
  const allLayouts = getInitialLayout();
  
  const [layout, setLayout] = useState<Layout[]>(allLayouts.filter((item: Layout) => initialVisibility[item.i]));
  const [hiddenLayouts, setHiddenLayouts] = useState<Record<string, Layout>>(() => {
    const hidden: Record<string, Layout> = {};
    allLayouts.forEach((item: Layout) => {
      if (!initialVisibility[item.i]) {
        hidden[item.i] = item;
      }
    });
    return hidden;
  });
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const [modalVisibility, setModalVisibility] = useState(initialVisibility);

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }
      
      if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
      
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        e.stopPropagation();
        toggleEditMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress, true);
    return () => window.removeEventListener('keydown', handleKeyPress, true);
  }, [visible, toggleEditMode]);

  const handleClose = useCallback(async () => {
    onClose();
    await loadPositions();
  }, [onClose, loadPositions]);


  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem('modalLayout', JSON.stringify(newLayout));
  }, []);

  const toggleModalVisibility = useCallback((modalId: string) => {
    const isCurrentlyVisible = modalVisibility[modalId];
    
    if (isCurrentlyVisible) {
      const itemLayout = layout.find((item) => item.i === modalId);
      if (itemLayout) {
        setHiddenLayouts((prev) => ({
          ...prev,
          [modalId]: itemLayout
        }));
      }
      setLayout((prev) => prev.filter((item) => item.i !== modalId));
    } else {
      const savedLayout = hiddenLayouts[modalId] || (defaultLayouts as Record<string, Layout>)[modalId];
      if (savedLayout) {
        setLayout((prev) => [...prev, savedLayout]);
      }
    }
    
    setModalVisibility((prev: Record<string, boolean>) => {
      const newVisibility = {
        ...prev,
        [modalId]: !prev[modalId]
      };
      localStorage.setItem('modalVisibility', JSON.stringify(newVisibility));
      return newVisibility;
    });
  }, [modalVisibility, layout, hiddenLayouts]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  if (!visible || !position) return null;

  const firstTrade = position.trades.length > 0 
    ? position.trades.reduce((earliest, trade) => 
        new Date(trade.tradeDate) < new Date(earliest.tradeDate) ? trade : earliest
      )
    : null;

  const visibleLayout = layout.filter((item) => modalVisibility[item.i]);


  return ReactDOM.createPortal(
    <>
      <div 
        className="modal-overlay"
        style={{
          background: token.colorBgMask,
        }}
        onContextMenu={handleContextMenu}
        onDoubleClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div 
          className="modal-container"
          style={{
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorder}`,
          }}
          onDoubleClick={(e) => {
            if (e.target === e.currentTarget || 
                (e.target as HTMLElement).classList.contains('modal-grid-layout')) {
              handleClose();
            }
          }}
        >
        <div 
          className="modal-position-header"
          style={{
            color: token.colorText,
          }}
        >
          <span 
            className="position-ticker"
            style={{ color: token.colorPrimary }}
          >
            {position.tickerName || position.ticker}
          </span>
          <span 
            className="position-separator"
            style={{ color: token.colorTextTertiary }}
          >
            -
          </span>
          <span 
            className="position-date"
            style={{ color: token.colorTextSecondary }}
          >
            {firstTrade ? formatDateTime(firstTrade.tradeDate) : ''}
          </span>
        </div>
        
        {isEditMode && (
          <div 
            className="modal-edit-mode-indicator"
            style={{
              background: token.colorPrimary,
              color: 'white',
            }}
          >
            <span>{t('modal.editMode')}</span>
            <button 
              onClick={toggleEditMode}
              style={{
                background: 'white',
                color: token.colorSuccess,
              }}
            >
              {t('modal.complete')}
            </button>
          </div>
        )}
        
        <GridLayout
          className={`modal-grid-layout ${isEditMode ? 'edit-mode-active' : ''}`}
          layout={visibleLayout}
          cols={24}
          rowHeight={20}
          width={containerWidth}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".modal-drag-handle"
          preventCollision={false}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          compactType={null}
          allowOverlap={true}
        >
          {visibleLayout.map((item) => (
            <div 
              key={item.i} 
              className={`modal-item ${isEditMode ? 'modal-edit-mode' : ''}`} 
              data-grid={item} 
              style={{ 
                position: 'relative',
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: `0 10px 25px ${token.colorBgMask}`,
                ...(isEditMode && {
                  border: `2px solid ${token.colorPrimaryBorderHover}`,
                })
              }}
            >
              {isEditMode && (
                <div 
                  className="modal-drag-handle"
                  style={{
                    background: token.colorPrimaryBg,
                    border: `2px solid ${token.colorPrimaryBorder}`,
                    borderBottom: `2px solid ${token.colorPrimaryBorderHover}`,
                    color: token.colorPrimary,
                  }}
                >
                  <span 
                    className="modal-item-title"
                    style={{
                      color: token.colorText,
                    }}
                  >
                    {item.i === 'position-detail' && t('modal.positionDetail')}
                    {item.i === 'trade-history' && t('modal.tradeHistory')}
                    {item.i === 'chart' && t('modal.chart')}
                    {item.i === 'stop-loss' && t('modal.stopLoss')}
                    {item.i === 'position-memo' && t('modal.positionMemo')}
                  </span>
                </div>
              )}
              
              {isEditMode && (
                <button
                  className="modal-item-close-btn"
                  onClick={() => toggleModalVisibility(item.i)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10,
                    background: 'transparent',
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: '4px',
                    color: token.colorTextTertiary,
                    cursor: 'pointer',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = token.colorError;
                    e.currentTarget.style.color = token.colorWhite;
                    e.currentTarget.style.borderColor = token.colorError;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = token.colorTextTertiary;
                    e.currentTarget.style.borderColor = token.colorBorderSecondary;
                  }}
                >
                  ✕
                </button>
              )}
              
              <div className={`modal-content-wrapper ${isEditMode ? 'edit-mode' : ''}`}>
                <Suspense fallback={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '200px' 
                  }}>
                    <Spin size="large" />
                  </div>
                }>
                  {item.i === 'position-detail' && <PositionDetailModal position={position} />}
                  {item.i === 'trade-history' && <TradeHistoryModal trades={position.trades} position={position} />}
                  {item.i === 'chart' && <ChartModal position={position} />}
                  {item.i === 'stop-loss' && <StopLossModal position={position} />}
                  {item.i === 'position-memo' && <PositionMemoContent position={position} />}
                </Suspense>
              </div>
            </div>
          ))}
        </GridLayout>
        </div>
      </div>
      
      {contextMenu && (
        <div
          ref={menuRef}
          className="modal-context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 10001,
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorder}`,
            boxShadow: `0 6px 16px ${token.colorBgMask}`,
          }}
        >
          <div 
            className="modal-context-menu-item"
            style={{
              color: token.colorText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = token.colorFillTertiary;
              e.currentTarget.style.color = token.colorPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = token.colorText;
            }}
            onClick={() => {
              toggleModalVisibility('position-detail');
              setContextMenu(null);
            }}
          >
            {modalVisibility['position-detail'] && <CheckOutlined style={{ marginRight: 8 }} />}
            {t('modal.positionDetail')}
          </div>
          <div 
            className="modal-context-menu-item" 
            onClick={() => {
              toggleModalVisibility('trade-history');
              setContextMenu(null);
            }}
          >
            {modalVisibility['trade-history'] && <CheckOutlined style={{ marginRight: 8 }} />}
            {t('modal.tradeHistory')}
          </div>
          <div 
            className="modal-context-menu-item" 
            onClick={() => {
              toggleModalVisibility('chart');
              setContextMenu(null);
            }}
          >
            {modalVisibility['chart'] && <CheckOutlined style={{ marginRight: 8 }} />}
            {t('modal.chart')}
          </div>
          <div 
            className="modal-context-menu-item" 
            onClick={() => {
              toggleModalVisibility('stop-loss');
              setContextMenu(null);
            }}
          >
            {modalVisibility['stop-loss'] && <CheckOutlined style={{ marginRight: 8 }} />}
            {t('modal.stopLoss')}
          </div>
          <div 
            className="modal-context-menu-item" 
            onClick={() => {
              toggleModalVisibility('position-memo');
              setContextMenu(null);
            }}
          >
            {modalVisibility['position-memo'] && <CheckOutlined style={{ marginRight: 8 }} />}
            {t('modal.positionMemo')}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ModalManager;